import { Mixin } from "ts-mixer"
import { default as PCancelable } from "p-cancelable"
import { default as PTimeout } from "p-timeout"

import { WithContext, Context } from "../context.js" 
import { Executable } from "../executable.js"
import { WithOptions, Options } from "../options.js"
import { Logger, WithLogger } from "../logger/index.js"
import { TextHelper } from "./text-helper.js"
import { StepText, StepTextOra } from "./step-text.js"

export const NAME = Symbol("NAME")
export const GET_PROMISE = Symbol("GET_PROMISE")
export const GET_PARAMETERS = Symbol("GET_PARAMETERS")
export const SKIPPED = Symbol("SKIPPED")
export const TEXT = Symbol("TEXT")

export type StepGetPromise = (parameters: {[name: string]: any}, self: Step) => Promise<any>
export type StepGetParameters = (self: Step) => Promise<{[name: string]: any}>

export interface StepParams extends Options {
    getParameters?: StepGetParameters, 
    context?: Context,
    logger?: Logger
}



export abstract class Step extends Mixin(Executable, WithOptions, WithContext, WithLogger) {
    private [SKIPPED] = false
    private [NAME]: string
    private [GET_PROMISE]: StepGetPromise
    private [GET_PARAMETERS]: StepGetParameters
    private [TEXT]: StepText

    get name() {
        return this[NAME]
    }

    get skipped() {
        return this[SKIPPED]
    }

    get text() {
        return this[TEXT]
    }

    protected set skipped(value: boolean) {
        this[SKIPPED] = value
        this.text.update({ skipped: value })
        if(value) this.text.warn()
    }

    constructor(name: string, getPromise: StepGetPromise, { getParameters, context, logger, ...options } : StepParams = { }) {
        super()

        this[NAME] = name
        this[GET_PROMISE] = getPromise
        this[GET_PARAMETERS] = getParameters

        this.init({ options, context, logger })
    }

    init({ options, context, logger }) {
        this.initContext(context)
        this.initOptions(options)
        this.initLogger(logger)

        this[TEXT] = new StepTextOra(this.logger)
    }

    skip() {
        this.skipped = true
    }

    forceExecute(): PCancelable<any> {
        return new PCancelable((resolve, reject, onCancel) => (async () => {
            let cancelled = false
            onCancel(() => (cancelled = true))


            const triesMax = this.options.triesMax

            for(let triesCount = 0; !cancelled && triesCount < triesMax; ++triesCount) {
                this.text.create()

                this.text.update({ cliTitle: this.options.cliTitle, name: this.name })

                this.text.update({ triesCount, triesMax })

                try {
                    this.skipped = false

                    const parameters = await this.getParameters()
                    this.text.update({ parameters })
                    if(this.skipped) return

                    let result = await this.getPromise(parameters)
                    if(this.skipped) return

                    await this._typedExecute({ parameters, result, triesCount })

                    this.text.succeed()
                    return
                } catch(error) {
                    this.text.fail()
                    this.logger.error(TextHelper.errorText(error))
                    // skip
                }
            }
            if(!cancelled && !this.options.captureRejections) throw new Error("Exceed max tries count") // TODO: typed error
        })().then(resolve).catch(reject))
    }

    protected abstract _typedExecute(context: {[name: string]: any}): Promise<void> // rename

    protected async getParameters() {
        const _getParameters = this[GET_PARAMETERS]
        return !!_getParameters ? await _getParameters(this).catch(() => ({})) : {}
    }

    protected async getPromise(parameters: {[name: string]: any}) {
        const _genPromise = this[GET_PROMISE]
        if(!_genPromise) throw new Error("no promise to resolve")
        const promise = _genPromise(parameters, this)
        return await (this.options.timeout >= 0 ? PTimeout(promise, this.options.timeout) : promise)
    }
}
