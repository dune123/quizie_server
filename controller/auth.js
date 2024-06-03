const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
dotenv.config();

const User = require("../models/user");
const Quiz = require("../models/quiz");

// Error handler middleware
const errorHandler = (res, error) => {
  console.error(error);
  res.status(500).json({ error: "Internal Server Error" });
};

//Register
const registerUser = async (req, res, next) => {
  try {
    const { username, email, password, confirmpassword } = req.body;
    
    if(username.length<6){
      return res.status(400).json({errorType:"username",message:"Invalid username"})
    }
    if (!username || !email || !password || !confirmpassword) {
      return res.status(400).json({errorType:"emptyField", message: "this field is required" });
    }

    if(password.trim().length<8){
      return res.status(400).json({errorType:"password",message:"Invalid password"})
    }

    const specialCharacters = ['!', '@', '#', '$', '%', '^', '&', '*', ',', '.', '?'];
    
    const chrec='!@#$%^&*,.?'
    let isInclude=false;
    for(let char of password){
      if(specialCharacters.includes(char)){
         isInclude=true;
         break;
      }
      else{
        isInclude=false;
      }
    }
    if(!isInclude){
      return res.status(400).json({errorType:"password",message:`password must contain ${chrec}`})
    }
    const existingUser = await User.find({ username });

    if (existingUser.length > 0) {
      return res.status(409).json({ errorType:"username",message: "Invalid username" });
    }

    if (password !== confirmpassword) {
      return res
        .status(400)
        .json({errorType:"confirmpassword",message: "confirm password and password not match" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const hashedConfirmPassword = await bcrypt.hash(confirmpassword, 10);
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      confirmpassword: hashedConfirmPassword,
    });

    await newUser.save();

    res.json({ message: "User created" });
  } catch (error) {
    errorHandler(res, error);
  }
};

//Login
const loginUser = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res
        .status(400)
        .json({ message: "Username and password is required" });
    }

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(400).json({ message: "Invalid username or password" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(400).json({ message: "Invalid username or password" });
    }

    const token = jwt.sign(
      {
        user: user._id,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      userId: user._id,
      username: user.username,
    });
  } catch (error) {
    errorHandler(res, error);
  }
};

// logout
const logout = async (req, res) => {
  try {
    const { username } = req.body;

    const user = User.find({ username });
    const token = jwt.sign(
      {
        user: user.username,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: 0 }
    );

    res.json({ success: true, token, user: user.username });
  } catch (error) {
    errorHandler(res, error);
  }
};

//get all the quizes and question you have created
const getAllQuizInfoByUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const userIdObject =new mongoose.Types.ObjectId(userId);
    const quizCount = await Quiz.countDocuments({ postedBy: userIdObject });

    const userQuizzes = await Quiz.aggregate([
      {
        $match: { postedBy:new mongoose.Types.ObjectId(userId) }
      }, 
      {
        $lookup: {
          from: 'questions',
          localField: 'questions',
          foreignField: '_id',
          as: 'questions'
        }
      },
      {
        $project: {
          name: 1,
          quizType: 1,
          createdAt: 1,
          questions: 1,
          impressions:1,
        }
      },
      {
        $sort: { impressions: -1 } // Sort by impressions in descending order
      }
    ]);
    
    let total=0;
    let totalImpression=0;
    userQuizzes.map((eachQues,index)=>{
        total+=eachQues.questions.length
        totalImpression+=eachQues.impressions;
    })

    return res.json({ quizCount:quizCount,
                      totalQ:total,
                      totalImpression:totalImpression,
                      userQuizzes:userQuizzes,
    });
  } catch (error) {
    errorHandler(res, error); // Use your error handler function
  }
};

module.exports = {
  registerUser,
  loginUser,
  logout,
  getAllQuizInfoByUser,
};
