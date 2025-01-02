const mongoose = require("mongoose");
const { type } = require("os");



const workingHoursSchema = new mongoose.Schema({
  
  days:{

    sunday:{
      open: {type: String, default:""},
      close: {type: String, default:""},
      isClosed: {type: Boolean, default: false},
    },

    monday:{
      open: {type: String, default:""},
      close: {type: String, default:""},
      isClosed: {type: Boolean, default: false},
    },

    tuesday:{
      open: {type: String, default:""},
      close: {type: String, default:""},
      isClosed: {type: Boolean, default: false},
    },

    wednesday:{
      open: {type: String, default:""},
      close: {type: String, default:""},
      isClosed: {type: Boolean, default: false},
    },

    thursday:{
      open: {type: String, default:""},
      close: {type: String, default:""},
      isClosed: {type: Boolean, default: false},
    },

    friday:{
      open: {type: String, default:""},
      close: {type: String, default:""},
      isClosed: {type: Boolean, default: false},
    },

    saturday:{
      open: {type: String, default:""},
      close: {type: String, default:""},
      isClosed: {type: Boolean, default: false},
    },

  },
  
  createdAt:{
    type: Date,
    default: Date.now,
  },

  updatedAt:{
    type: Date,
    default: Date.now,
  }


});

module.exports = mongoose.model("WorkingHours", workingHoursSchema);