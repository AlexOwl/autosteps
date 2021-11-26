import { Mixin } from "ts-mixer"

import { WithContext, Context } from "../context.js"
import { WithOptions, Options, OPTIONS_REAL } from "../options.js"
import { Executable } from "../executable.js"
import { Step } from "../step/index.js"
import { Logger, WithLogger } from "../logger/index.js"

export const STEPS = Symbol("STEPS")

export interface StepsParams extends Options { 
    context?: Context,
    logger?: Logger
}

export abstract class Steps extends Mixin(Executable, WithOptions, WithContext, WithLogger) {
    private [STEPS]: (Step[] | Steps)

    constructor(steps: (Step[] | Steps), { context, logger, ...options } : StepsParams = { }) {
        super()

        this[STEPS] = steps

        this.init({ context, options, logger })
    }

    init({ options, context, logger }) {
        this.initOptions(options)
        this.initContext(context)
        this.initLogger(logger)

        options = this[OPTIONS_REAL]
        context = this.context
        logger = this.logger

        if(isSteps(this.steps))
            return this.steps.init({ options, context, logger })

        for(const child of this.steps)
            child.init({ options, context, logger })
    }

    get steps() {
        return this[STEPS]
    }
}

function isSteps(object: Steps | Step[]): object is Steps {
    return !Array.isArray(object)
}