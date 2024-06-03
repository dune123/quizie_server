const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

const Quiz = require("../models/quiz");
const Question = require("../models/question");
const User = require("../models/user");

// Error handler middleware
const errorHandler = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "Internal Server Error" });
};

const createQuiz = async (req, res, next) => {
  try {
    const { name, questions, quizType } = req.body;

    // Check if quizType is provided
    if (!quizType) {
      return res.status(400).json({ message: "quizType is required" });
    }

    //check quiz name size
    if (name.length > 20) {
      return res
        .status(400)
        .json({ message: "Quiz name not be greater than 20 charecters" });
    }
    //check for name
    const isNameExists = await Quiz.findOne({ name });

    if (isNameExists) {
      return res.status(400).json({ message: "This name already exists" });
    }
    // Check if questions are provided and is an array
    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ message: "questions are required" });
    }

    // Create Question objects and save them
    const questionObjects = await Promise.all(
      questions.map(async (questionData, index) => {
        const question = new Question({
          questionNumber: index + 1,
          question: questionData.question,
          optionType: questionData.optionType,
          options: questionData.options,
          timer: questionData.timer,
          impressions: 0,
          correctAttempts: 0,
        });
        return await question.save();
      })
    );

    // Create a new Quiz document
    const quiz = new Quiz({
      name,
      questions: questionObjects.map((question) => question._id),
      postedBy: req.user,
      quizType,
      impressions: 0,
    });

    // Save the Quiz document
    const savedQuiz = await quiz.save();

    //save the quiz id under user
    const finduser = await User.findById(req.user);
    finduser.quizies.push(savedQuiz._id);
    await finduser.save();

    res
      .status(201)
      .json({ message: "Quiz created successfully", quizId: savedQuiz._id });
  } catch (error) {
    errorHandler(res, error); // Pass the error to the next middleware for error handling
  }
};

const editQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const { questions } = req.body;

    const existingQuiz = await Quiz.findById(quizId);

    await Question.deleteMany({ _id: { $in: existingQuiz.questions } });

    const QuestionObject = questions.map((ques, index) => {
      return new Question({
        questionNumber: index + 1,
        question: ques.question,
        optionType: ques.optionType,
        options: ques.options,
        answer: ques.answer,
        timer: ques.timer,
        correctAttempts:0,
        chosenOption:[]
      });
    });

    const createQuestion = await Question.create(QuestionObject);

    existingQuiz.questions = createQuestion.map((ques) => ques._id);

    await existingQuiz.save();
    res.status(200).json({ message: "Post updated successfully" });
  } catch (error) {
    errorHandler(res, error);
  }
};

const deleteQuiz = async (req, res) => {
  try {
    const { quizId } = req.params;

    const existingQuiz = await Quiz.findById(quizId);

    if (!existingQuiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }
    const selectedQuestion = existingQuiz.questions;

    await Question.deleteMany({ _id: { $in: selectedQuestion } });

    await Quiz.findByIdAndDelete(quizId);

    res.status(200).json({ message: "Quiz is been deleted" });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getImpressions = async (req, res) => {
  try {
    const quizId = req.params.quizId;
    const quiz = await Quiz.findById(quizId);

    if (!quiz) {
      return res.status(404).json({ message: "Quiz not found" });
    }

    // Increment the impressions field
    quiz.impressions = (quiz.impressions || 0) + 1;
    await quiz.save();

    res.status(200).json({ quiz: quiz });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "internal server error" });
  }
};

const getAllQuiz = async (req, res) => {
  try {
    const { userId } = req.params;

    const getallquiz = await User.findById(userId).populate("quizies");

    if (!getallquiz) {
      return res.status(404).json({ message: "no quiz is available" });
    }

    res.status(200).json({ getallquiz: getallquiz.quizies });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getQuesByQuizId = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).populate("questions");
    if (!quiz) {
      return res.status(401).json({ message: "Quiz not found" });
    }
    await quiz.save();
    return res.status(200).json({ question: quiz.questions });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getQuesQuizId = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).populate("questions");
    const findquiz = await Quiz.findById(quizId);
    const qType = findquiz.quizType;
    if (!quiz) {
      return res.status(401).json({ error: "Quiz not found" });
    }
    await quiz.save();
    return res.status(200).json({ question: quiz.questions, quizType: qType });
  } catch (error) {
    errorHandler(res, error);
  }
};

const getQuesByQuizIdwithoutAuth = async (req, res) => {
  try {
    const { quizId } = req.params;
    const quiz = await Quiz.findById(quizId).populate("questions");
    const findquiz = await Quiz.findById(quizId);
    const qType = findquiz.quizType;
    if (!quiz) {
      return res.status(401).json({ error: "Quiz not found" });
    }
    quiz.impressions ++;
    await quiz.save();
    return res.status(200).json({ question: quiz.questions, quizType: qType });
  } catch (error) {
    errorHandler(res, error);
  }
};

const quizScoreCheck = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { answer } = req.body;

    const quiz = await Quiz.findById(quizId).populate("questions");
    const questions = quiz.questions;
    const quizType = quiz.quizType;

    let score = 0;
    
    console.log(answer)
    if (quizType === "q&a") {
      await Promise.all(
        questions.map(async (ques, i) => {
          const options = ques.options;
          if (typeof ques.impressions !== "number" || ques.impressions < 0) {
            ques.impressions = 0;
          }
          ques.impressions += 1;
          if (options) {
            if (answer[i] !== null&&i<answer.length && options[answer[i]].selected === true) {
              score++;
            }
          }

          // Ensure correctAttempts is a number
          if (typeof ques.correctAttempts !== "number") {
            ques.correctAttempts = 0;
          }

          // Increment correctAttempts if the answer is correct
          if (answer[i] !== null&&i<answer.length && options[answer[i]].selected === true) {
            ques.correctAttempts += 1;
            console.log("Correct attempt")
          }
          
          await ques.save();
        })
      );  
      
      return res.status(200).json({ score });
    } else {
      let i = 0;
      questions.forEach(async (ques) => {
        // Ensure impressions is a valid number and increment it
        if (typeof ques.impressions !== "number" || ques.impressions < 0) {
          ques.impressions = 0;
        }
        ques.impressions += 1;
      
        // Check if the answer is not null and update the chosenOption array
        if (answer[i] !== null) {
          if (typeof ques.chosenOption[answer[i]] !== "undefined") {
            ques.chosenOption[answer[i]]++;
          } else {
            ques.chosenOption[answer[i]] = 1;
          }
        }
      
        i++;
      
        // Save the question
        await ques.save();
      });
      
      return res.status(200).json({ message: "Quiz updated successfully" });
    }
  } catch (error) {
    errorHandler(res, error);
  }
};

module.exports = {
  createQuiz,
  editQuiz,
  deleteQuiz,
  getImpressions,
  getAllQuiz,
  getQuesByQuizId,
  quizScoreCheck,
  getQuesByQuizIdwithoutAuth,
  getQuesQuizId,
};
