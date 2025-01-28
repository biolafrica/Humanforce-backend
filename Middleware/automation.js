const Attendance = require("../model/attendance")
const WorkingHours = require("../model/workingHoursModel")
const Business = require("../model/businessModel")
const {ContractStaff, FixedStaff} = require("../model/payrollModel");
const User = require("../model/userModel");
const moment = require("momemt");
const {autoSendPayrollEmail} = require("./mailer")

const day = () =>{
  const startOfDay = new Date()
  startOfDay.setHours(0,0,0,0)

  const endOfDay = new Date()
  endOfDay.setHours(23,59,59,999);

  return{startOfDay, endOfDay}

}

const autoClockOutJob = async()=>{

  try {
    const currentDay = new Date().toLocaleString("en-US", {weekday: "long"}).toLowerCase();

    const businessPolicy = await Business.findOne();
    if(!businessPolicy){
      console.log('No business policy found!')
      return
    }

    const workingHours = await WorkingHours.findOne();
    if(!workingHours || !workingHours?.days?.[currentDay]?.close){
      console.log(`No working hours or close time set for ${currentDay}`)
      return

    }

    const closeTime = workingHours.days[currentDay].close;

    
    const startOfDay = day().startOfDay;
    const endOfDay = day().endOfDay;

    const attendances = await Attendance.find({
      clock_out : 0,
      createdAt: {$gte: startOfDay, $lte:endOfDay},
    })

    console.log("attendances", attendances)
    if(attendances.length === 0){
      console.log("No pending clock-outs for today.");
      return;
    }

    const updates = attendances.map(async (attendance)=>{
      const clockOutTime = new Date()
      const [closeHours, closeMinutes] = closeTime.split(":").map(Number);
      clockOutTime.setHours(closeHours, closeMinutes, 0, 0);

      attendance.clock_out = clockOutTime;
      return attendance.save();
    })

    await Promise.all(updates);
    console.log("All pending clock-outs have been updated")
    
  } catch (error) {
    console.error("Error during auto clock-out:", error)
    
  }

}

const autoSendPayrollEmail = async()=>{
  const today = moment().format("dddd");
  const currentDate = moment().date();

  const businessSettings = await Business.findOne();
  if(!businessSettings) return;


  const {salary_date, wages_day} = businessSettings;

  if(currentDate === salary_date){
    const fixedStaff = await User.find({employment_type : "fixed"});

    const currentMonthStart = moment().startOf("month").toDate();
    const currentMonthEnd = moment().endOf("month").toDate();

    for(const staff of fixedStaff){
      const payroll = await FixedStaff.findOne({
        staff_id:staff._id,
        createdAt:{
          $gte: currentMonthStart,
          $lte: currentMonthEnd
        }
      });

      if(payroll){
        await autoSendPayrollEmail(staff, payroll);
      }

    }
  }

  if(today === wages_day){
    const contractStaff = await User.find({employment_type: "contract"})

    const currentWeek = moment().format("YYYY-[W]W");

    for(const staff of contractStaff){
      const payroll = await ContractStaff.findOne({
        staff_id: staff._id,
        week: currentWeek
      })
      if(payroll){
        await autoSendPayrollEmail(staff,payroll)
      }
    }
  }




}


module.exports = {autoClockOutJob, autoSendPayrollEmail}