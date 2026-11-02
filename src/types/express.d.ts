
import type { User } from "../Models/user.model";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export {};
