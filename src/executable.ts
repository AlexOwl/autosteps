import { default as PCancelable } from "p-cancelable"

export const EXECUTING = Symbol("EXECUTING")

export abstract class Executable {
    private [EXECUTING]: PCancelable<any> = null

    abstract forceExecute(): PCancelable<any>

    execute(): PCancelable<any> {
        if(this[EXECUTING] && !this[EXECUTING].isCanceled) throw new Error("executing") // TODO: typed error

        const executing = this[EXECUTING] = this.forceExecute()
        executing.finally(() => (this[EXECUTING] = null))
        return executing
    }

    cancel(): void {
        if(this[EXECUTING] && !this[EXECUTING].isCanceled) return
        this[EXECUTING].cancel()
    }

    preventTermKill() {
        process.on("SIGTERM", () => this.cancel())
        process.on("SIGINT", () => this.cancel())
    }
}

export function isExecutable(object: any): object is Executable {
    return (object as Executable).execute !== undefined
}