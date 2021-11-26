import { Logger } from "./logger.js"
import { LoggerSpinner } from "./logger-spinner.js"

export const LOGGER = Symbol("LOGGER")

export class WithLogger {
    private [LOGGER]: Logger

    get logger() {
        return !!this[LOGGER] ? this[LOGGER] : (this[LOGGER] = new LoggerSpinner())
    }

    initLogger(logger: Logger) {
        if(!!this[LOGGER]) return
        this[LOGGER] = logger
    }
}