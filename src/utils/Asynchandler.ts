import type { NextFunction, Response } from "express";
import type { AuthenticatedRequest } from "../types/express-request.js";

type AsyncRequestHandler = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => unknown;

const asynchandler = (reqhandler: AsyncRequestHandler) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    Promise.resolve(reqhandler(req, res, next)).catch(next);
  };
};

export { asynchandler };
