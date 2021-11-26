import { default as termkit } from "terminal-kit"
const { terminal: term } = termkit

import { LineSpinner, Logger, LoggerSpinner } from "../logger/index.js"
import { TextHelper } from "./text-helper.js"

export interface StepTextInfo {
    prefix?: string
    name?: string
    skipped?: boolean
    triesCount?: number
    triesMax?: number
    parameters?: {[name: string]: any}
    cliTitle?: boolean
    postfix?: string
}

export abstract class StepText {
    logger: Logger
    info: StepTextInfo = {}

    constructor(logger: Logger) {
        this.logger = logger
    }
    update(info: StepTextInfo = {}) {
        Object.assign(this.info, info)
    }

    abstract create(): void

    abstract warn(info?: StepTextInfo): void

    abstract fail(info?: StepTextInfo): void

    abstract succeed(info?: StepTextInfo): void
}

export class StepTextOra extends StepText {
    logger: LoggerSpinner
    line: LineSpinner = null

    constructor(logger: Logger) {
        super(logger)
        if(!(this.logger instanceof LoggerSpinner)) throw new Error("logger not supported")
    }

    create() {
        this.info = {}
        this.line = this.logger.lineSpinner({ // TODO: params?
            //text: "",
            //prefixText:,
            //spinner:,
            //color:,
            //hideCursor:,
            //indent:,
            //interval:,
            //isEnabled:,
            //isSilent:,
        })
        this.line.spinner.start()
        return
    }
    
    update(info?: StepTextInfo) {
        super.update(info)

        if(this.info.cliTitle) term.windowTitle(TextHelper.titleText({  // TODO: +ranTimes
            name: this.info.name, 
            triesCount: this.info.triesCount, 
            triesMax: this.info.triesMax
        })) 

        if(!this.line) return

        this.line.spinner.text = TextHelper.basicText({ 
            prefix: this.info.prefix,
            skipped: this.info.skipped, 
            name: this.info.name, 
            parameters: this.info.parameters,
            triesCount: this.info.triesCount, 
            triesMax: this.info.triesMax, 
            postfix: this.info.postfix
        })
    }

    warn(info: StepTextInfo = {}) {
        this.update(info)
        this.line?.spinner.warn()
    }
    fail(info: StepTextInfo = {}) {
        this.update(info)
        this.line?.spinner.fail()
    }
    succeed(info: StepTextInfo = {}) {
        this.update(info)
        this.line?.spinner.succeed()
    }
}