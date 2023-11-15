import express from 'express'
import { registerUser,loginUser,getuserbyId,resetPassword,resetPasswordpage} from '../Controllers/user.controller.js'
import authMiddleware from '../Middleware/auth.middleware.js'

const router=express.Router()

router.post("/register",registerUser)
router.post("/login",loginUser)
router.get("/getuser",authMiddleware,getuserbyId)
router.post('/resetpassword', resetPassword);   
router.post('/resetpasswordpage',resetPasswordpage);

export default router