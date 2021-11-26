import { Ora } from "ora"

import { Step } from "./step.js"
import { TextHelper } from "./text-helper.js"

export class PromiseStep extends Step {
    protected async _typedExecute({ result }: { result: any; spinner: Ora }) {
        if(result === true) return

        this.text.update({ 
            postfix: TextHelper.resultText({ result }) 
        })
    }
}