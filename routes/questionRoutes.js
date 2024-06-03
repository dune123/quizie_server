const express=require('express');
const { getQuestionWithQuizId, getImpressions, answerCheck, optionsChosen } = require('../controller/questionController');
const router=express.Router();

router.get("/getQuestion/:quesId",getQuestionWithQuizId)
router.get("/getImpression/:quesId",getImpressions)
router.post("/checkAns/:quesId",answerCheck)
router.post("/optionChosen/:quesId",optionsChosen)

module.exports=router;