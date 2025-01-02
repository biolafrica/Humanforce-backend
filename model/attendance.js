const mongoose = require("mongoose");
const { type } = require("os");

const attendanceSchema = new mongoose.Schema({
  staff_code:{
    type : String
  }, 
  clock_in:{
    type:Date,
    default: Date.now,
  },
  clock_out:{
    type : Date,
    default: 0
  }, 
  break_start:{
    type : Date,
    default : 0
  }, 
  break_end:{
    type : Date,
    default : 0
  }, 
  hours:{
    type : Number,
    default : 0
  }, 
  status:{
    type : String,
    default : ""
  }, 
  late_fine:{
    type : Number,
    default : 0
  },
  createdAt:{
    type:Date,
    default: Date.now,
  }
  
})


module.exports = mongoose.model ("Attendance", attendanceSchema);