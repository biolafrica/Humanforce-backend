const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { type } = require("os");


const userSchema = new mongoose.Schema({
  firstname:{
    required : [true, "please enter staff first name"],
    type : String,
  },
  
  lastname:{
    required : [true, "please enter staff last name"],
    type : String,
  },

  employment_type:{
    required : [true, "please select staff employement type"],
    type : String,
  },

  salary:{
    required : [true, "please enter staff proposed salary"],
    type : Number,
  },

  date_of_birth:{
    required : [true, "please enter staff date of birth"],
    type : Date,
  },

  email_address:{
    required : [true, "please enter staff first email address"],
    type : String,
    unique :true,
  },

  phone_number:{
    required : [true, "please enter staff phone number"],
    type : Number,
    minLength : [11, 'minimum of eleven digit required']
  },

  address:{
    required : [true, "please enter staff address"],
    type : String,
  },

  next_of_kin_name:{
    required : [true, "please enter staff next of kin name"],
    type : String,
  },

  next_of_kin_phone_number :{
    required : [true, "please enter staff next of kin phone number"],
    type : Number,
    minLength : [11, 'minimum of eleven digit required']
  },

  staff_code:{
    type: String,
    unique: true,
  },

  status:{
    required : [true, "please select staff status"],
    type: String,
  },

   role:{
    required : [true, "please enter staff assigned role"],
    type: String,
  },

  createdAt:{
    type:Date,
    default: Date.now,
  }


});

//Pre-save hook to generate unique staff code
userSchema.pre("save", async function (next){
  if(!this.staff_code){
    let isUnique = false;
    while(!isUnique){
      const code = `EU${Math.floor(100000 + Math.random() * 900000)}`;

      const existingUser = await this.constructor.findOne({staff_code: code});
      if(!existingUser){
        this.staff_code = code;
        isUnique = true;
      }
    }
  }

  next();
});


userSchema.statics.login = async function(staff_code){
  try {
    const user = await this.findOne({staff_code});
    if(!user){
      throw new Error("staff code not found");
    }
    return user;
    
  } catch (error) {
    throw new Error("Unexpected error occured", error.message)
    
  }
}


module.exports = mongoose.model("User", userSchema);
