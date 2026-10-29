import type { Request, Response, NextFunction } from "express";
import { Apierror } from "../utils/Apierror.js";
export declare const errorHandler: (err: Error | Apierror, req: Request, res: Response, next: NextFunction) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=error.middleware.d.ts.map