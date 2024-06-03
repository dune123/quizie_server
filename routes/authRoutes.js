const express=require('express')
const requireAuth = require('../middleware/requireAuth');
const { registerUser, loginUser, logout, getAllQuizInfoByUser } = require('../controller/Auth');


const router=express.Router();
router.post("/register",registerUser)
router.post("/login",loginUser)
router.post("/logout",requireAuth,logout)
router.get("/getquizinfo/:userId",requireAuth,getAllQuizInfoByUser)

module.exports=router;