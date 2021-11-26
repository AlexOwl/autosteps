import { Transaction, providers } from "ethers"
import { default as PTimeout } from "p-timeout"

import { Step, StepParams } from "./step.js"
import { TextHelper } from "./text-helper.js"

export type StepGetTransaction = (params: {[name: string]: any}) => Promise<Transaction>

export class TransactionStep extends Step {
    constructor(name: string, getTransaction: StepGetTransaction, stepParams?: StepParams) {
        super(name, getTransaction, stepParams)
    }

    protected async _typedExecute({ result: transaction }: { result: providers.TransactionResponse }) {
        this.text.update({ 
            postfix: TextHelper.transactionText({ 
                hash: transaction.hash, 
                confirmations: transaction.confirmations, 
                confirmationsMax: this.options.transactionConfirms
            }) 
        })

        const promise = transaction.wait(this.options.transactionConfirms)
        const receipt = await (this.options.transactionTimeout >= 0 ? PTimeout(promise, this.options.transactionTimeout) : promise)

        this.text.update({ 
            postfix: TextHelper.transactionText({ 
                hash: receipt.transactionHash, 
                confirmations: receipt.confirmations, 
                confirmationsMax: this.options.transactionConfirms
            }) 
        })
    }
}