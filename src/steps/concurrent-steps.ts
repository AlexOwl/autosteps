import { default as PCancelable } from "p-cancelable"

import { isExecutable } from "../executable.js";
import { Steps } from "./steps.js";

export class ConcurrentSteps extends Steps {
    forceExecute(): PCancelable<any> {
        return new PCancelable((resolve, reject, onCancel) => (async () => {
            let exec: PCancelable<any>
            let cancelled = false
            onCancel(() => (cancelled = true, exec?.cancel()))

            if(isExecutable(this.steps)) return await (exec = this.steps.execute())

            for(const step of this.steps) {
                if(cancelled) break
                await (exec = step.execute())
            }  
        })().then(resolve).catch(reject))
    }
}