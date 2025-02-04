const mongoose = require("mongoose");
const { type } = require("os");
const Business = require ("./businessModel");
const doc = require("pdfkit");

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
    default: null
  }, 

  break_start:{
    type : Date,
    default : null
  }, 

  break_end:{
    type : Date,
    default : null
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
  
});


attendanceSchema.post("findOneAndUpdate", async function(doc){

  try {
    const businessPolicy = await Business.findOne();
    const breakHour = businessPolicy?.break_hours || 0.5 ;

    if(!doc.clock_out){
      console.log("not clock out")
      return;
    } 

    const clock_out = new Date(doc.clock_out)
    const clock_in = new Date(doc.clock_in)

    const break_start = doc.break_start ? new Date(doc.break_start) : null;
    const break_end  = doc.break_end ? new Date(doc.break_end): null;

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
    console.log("rounded-break", roundedBreak);

    await doc.model("Attendance").updateOne(
      { _id: doc._id },
      { hours: parseFloat(roundedHours - roundedBreak).toFixed(2) }
    );

    console.log("Updated hours:", parseFloat(roundedHours - roundedBreak).toFixed(2));
    
  } catch (error) {
    console.error("Error in post-update middleware:", error);
    
  }
});


module.exports = mongoose.model ("Attendance", attendanceSchema);