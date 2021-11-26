import { default as PCancelable } from "p-cancelable"

import { isExecutable } from "../executable.js";
import { Steps } from "./steps.js";

export class ParallelSteps extends Steps {
    constructor() {
        super(null)

        throw new Error("cannot create parallel steps")
    }

    forceExecute(): PCancelable<any> {
        return new PCancelable((resolve, reject, onCancel) => (async () => {
            const exec: PCancelable<any>[] = []
            onCancel(() => exec?.forEach(exec => exec?.cancel()))

            if(isExecutable(this.steps)) {
                const promise = this.steps.execute()
                return exec.push(promise), await promise
            }
            
            await Promise.all(this.steps.map(step => exec.push(step.execute())))
        })().then(resolve).catch(reject))
    }
 }