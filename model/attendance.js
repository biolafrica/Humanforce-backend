const mongoose = require("mongoose");
const { type } = require("os");
const Business = require ("./businessModel")

const attendanceSchema = new mongoose.Schema({
  staff_id:{
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

attendanceSchema.pre("save", async function(next){
  try {
    const businessPolicy = await Business.findOne();
    const breakHour = businessPolicy?.break_hours || 0.5 ;

    if(!this.clock_out) return next();

    const clock_out = new Date(this.clock_out)
    const clock_in = new Date(this.clock_in)

    const break_start = this.break_start === 0 ? null : new Date(this.break_start);
    const break_end  = this.break_end === 0 ? null : new Date(this.break_end);

    const totalTimeInHours = (clock_out - clock_in) / (1000 * 60 * 60);
    const roundedHours = parseFloat(totalTimeInHours.toFixed(2));

    let totalBreakInHours = 0;

    if(break_end && break_start){
      totalBreakInHours = (break_end - break_start) / (1000 * 60 * 60);
    }

    let roundedBreak = parseFloat(totalBreakInHours.toFixed(2));

    if(roundedBreak <= 0 || roundedBreak < breakHour){
      roundedBreak = breakHour
    }

    this.hours = roundedHours - roundedBreak;

    next();
  } catch (error) {
    next(error);
    
  }

})


module.exports = mongoose.model ("Attendance", attendanceSchema);