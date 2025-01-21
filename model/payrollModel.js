const mongoose = require("mongoose");

const fixedStaffSchema = new mongoose.Schema({

  staff_id:{
    type :String,
    default : "",
  },

  staff_type:{
    type : String,
    default: "fixed",
  },

  createdAt:{
    type: Date,
    default: Date.now,
  },
  
  basic_pay:{
    type :Number,
    default : 0,

  },

  loan:{
    type :Number,
    default : 0,
  },

  lateness_fine:{
    type :Number,
    default : 0,

  },

  pension:{
    type :Number,
    default : 0,
  },

  deductions:{
    type :Number,
    default : 0,

  },

  bonuses:{
    type :Number,
    default : 0,

  },

  tax:{
    type :Number,
    default : 0,
  },

  net_pay:{
    type :Number,
    default : 0,

  },
 
})

const contractStaffSchema = new mongoose.Schema({

  staff_id:{
    type :String,
    default : "",
  },

  staff_type:{
    type : String,
    default: "contract",
  },

  createdAt:{
    type: Date,
    default: Date.now,
  },

  week:{
    type :String,
    default : "",
  },

  basic_pay:{
    type :Number,
    default : 0,

  },

  loan:{
    type :Number,
    default : 0,
  },

  lateness_fine:{
    type :Number,
    default : 0,

  },

  bonuses:{
    type :Number,
    default : 0,

  },

  tax:{
    type :Number,
    default : 0,
  },

  pension:{
    type :Number,
    default : 0,
  },

  tax_percentage:{
    type: Number,
    default: 5,
  },

  pension_percentage:{
    type: Number,
    default: 10
  },

  unit:{
    type :Number,
    default : 0,
  },

  days:{

    sunday:{
      rate: {type: Number, default: 0},
      unit: {type: Number, default: 0},
      loan: {type: Number, default: 0},
      lateness_fine: {type: Number, default: 0},
      isPresent: {type: Boolean, default: false},
      bonuses: {type: Number, default: 0},
    },

    monday:{
      rate: {type: Number, default: 0},
      unit: {type: Number, default:0},
      loan: {type: Number, default: 0},
      lateness_fine: {type: Number, default: 0},
      isPresent: {type: Boolean, default: false},
      bonuses: {type: Number, default: 0},
    },

    tuesday:{
      rate: {type: Number, default:0},
      unit: {type: Number, default:0},
      loan: {type: Number, default: 0},
      lateness_fine: {type: Number, default: 0},
      isPresent: {type: Boolean, default: false},
      bonuses: {type: Number, default: 0},
    },

    wednesday:{
      rate: {type: Number, default:0},
      unit: {type: Number, default:0},
      loan: {type: Number, default: 0},
      lateness_fine: {type: Number, default: 0},
      isPresent: {type: Boolean, default: false},
      bonuses: {type: Boolean, default: 0},
    },

    thursday:{
      rate: {type: Number, default:0},
      unit: {type: Number, default:0},
      loan: {type: Number, default: 0},
      lateness_fine: {type: Number, default: 0},
      isPresent: {type: Boolean, default: false},
      bonuses: {type: Number, default: 0},
    },

    friday:{
      rate: {type: Number, default:0},
      unit: {type: Number, default:0},
      loan: {type: Number, default: 0},
      lateness_fine: {type: Number, default: 0},
      isPresent: {type: Boolean, default: false},
      bonuses: {type: Number, default: 0},
    },

    saturday:{
      rate: {type: Number, default:0},
      unit: {type: Number, default:0},
      loan: {type: Number, default: 0},
      lateness_fine: {type: Number, default: 0},
      isPresent: {type: Boolean, default: false},
      bonuses: {type: Number, default: 0},
    },

  },


})

contractStaffSchema.pre("save", function(next){
  let totalBasicPay = 0;
  let totalUnit = 0;
  let totalLoan = 0;
  let totalLatenessFine = 0;
  let totalBonuses = 0;

  for(const day in this.days){
    if((this.days).hasOwnProperty(day)){
      totalBasicPay += this.days[day].rate;
      totalUnit += this.days[day].unit;
      totalLoan += this.days[day].loan;
      totalLatenessFine += this.days[day].lateness_fine;
      totalBonuses += this.days[day].bonuses;
    }
  }

  this.basic_pay = totalBasicPay;
  this.unit = totalUnit;
  this.loan = totalLoan;
  this.lateness_fine = totalLatenessFine;
  this.bonuses = totalBonuses;

  this.tax = (this.tax_percentage/100) * this.basic_pay;
  this.pension = (this.pension_percentage / 100) * this.basic_pay

  next();
})

fixedStaffSchema.pre("save", function(next){
  let totalDeductions = this.loan + this.lateness_fine + this.pension + this.tax + this.deductions;
  let totalIncome = this.basic_pay +this.bonuses;
  this.net_pay = totalIncome - totalDeductions;

  next();
})


const FixedStaff = mongoose.model("FixedStaff", fixedStaffSchema, "Payroll");
const ContractStaff = mongoose.model("ContractStaff", contractStaffSchema, "Payroll");
module.exports = {FixedStaff,ContractStaff};
