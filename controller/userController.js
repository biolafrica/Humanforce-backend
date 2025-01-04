const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const Attendance = require("../model/attendance");
const {requireAuth, authToken} = require('../Middleware/auth');
const WorkingHours = require("../model/workingHoursModel");
const Business = require("../model/businessModel");


const maxAge = 3*24*60*60;
const jwtSecret = process.env.jwtSecret;
const createToken = (id)=>{
  return jwt.sign({id}, jwtSecret, {expiresIn :maxAge})
}

const day = () =>{
  const startOfDay = new Date()
  startOfDay.setHours(0,0,0,0)

  const endOfDay = new Date()
  endOfDay.setHours(23,59,59,999);

  return{startOfDay, endOfDay}

}

// to login
const login = async(req, res)=>{
  const{staff_code} = req.body;

  try {
    const user = await User.login(staff_code);

    const token = createToken(user._id);
    res.cookie("authToken", token, {
      maxAge: 1000 * maxAge,
      httpOnly: true,
    });

    res.status(200).json({
      token : token,
      user:{
        id: user._id,
        firstname : user.firstname,
        lastname : user.lastname,
        position : user.role
      },
      
    });
    
  } catch (error) {
    console.log("Error logging in;", error);
    res.status(400).json({error: error.message});
    
  }

}

// click on start button
const postClock = async(req, res)=>{
  const {token} = req.body;
  
  try {
    const user = await authToken(token);

    const staff = await User.findOne({_id:user.id});
    if(!staff){
      return res.status(404).json({error:"Staff not found"});
    }
    const staff_code = staff.staff_code;

    const startOfDay = day().startOfDay;
    const endOfDay = day().endOfDay;
    
    let attendance = await Attendance.findOne({
      staff_code,
      createdAt:{$gte: startOfDay, $lte: endOfDay}
    });

    if(!attendance){
      attendance = await Attendance.create({staff_code})
    }

    const workingHours = await WorkingHours.findOne();
    const businessPolicy = await Business.findOne();
    const latenessHour = businessPolicy && businessPolicy.lateness_hours ? businessPolicy.lateness_hours : 0 ;

    const now = new Date();
    const currentDay = now.toLocaleString("en-US", {weekday: 'long'}).toLowerCase();
    const openTime = workingHours?.days?.[currentDay]?.open;
  

    if(openTime){
      const openDateTime = new Date(
        now.toISOString().split("T")[0] + "T" + openTime + ":00Z"

      )
      console.log("opendatetime",openDateTime)

      const latenessThreshold = new Date(openDateTime)
      latenessThreshold.setMinutes(openDateTime.getMinutes() + latenessHour * 60)

      console.log("latenes thresshold", latenessThreshold);

      if(now <= openDateTime || now <= latenessThreshold){
        attendance.status = "early";
      } else {
        const latenesFine = businessPolicy?.lateness_fine || 0;
        attendance.status = "late";
        await attendance.save();

        attendance.late_fine = latenesFine;
      }
      await attendance.save();

    }
    
    res.status(200).json({id : attendance._id})
    
  } catch (error) {
    console.log('Error', error);
    res.status(500).json({error: error.message});
    
    
  }
 
}

// click on end button
const postClocked = async(req, res)=>{
  const {token} = req.body;

  try {
    const user = await authToken(token);

    const staff = await User.findOne({_id:user.id});
    if(!staff){
      return res.status(404).json({error:"Staff not found"});
    }
    const staff_code = staff.staff_code;

    const startOfDay = day().startOfDay;
    const endOfDay = day().endOfDay;

    let attendance = await Attendance.findOne({
      staff_code,
      createdAt:{$gte: startOfDay, $lte: endOfDay}
    });

    if(!attendance){
      return res.status(200).json({message:"Not yet clocked in"});
    }

    res.status(200).json({id : attendance._id})
    
  } catch (error) {
    console.log('Error', error);
    res.status(500).json({error: error.message});
    
  }

}

// to get specific attendance
const getClock = async(req, res)=>{
  const {id} = req.params;
  console.log(id);
  try {
    const attendance = await Attendance.findById(id);
    res.status(200).json({data: attendance})
    
  } catch (error) {
    console.log("Error fetching attendance", error)
    res.status(500).json({error :error.message})
    
  }

}


// to update specific attendance schema
const patchClock = async(req, res)=>{
  const {id} = req.params;
  const updates = req.body;

  try {
    const updatedDocument = await Attendance.findByIdAndUpdate(
      id,
      {$set: updates},
      {new: true, runValidators: true}
    );

    if(!updatedDocument){
      return res.status(404).json({message: "Document not found"})
    }

    const businessPolicy = await Business.findOne();
    const breakHour = businessPolicy && businessPolicy.break_hours ? businessPolicy.break_hours : 0.5 ;

    if(req.body.clock_out) {
      const[clock_out,clock_in,break_start,break_end] = [
        new Date(req.body.clock_out),
        new Date(updatedDocument.clock_in),
        new Date(updatedDocument.break_start),
        new Date(updatedDocument.break_start)
      ]

      const totalTimeInHours = (clock_out - clock_in) / (1000 * 60 * 60);
      let breakTimeInHours = (break_end - break_start) / (1000 * 60 * 60)

      if (breakTimeInHours <= 0 || breakTimeInHours < breakHour){
        return breakTimeInHours = breakHour;
      }

      const hoursCompleted = totalTimeInHours - breakTimeInHours;
      //updatedDocument.clock_out = clock_out;
      const roundedCompletedHours = Math.max(0, Math.round((hoursCompleted + Number.EPSILON) * 10) / 10);
      updatedDocument.hours = roundedCompletedHours;


    }
    await updatedDocument.save();
    
    res.status(200).json({
      message: "Document updated successfully",
      data: updatedDocument,

    })
    
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(500).json({message: "Failed to update document", error});
    
  }

}

const getAttendance = async(req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];

  try {

    const user = await authToken(token);
    if(!user){
      return res.status(404).json({error:"error authenticating user"});
    }

    const staff = await User.findOne({_id:user.id});
    if(!staff){
      return res.status(404).json({error:"Staff not found"});
    }

    const attendance = await Attendance.find({staff_code: staff.staff_code});
    res.status(200).json({attendance});
    
  } catch (error) {
    console.log("Error fetching the user attendances", error);
    res.status(500).json({error : "Failed to fetch user attendance"});
    
  }

}


module.exports = {
  login,
  postClock,
  getClock,
  patchClock,
  postClocked,
  getAttendance,
 
}