

class Apierror extends Error {
  statusCode: number
  errors: unknown[]
  success: boolean
  data: any
  constructor(
    statusCode: number,
    message: string = "Something went wrong",
    errors: unknown[] = [],
    stack:string = "",

  ){
    super(message)
    this.statusCode = statusCode
    this.data = null
    this.success = false
    this.errors = errors
    
    if(stack){
      this.stack = stack //error trace
    } else{
      Error.captureStackTrace(this,this.constructor) //if not trace then generate a clean,automatic, stack trace for this errror
    }

  }
}
export {Apierror}