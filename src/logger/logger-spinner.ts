import { Options as OraOptions } from "ora"

import { LineSpinner } from "./line-spinner.js"
import { Logger } from "./logger.js"

export const FN = Symbol("FN")
export const FN_ERROR = Symbol("FN_ERROR")
export const LINES = Symbol("LINES")
export const LOG = Symbol("LOG")

type fn = (...args: any[]) => void

export class LoggerSpinner extends Logger {
    private [FN]: fn
    private [FN_ERROR]: fn

    private [LINES]: LineSpinner[] = []

    get lastLine() {
        return this[LINES].length > 0 ? this[LINES][this[LINES].length - 1] : null
    }

    get isDone() {
        const lastLine = this.lastLine

        return !lastLine || lastLine.isDone
    }

    oraOptions?: string | OraOptions

    constructor({ fn, fnError, ora } : { fn?: fn, fnError?: fn, ora?: string | OraOptions } = {}) {
        super()

        this[FN] = fn || console.log
        this[FN_ERROR] = fnError || console.error

        this.oraOptions = ora
    }

    lineSpinner(options?: string | OraOptions) {
        if(!this.isDone) throw new Error("cannot create spinner line if last line is not done")

        const lineSpinner = new LineSpinner(Object.assign({}, options, this.oraOptions))
        this[LINES].push(lineSpinner)
        return lineSpinner
    }

    protected [LOG](fn: fn = null, ...args: any[]) {
        if(!!fn) fn = console.log
        this.lastLine.pause()
        fn(...args)
        this.lastLine.resume()
    }

    log(...args: any[]) {
        this[LOG](this[FN], ...args)
    }

    error(...args: any[]) {
        this[LOG](this[FN_ERROR], ...args)
    }
}

