export interface Options {
    triesMax?: number
    captureRejections?: boolean 
    timeout?: number 
    cliTitle?: boolean
    transactionConfirms?: number
    transactionTimeout?: number
}

export const OPTIONS = Symbol("OPTIONS")
export const OPTIONS_REAL = Symbol("OPTIONS_REAL")
export const OPTIONS_DEFAULTS = Symbol("OPTIONS_DEFAULTS")

export class WithOptions {
    private static [OPTIONS_DEFAULTS]: Options = {
        triesMax: 1,
        captureRejections: false,
        timeout: -1,
        cliTitle: true,
        transactionConfirms: 1,
        transactionTimeout: -1
    }

    private [OPTIONS_REAL]: Options = {
        triesMax: null,
        captureRejections: null,
        timeout: null,
        cliTitle: null,
        transactionConfirms: null,
        transactionTimeout: null
    }

    private [OPTIONS] = new Proxy(this[OPTIONS_REAL], {
        get(target: Options, name: string) {
            return target[name] ?? (Object.getOwnPropertyNames(WithOptions[OPTIONS_DEFAULTS]).includes(name) ? WithOptions[OPTIONS_DEFAULTS][name] : null)
        },

        set(target: Options, name: string, value: any) {
            if(target[name] !== null) {
                //console.log("property already set", target, name)
                return true
            }
            if(value === null) {
                //console.log("cannot set null", target, name)
                return true
            }
            target[name] = value
            return true
        }
    })

    get options() {
        return this[OPTIONS]
    }

    initOptions(options: Options = { }) {
        for(const [name, value] of Object.entries(options))
            this.options[name] = value
    }
}