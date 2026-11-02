// errorMiddleware.ts
import type { Request, Response, NextFunction } from "express";
import { Apierror } from "../utils/Apierror.js";
import multer from "multer";

export const errorHandler = (
    err: Error | Apierror,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    if (err instanceof multer.MulterError) {
        const statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
        return res.status(statusCode).json({
            success: false,
            message: err.code === "LIMIT_FILE_SIZE" ? "An uploaded file exceeds the 25 MB limit" : err.message,
            errors: [],
            data: null,
        });
    }

    if (err.message.includes("Only JPG")) {
        return res.status(400).json({ success: false, message: err.message, errors: [], data: null });
    }

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