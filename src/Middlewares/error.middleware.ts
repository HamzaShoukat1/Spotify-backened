// errorMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import { Apierror } from "../utils/Apierror.js";

export const errorHandler = (
    err: Error | Apierror,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof Apierror) {
        return res.status(err.statusCode).json({
            success: false,
            message: err.message,
            errors: err.errors,
            data: err.data || null,
        });
    }

    console.error(err);
    res.status(500).json({
        success: false,
        message: err.message || "Something went wrong",
        errors: [],
        data: null,
    });
};