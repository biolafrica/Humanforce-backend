require("dotenv").config();
const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cron = require("node-cron");
const {autoClockOutJob, autoSendPayrollEmail} = require("./Middleware/automation");


const adminRouter = require("./route/adminRoute");
const userRouter = require("./route/userRoute");


//setup express app
const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(bodyParser.json());
app.use(cookieParser());


//setup cors 
const origin = process.env.origin;
app.use(
  cors({
    origin,
    methods : ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials : true,
  })
);


//connect to database
const URI = process.env.mongoDB_URI;
mongoose.connect(URI)
.then(()=> console.log('connected to the database'))
.catch(error => console.log(error));

const clientBuildPath = path.join(__dirname, "build");
app.use(express.static(clientBuildPath));


//Route management
app.use("/admin", adminRouter);
app.use(userRouter);

app.get("*", (req, res)=>{
  res.sendFile(path.join(clientBuildPath, "index.html"), (err) =>{
    if(err){
      res.status(500).send("Error loading react app");
    }
  });
});

//Start server
const PORT = process.env.PORT;
app.listen(PORT, ()=>{
  console.log(`connected to server on port ${PORT}`)
})

//schedule clock out by 11pm
cron.schedule("0 23 * * *", ()=>{
  autoClockOutJob();
})

cron.schedule("0 0 * * *", ()=>{
  autoSendPayrollEmail();
})
