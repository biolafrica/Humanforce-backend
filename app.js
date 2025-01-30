require("dotenv").config();

const express = require("express");
const { default: mongoose } = require("mongoose");
const adminRouter = require("./route/adminRoute");
const userRouter = require("./route/userRoute");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const {autoClockOutJob, autoSendPayrollEmail} = require("./Middleware/automation");



//setup express app
const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(cookieParser());

//setup cors 
app.use(
  cors({
    origin: "http://localhost:3000",
    methods : ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials : true,
  })
);
// app.use(cors());

//connect to database
const URI = process.env.mongoDB_URI;
mongoose.connect(URI)
.then(result => console.log('connected to the database'))
.catch(error => console.log(error));

//Start server
const PORT = process.env.PORT;
app.listen(PORT, ()=>{
  console.log(`connected to server on port ${PORT}`)
})

//schedule clock out by 10pm
cron.schedule("55 11 * * *", ()=>{
  autoClockOutJob();
})

cron.schedule("0 0 * * *", ()=>{
  autoSendPayrollEmail();
})

//Route management
app.use("/admin", adminRouter);
app.use(userRouter);


