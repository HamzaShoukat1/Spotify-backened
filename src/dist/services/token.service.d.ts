import type { TokenPayLoad } from "../types/types.js";
export declare const generateAccessToken: (payload: TokenPayLoad) => string;
export declare const generateRefreshToken: (payload: TokenPayLoad) => string;
export declare const generateEmailChangeToken: (userId: string) => string;
export declare const verifyEmailChangeToken: (token: string) => TokenPayLoad & {
    purpose?: string;
};
//# sourceMappingURL=token.service.d.ts.map