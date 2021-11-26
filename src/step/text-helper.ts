import chalkTemplate from "chalk-template"
import { default as termkit } from "terminal-kit"
const { terminal: term } = termkit

import { StepTextInfo } from "./step-text"

export abstract class TextHelper {
    static objectText(obj: object) {
        return Object.entries({ ...obj }).map(([key, value]) => term.str.cyan(chalkTemplate`{bold ${key}}: ${typeof value == "object" ? JSON.stringify(value) : value}`)).join(", ")
    }

    static transactionText({ hash, confirmations, confirmationsMax } : { hash: string, confirmations: number, confirmationsMax: number }) {
        return term.str.blue(chalkTemplate`[{bold ${hash}} ${confirmations < confirmationsMax ? confirmations : chalkTemplate`{bold ${confirmations}}`}/{bold ${confirmationsMax}}]`)
    }

    static resultText({ result } : { result: any }) {
        return chalkTemplate`{green -> {bold ${JSON.stringify(result)}}}`
    }

    static skipText({ skipped } : { skipped: boolean }) {
        return skipped && term.str.yellow(`[skip]`)
    } 

    static triesText({ triesCount, triesMax } : { triesCount: number, triesMax: number }) {
        return triesCount > 0 && term.str.yellow(`[${triesCount}/${triesMax}]`)
    }
             
    static nameText({ name, parameters }: { name: string, parameters }) {
        return chalkTemplate`{bold ${name}}(${TextHelper.objectText(parameters)})`
    }

    static titleText({ name, triesCount, triesMax } : { name: string, triesCount: number, triesMax: number }) {
        return [name, triesCount > 0 && `[${triesCount}/${triesMax}`].filter(Boolean).join(" ")
    }

    static errorText(error: Error) {
        return chalkTemplate`{red ${"{"}{bold error: ${error.message}}${"}"}}`
    }

    static basicText({ prefix, skipped, triesCount, triesMax, name, parameters, postfix }: StepTextInfo) {
        return [prefix, TextHelper.skipText({ skipped }), TextHelper.triesText({ triesCount, triesMax }), TextHelper.nameText({ name, parameters }), postfix].filter(Boolean).join(" ")
    }
}