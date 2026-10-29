class Apierror extends Error {
    statusCode;
    errors;
    success;
    data;
    constructor(statusCode, message = "Something went wrong", errors = [], stack = "") {
        super(message);
        this.statusCode = statusCode;
        this.data = null;
        this.success = false;
        this.errors = errors;
        if (stack) {
            this.stack = stack; //error trace
        }
        else {
            Error.captureStackTrace(this, this.constructor); //if not trace then generate a clean,automatic, stack trace for this errror
        }
    }
}
export { Apierror };
//# sourceMappingURL=Apierror.js.map