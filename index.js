const express=require('express')
const bodyParser=require('body-parser')
const mongoose=require('mongoose')
const dotenv=require('dotenv')
const cors=require('cors')
dotenv.config()

//import routes
const authRoutes=require("./routes/authRoutes")
const quizRoutes=require("./routes/quizRoutes")
const quesRoutes=require("./routes/questionRoutes")

const app=express()
const corsOptions = {
    origin: 'http://localhost:5173', // Replace this with the origin of your client application
    credentials: true // Allow cookies or HTTP authentication to be included in the request
  };

app.use(
    cors(
      corsOptions
    )
)
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//routes
app.use("/api/auth",authRoutes);
app.use("/api/quiz",quizRoutes);
app.use("/api/question",quesRoutes);

app.listen(process.env.PORT,()=>{
    console.log(`listening on ${process.env.PORT}`)
    mongoose.connect(process.env.MONGO_URL,{
        useNewUrlParser: true,
        useUnifiedTopology: true,
        dbName:"Quizie"
    })
    .then(()=>{
        console.log("Connnected to the databases")
    })
    .catch((err)=>{
        console.log(err);
    })
})