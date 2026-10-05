import  type{  Request,Response,NextFunction,RequestHandler } from "express"



const asynchandler = (reqhandler:RequestHandler)=> {
  return (req: Request,res:Response,next:NextFunction)=> {
    Promise.resolve(reqhandler(req,res,next)).catch((error)=> next(error))

  }

}
export {asynchandler} 