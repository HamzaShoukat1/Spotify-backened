declare class Apierror extends Error {
    statusCode: number;
    errors: unknown[];
    success: boolean;
    data: any;
    constructor(statusCode: number, message?: string, errors?: unknown[], stack?: string);
}
export { Apierror };
//# sourceMappingURL=Apierror.d.ts.map