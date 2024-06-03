const mongoose = require('mongoose');

const optionSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  imageurl:{
    type:String
  },
  selected:{
    type:Boolean
  }
});

const questionSchema = new mongoose.Schema({
  questionNumber: {
    type: Number,
    required: true
  },
  question: {
    type: String,
    required: true
  },
  optionType: {
    type: String,
    required: true
  },
  options: [optionSchema],
  chosenOption: [
    {type:Number,default:0}
  ],
  correctAttempts: {
    type: Number
  },
  impressions: {
    type: Number
  },
  timer: {
    type: Number
  }
});

module.exports = mongoose.model('Question', questionSchema);
