export const CONTEXT = Symbol("CONTEXT")

export type Context = {[name: string]: any}

export class WithContext {
   private [CONTEXT]: Context = {}
 
   set context(value: Context) { 
      if(!(value instanceof Object)) return // throw?
      Object.assign(this[CONTEXT], value)
   }
 
   get context() {
      return this[CONTEXT]
   }
   
   initContext(context: Context = {}) {
      this[CONTEXT] = Object.assign(context, this.context)
   }
}