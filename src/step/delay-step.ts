import delay from "delay"
import { Ora } from "ora"

import { Step, StepParams } from "./step.js"

export const GET_DELAY = Symbol("GET_DELAY")

export type StepGetDelay = (parameters: {[name: string]: any}, self: Step) => Promise<number>

export class DelayStep extends Step {
    [GET_DELAY]: StepGetDelay

    constructor(name: string, getDelay?: StepGetDelay, stepParams?: StepParams) {
        super(name, async ({ delay: paramsDelay = 0 } = {}) => delay(paramsDelay), stepParams)

        this[GET_DELAY] = getDelay
    }

    protected async getParameters() {
        const parameters = await super.getParameters()
        
        const getDelay = this[GET_DELAY]
        const delay = !!getDelay ? await getDelay(parameters, this).catch(() => 0) : 0 // TODO: skip?

        return Object.assign(parameters, { delay })
    }

    protected async _typedExecute({}: { parameters: { [name: string]: any }; result: any; spinner: Ora }) {
    }
}