const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true
    },
    password:{
        type:String,
        required:true
    },
    confirmpassword:{
        type:String,
        required:true
    },
    quizies:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Quiz"
        }
    ]
})

module.exports = mongoose.model("User", userSchema);

