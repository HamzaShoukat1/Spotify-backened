import { Router } from "express";
import { changeUsername, completeOnboarding, getCurrentUser, Logout, Signin, SignUp } from "../Controllers/Auth.controller.js";
import { verifyjwt } from "../Middlewares/auth.middleware.js";
import { confirmEmailChange, requestCurrentEmailOtp, requestNewEmailOtp, verifyCurrentEmailOtp } from "../Controllers/EmailChange.Controller.js";
// import { verifyjwt } from "../Middlewares/auth.middleware.js";

const router = Router()

router.route("/signup").post(SignUp)

router.route("/login").post(Signin)

router.route("/currentUser").get(verifyjwt, getCurrentUser)
router.route("/onboarding").patch(verifyjwt, completeOnboarding)
// router.get(
//     "/all-users",
//     verifyjwt,
//     verifyAdmin,
//     getAllUsers
// );
router.route("/logout").post(verifyjwt, Logout)
router.route("/changeusername").patch(verifyjwt,changeUsername)
router.route("/email-change/current/request").post(verifyjwt, requestCurrentEmailOtp)
router.route("/email-change/current/verify").post(verifyjwt, verifyCurrentEmailOtp)
router.route("/email-change/new/request").post(verifyjwt, requestNewEmailOtp)
router.route("/email-change/new/verify").post(verifyjwt, confirmEmailChange)




export default router