import { Router } from "express"
import { search } from "../Controllers/Search.Controller.js"



const router = Router()


router.route("/spotify").get(search)

export default router