// import { IUser } from './Models.Types'; 
import { User } from "../Models/user.model.ts";

declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

export { };