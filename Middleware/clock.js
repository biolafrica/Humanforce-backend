const Attendance = require("../model/attendance")
const WorkingHours = require("../model/workingHoursModel")
const Business = require("../model/businessModel")

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


module.exports = {autoClockOutJob}