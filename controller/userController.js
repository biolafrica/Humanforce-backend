const User = require("../model/userModel");
const jwt = require("jsonwebtoken");
const Attendance = require("../model/attendance");
const {authToken} = require('../Middleware/auth');
const WorkingHours = require("../model/workingHoursModel");
const Business = require("../model/businessModel");
const {ContractStaff, FixedStaff} = require("../model/payrollModel");



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

const getCurrentWeek = (date)=>{
  const start = new Date(date.getFullYear(), 0, 1);
  const diff = (date - start +(start.getTimezoneOffset() - date.getTimezoneOffset()) * 60000) / 86400000;
  return `${date.getFullYear()}-W${Math.ceil((diff + start.getDay() + 1) / 7)}`
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
    console.log("Error logging in;", error.message);
    if(error.message === "Unexpected error occured"){
      res.status(400).json({error: error.message});
    }else{
      res.status(500).json({error: error.message});
    }
    
  }

}

// click on start button
const postClock = async(req, res)=>{
  const {token} = req.body;
  
  
  try {
    const decodedToken = await authToken(token);
    if(!decodedToken){
      return res.status(403).json({error:"Error Verifying user"});
    }
    
    const staff = await User.findOne({_id:decodedToken.id});

    if(!staff){
      return res.status(404).json({error:"Staff not found"});
    }

    const staff_id = staff._id;
    const staffStatus = staff.employment_type;
    const fixedBasicPay = staff.salary;
   
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const currentWeek = getCurrentWeek(now);
    const currentDay = now.toLocaleString("en-US", {weekday: 'long'}).toLowerCase();
    
    const startOfDay = day().startOfDay;
    const endOfDay = day().endOfDay;
    let attendance = await Attendance.findOne({
      staff_id,
      createdAt:{
        $gte: startOfDay,
        $lte: endOfDay
      }
    });

    const workingHours = await WorkingHours.findOne();
    const businessPolicy = await Business.findOne();
    const latenessHour = businessPolicy?.lateness_hours || 0 ;
    const latenessFine = businessPolicy?.lateness_fine || 0;
    const tax = businessPolicy?.tax || 0;
    const pension = businessPolicy?.pension ||0;
    

    if(!attendance){
      attendance = await Attendance.create({staff_id})

      const openTime = workingHours?.days?.[currentDay]?.open;
      if(openTime){
        const openDateTime = new Date(
          now.toISOString().split("T")[0] + "T" + openTime + ":00Z"

        )

        const latenessThreshold = new Date(openDateTime)
        latenessThreshold.setMinutes(openDateTime.getMinutes() + latenessHour * 60)

        attendance.status = now <= openDateTime || now <= latenessThreshold ? "early" : "late";
        if(attendance.status === "late"){
          attendance.late_fine = latenessFine;
        }

        await attendance.save();
      }

      if(staffStatus === "fixed"){
        let fixedPayroll = await FixedStaff.findOne({
          staff_id,
          createdAt: {
            $gte: currentMonthStart,
            $lte: currentMonthEnd,
          },
        }) 
        
        if(!fixedPayroll){
          fixedPayroll = await FixedStaff.create({
            staff_id,
            basic_pay : fixedBasicPay,
            tax : tax >= 0 ? (tax/100) * fixedBasicPay : 0,
            pension : pension >= 0 ? (pension/100) * fixedBasicPay : 0,
            lateness_fine :latenessFine
          });
        }else{
          fixedPayroll.lateness_fine += latenessFine;
          await fixedPayroll.save()

        }
       
      } else if(staffStatus === "contract"){
        let contractPayroll = await ContractStaff.findOne({
          staff_id,
          week:currentWeek,
        });

        if(!contractPayroll){
          contractPayroll = await ContractStaff.create({
            staff_id,
            week: currentWeek,
            tax_percentage: tax,
            pension_percentage: pension
          });

        }else{
          contractPayroll.days[currentDay].isPresent = true;
          contractPayroll.days[currentDay].lateness_fine = latenessFine;
          await contractPayroll.save();
        }
     
      }

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
    const decodedToken = await authToken(token);
    if(!decodedToken){
      return res.status(403).json({error:"Error Verifying user"});
    }

    const staff = await User.findOne({_id:decodedToken.id});
    if(!staff){
      return res.status(404).json({error:"Staff not found"});
    }
    const staff_id = staff._id;

    const startOfDay = day().startOfDay;
    const endOfDay = day().endOfDay;

    let attendance = await Attendance.findOne({
      staff_id,
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
  const token = req.headers.authorization?.split(" ")[1];
  const {id} = req.params;
  try {

    const decodedToken = await authToken(token);
    if(!decodedToken){
      return res.status(403).json({error:"Error Verifying user"});
    }

    const attendance = await Attendance.findById(id);
    res.status(200).json({attendance})
    
  } catch (error) {
    console.log("Error fetching attendance", error)
    res.status(500).json({error :error.message})
    
  }

}

// to update specific attendance schema
const patchClock = async(req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];
  const {id} = req.params;
  const updates = req.body;

  try {

    const decodedToken = await authToken(token);
    if(!decodedToken){
      return res.status(403).json({error:"Error Verifying user"});
    }

    const updatedDocument = await Attendance.findByIdAndUpdate(
      id,
      {$set: updates},
      {new: true, runValidators: true}
    );

    if(!updatedDocument){
      return res.status(404).json({message: "Document not found"})
    }
    
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

    const decodedToken = await authToken(token);
    if(!decodedToken){
      return res.status(403).json({error:"error authenticating user"});
    }

    const staff = await User.findOne({_id:decodedToken.id});
    if(!staff){
      return res.status(404).json({error:"Staff not found"});
    }

    const attendance = await Attendance.find({staff_id: staff._id});
     const updatedAttendance = attendance.reduce((acc, item)=>{
      const monthYear = new Date(item.createdAt).toLocaleString('default',{month: 'long', year:'numeric'});

      if(!acc[monthYear]){
        acc[monthYear] = [];
      }
      acc[monthYear].push(item)
      return acc

    }, {})
    res.status(200).json({updatedAttendance});
    
  } catch (error) {
    console.log("Error fetching the user attendances", error);
    res.status(500).json({error : "Failed to fetch user attendance"});
    
  }

}

const getUserPayslip = async(req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];
  try {

    const decodedToken = await authToken(token);
    if(!decodedToken){
      return res.status(403).json({error:"error authenticating user"});
    }

    const staff = await User.findOne({_id:decodedToken.id});
    if(!staff){
      return res.status(404).json({error:"Staff not found"});
    }

    let formattedPayroll = {};
    if(staff.employment_type === "contract"){
      const payroll = await ContractStaff.find({staff_id: staff._id}) || [];

      formattedPayroll = payroll.reduce((acc, item)=>{
        const month = new Date(item.createdAt).toLocaleString("default", {month : "long"})
        const year = new Date(item.createdAt).getFullYear().toString();

        if(!acc[year]){
          acc[year] = {};
        }

        if(!acc[year][month]){
          acc[year][month] = []
        };

        acc[year][month].push(item);

        return acc;

      }, {});

    }else if(staff.employment_type === "fixed"){

      const payroll = await FixedStaff.find({staff_id: staff._id}) || [];

      formattedPayroll = payroll.reduce((acc, item)=>{
        const year = new Date(item.createdAt).getFullYear().toString();

        if(!acc[year]){
          acc[year] = []
        };

        acc[year].push(item);

        return acc;

      }, {});

    }

    res.status(200).json({formattedPayroll, staff})
    
  } catch (error) {
    console.error(" Error fetching payslip data:", error)
    res.status(500).json({error : "An error occured while fetching payslip data"});
  }

}

const fetchBusiness = async(req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];

  try {

    const decodedToken = await authToken(token);
    if(!decodedToken){
      return res.status(403).json({error:"error authenticating user"});
    }

    const business = await Business.find()
    res.status(200).json(
    {
      message:"Business details fetched successfully",
      business
    });
    
  } catch (error) {
    console.log("Error fetching business:", error);
    res.status(500).json({error : "Error fetching business details"})
    
  }


}


const fetchWorkingHours =async(req,res)=>{
  const token = req.headers.authorization?.split(" ")[1];

  try {

    const decodedToken = await authToken(token);
    if(!decodedToken){
      return res.status(403).json({error:"error authenticating user"});
    }

    const workingHours = await WorkingHours.find();
    res.json({workingHours});
    
  } catch (error) {
    console.log("Error fetching working hours:", error)
    res.status(500).json({error : "Failed to fetching working hours"})
    
  }

}


module.exports = {
  login,
  postClock,
  getClock,
  patchClock,
  postClocked,
  getAttendance,
  getUserPayslip,
  fetchBusiness,
  fetchWorkingHours
 
}