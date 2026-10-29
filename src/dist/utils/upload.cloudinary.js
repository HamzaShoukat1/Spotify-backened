// src/utils/uploadCloudinary.ts
import { Readable } from "stream";
import cloudinary from "../config.js";
export const uploadCloudinary = (buffer, folder = "ecommerce/products") => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({
            folder,
            resource_type: "auto",
        }, (error, result) => {
            if (error) {
                reject(error);
                return;
            }
            if (!result) {
                reject(new Error("Cloudinary upload failed"));
                return;
            }
            resolve({
                url: result.secure_url,
                publicId: result.public_id,
            });
        });
        Readable.from(buffer).pipe(stream);
    });
};
//# sourceMappingURL=upload.cloudinary.js.map