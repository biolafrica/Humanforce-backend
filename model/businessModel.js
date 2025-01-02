const mongoose = require('mongoose');
const { type } = require('os');

const businessSchema = new mongoose.Schema({
  business_name: {
    type : String,
  },
  business_email:{
    type : String,
  },
  business_address_I :{
    type : String,
  },
  business_address_II :{
    type : String,
  },
  break_hours:{
    type : Number,
  },
  lateness_hours :{
    type : Number,
  },
  lateness_fine :{
    type : Number,
  },
  business_phone_number :{
    type : Number,
    minLength : [11, 'minimum of eleven digit required']
  },
  salary_date :{
    type : Number,
  },
  wages_day :{
    type : String,
  },
  tax :{
    type : Number,
  },
  pension :{
    type : Number,
  },
  createdAt:{
    type:Date,
    default: Date.now,
  },
  updatedAt:{
    type:Date,
    default: Date.now,
  }
});


module.exports = mongoose.model("Business", businessSchema);