import EventEmitter from "events"
import { default as PCancelable } from "p-cancelable"

import { isExecutable } from "../executable.js"
import { Step } from "../step/index.js"
import { ConcurrentSteps } from "./concurrent-steps.js"
import { Steps, StepsParams } from "./steps.js"

export const EVENT_EMITTER = Symbol("EVENT_EMITTER")
export const EXECUTION_EVENT_NAME = "execution"
export type ExecutionEventArgs = { repeats: number, repeated: number }

export class RepeatSteps extends Steps {
    repeats: number
    private [EVENT_EMITTER] = new EventEmitter({ captureRejections: true })

    constructor(steps: (Step[] | Steps), { repeats, onExecution, ...stepsParams } : { 
        repeats?: number, 
        onExecution?: (args: ExecutionEventArgs) => any 
    } & StepsParams = { repeats: 1, onExecution: () => {} }) {
        super(steps, stepsParams)

        this.repeats = repeats
        this.onExecution(onExecution)
    }

    onExecution(listener: (args: ExecutionEventArgs) => void): this {
        this[EVENT_EMITTER].on(EXECUTION_EVENT_NAME, listener)
        return this
    }
    onceExecution(listener: (args: ExecutionEventArgs) => void): this {
        this[EVENT_EMITTER].once(EXECUTION_EVENT_NAME, listener)
        return this
    }
    offExecution(listener: (args: ExecutionEventArgs) => void): this {
        this[EVENT_EMITTER].off(EXECUTION_EVENT_NAME, listener)
        return this
    }
    listenersExecution(): Function[] {
        return this[EVENT_EMITTER].listeners(EXECUTION_EVENT_NAME)
    }
    private emitExecution(args: ExecutionEventArgs): boolean {
        return this[EVENT_EMITTER].emit(EXECUTION_EVENT_NAME, args)
    }

    forceExecute(): PCancelable<any> {
        return new PCancelable((resolve, reject, onCancel) => (async () => {
            let exec: PCancelable<any>
            let cancelled = false
            onCancel(() => (cancelled = true, exec?.cancel()))

            const steps = isExecutable(this.steps) ? this.steps : new ConcurrentSteps(this.steps)
            const repeats = this.repeats
            
            for(let repeated = 0; !cancelled && repeated < repeats; ++repeated) {
                this.emitExecution({ repeated, repeats })
                await (exec = steps.execute())
            }
        })().then(resolve).catch(reject))
    }
}
