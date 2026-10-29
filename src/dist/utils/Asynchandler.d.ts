import type { Request, Response, NextFunction, RequestHandler } from "express";
declare const asynchandler: (reqhandler: RequestHandler) => (req: Request, res: Response, next: NextFunction) => void;
export { asynchandler };
//# sourceMappingURL=Asynchandler.d.ts.map