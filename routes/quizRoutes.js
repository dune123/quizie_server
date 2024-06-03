const express=require('express')
const requireAuth = require('../middleware/requireAuth');
const { createQuiz, editQuiz, deleteQuiz, getImpressions, getAllQuiz, getQuesQuizId,quizScoreCheck,getQuesByQuizIdwithoutAuth } = require('../controller/quizController');


const router=express.Router();
router.post("/addQuiz",requireAuth,createQuiz)
router.put("/editQuiz/:quizId",requireAuth,editQuiz)
router.delete("/deleteQuiz/:quizId",requireAuth,deleteQuiz)
router.get("/getImpression/:quizId",requireAuth,getImpressions)
router.get("/getallquiz/:userId",requireAuth,getAllQuiz)
router.get("/getallquizbyquizId/:quizId",requireAuth,getQuesQuizId)
router.get("/getQuiz/:quizId",getQuesByQuizIdwithoutAuth)
router.post("/quizScore/:quizId",quizScoreCheck)

module.exports=router;