const Question = require("../models/question");

const errorHandler = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "Internal Server Error" });
};

const getQuestionWithQuizId = async (req, res) => {
  try {
    const { quesId } = req.params;

    const getQues = Question.findById(quesId);

    res.status(200).json({ question: getQues });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getImpressions = async (req, res) => {
  try {
    const quesId = req.params.quesId;
    const question = await Question.findById(quesId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    // Increment the impressions field
    question.impressions = (question.impressions || 0) + 1;
    await question.save();

    res.status(200).json({ question: question });
  } catch (error) {
    errorHandler(res, error);
  }
};

const answerCheck = async (req, res) => {
  try {
    const { answer } = req.body;

    const { quesId } = req.params;

    const question = await Question.findById(quesId);

    const options=question.options;
    

    for(let i=0; i<options.length; i++) {
        if(options[i].selected==true&&answer==i+1){
          question.correctAttempts = question.correctAttempts + 1;
          return res.status(200).json({
            checkAnwer: true,
          });
        }
    }

    return res.status(200).json({
      checkAnwer: false,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

const optionsChosen = async (req, res) => {
  try {
    const { option } = req.body;
    const { quesId } = req.params;

    const question = await Question.findById(quesId);

    if (!question) {
      return res.status(404).json({ message: "Question not found" });
    }

    if (!Array.isArray(question.chosenOption)) {
      question.chosenOption = [];
    }

    while (question.chosenOption.length < option) {
      question.chosenOption.push(0);
    }

    question.chosenOption[option - 1] += 1;

    await question.save();

    res.status(200).json({ message: "Option chosen successfully" });
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  getQuestionWithQuizId,
  getImpressions,
  answerCheck,
  optionsChosen,
};
