const mongoose = require("mongoose")

const tokenBlacklistScema = new mongoose.Schema({
  token: {
    type:String, 
    required:true
  },

  expiresAt:{
    type: String, 
    required: true
  }

})

module.exports = mongoose.model("TokenBlacklist", tokenBlacklistScema);