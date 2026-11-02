
declare namespace Express {
  export interface Request {
    user?: import("../Models/user.model").User;
  }
}