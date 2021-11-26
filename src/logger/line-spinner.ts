import ora, { Ora, Options as OraOptions } from "ora"

export const RUNNING_SPINNER = Symbol("RUNNING_SPINNER")
export const DONE = Symbol("DONE")

export class LineSpinner {
    private [RUNNING_SPINNER]: Ora
    private [DONE] = false

    get spinner() {
        return this[RUNNING_SPINNER]
    }

    get isDone() {
        return this[DONE]
    }

    pause() {
        this.spinner.clear()
        this.spinner["isSilent"] = true
    }

    resume() {
        this.spinner["isSilent"] = false
        this.spinner.render()
    }

    constructor(options?: string | OraOptions) {
        const spinner = ora(options)

        const self = this

        self[RUNNING_SPINNER] = new Proxy(spinner, {
            get(target: Ora, name: string) {
                switch(name) {
                    case "start":
                        if(self.isDone) throw new Error("ora cannot be used again")
                        break
                    case "stop":
                    case "succeed":
                    case "fail":
                    case "warn":
                    case "info":
                    case "stopAndPersist":
                        self[DONE] = true
                        break
                }
                return target[name]
            }
        })
    }
}

