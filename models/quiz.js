const mongoose = require('mongoose');

const quizSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    questions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Question"
        }
    ],
    createdAt: {
        type: Date,
        default: Date.now
    },
    quizType: {
        type: String,
        required: true
    },
    postedBy:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    impressions:{
        type:Number
    }
});

module.exports = mongoose.model("Quiz", quizSchema);
