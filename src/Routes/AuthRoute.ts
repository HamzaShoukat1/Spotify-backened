import { Router } from "express";
import { getCurrentUser, Logout, Signin, SignUp } from "../Controllers/Auth.controller.js";
import { verifyjwt } from "../Middlewares/auth.middleware.js";
// import { verifyjwt } from "../Middlewares/auth.middleware.js";

const router = Router()

router.route("/signup").post(SignUp)

router.route("/login").post(Signin)

router.route("/currentUser").get(verifyjwt, getCurrentUser)
// router.get(
//     "/all-users",
//     verifyjwt,
//     verifyAdmin,
//     getAllUsers
// );
router.route("/logout").post(verifyjwt, Logout)




export default router