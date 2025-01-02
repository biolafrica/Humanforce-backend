const mongoose = require("mongoose");
const { type } = require("os");

const teamSchema = new mongoose.Schema({
  staff_code:{
    type : String,
    unique : [true, "he has been added to the team"],
    required : true
  },
  
  team_role:{
    type : String,
    required : [true, "Kindly select role for the staff"] 
  },

  createdAt:{
    type:Date,
    default: Date.now,
  }

})


module.exports = mongoose.model("Team", teamSchema);