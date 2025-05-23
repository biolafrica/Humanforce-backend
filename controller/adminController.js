const User = require("../model/userModel");
const {sendRegistrationEmail} = require("../Middleware/mailer");
const Team = require("../model/teamModel");
const Business = require("../model/businessModel");
const WorkingHours = require("../model/workingHoursModel");
const Attendance = require("../model/attendance");
const TokenBlacklist = require("../model/tokenBlacklist");
const jwt = require("jsonwebtoken");
const {ContractStaff, FixedStaff} = require("../model/payrollModel");
const { adminAuthToken, authToken } = require("../Middleware/auth");
const attendance = require("../model/attendance");


const maxAge = 3*24*60*60;
const jwtSecret = process.env.adminjwtSecret;
const createToken = (id)=>{
  return jwt.sign({id}, jwtSecret, {expiresIn :maxAge})
};

const day = () =>{
  const now = new Date();

  const startOfDay = new Date(now)
  startOfDay.setHours(0,0,0,0)

  const endOfDay = new Date(now)
  endOfDay.setHours(23,59,59,999);

  
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const currentMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  const startOfYear = new Date(now.getFullYear(), 0,1);
  const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59, 59,999);


  return{startOfDay, endOfDay, currentMonthStart, currentMonthEnd, startOfYear, endOfYear}

}


const regPost = async(req, res)=>{
  const{
    firstname,
    lastname,
    employment_type,
    salary,
    date_of_birth,
    email_address,
    phone_number,
    address,
    next_of_kin_name,
    next_of_kin_phone_number,
    status,
    role
  } = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  try {

    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    const user = await User.create({
      firstname,
      lastname,
      employment_type,
      salary,
      date_of_birth,
      email_address,
      phone_number,
      address,
      next_of_kin_name,
      next_of_kin_phone_number,
      status,
      role
    });

    res.status(201).json({id:user._id});
    
  } catch (error) {
    console.log("Error creating user:", error.message);

    if(error.message.includes("E11000 duplicate key error collection")){
      res.status(402).json({
        message:"The user already exist",
        error: error.message,
      });

    }else{
      res.status(500).json({
        message:"An error occured while creating user",
        error: error.message,
      });

    }

   
    
  }

  
};

const staffGet = async(req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    const users = await User.find();
    res.json({users});
    
  } catch (error) {
    console.log("Error fetching user:", error)
    res.status(500).json({error : "Failed to fetch user"})
    
  }

};

const getSelectedUser = async(req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];
  const {id} = req.params;

  try {
    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    const staff = await User.findOne({_id:id});
    if(!staff){
      return res.status(404).json({error:"Staff not found"});
    }

    res.status(200).json({staff})
    
  } catch (error) {
    console.log("Error fetching staff", error)
    res.status(500).json({error :error.message})
  }

};

const postUser = async(req, res)=>{
  const {id} = req.params;
  const update = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({error: "User not found"});
    }

    const updatedUser = await User.findByIdAndUpdate(id, update, {
      new: true,
      runValidators: true,
    })

    res.status(200).json({updatedUser})

  } catch (error) {
    console.log("Error updating User", error)
    res.status(500).json({error :"An error occured while updating user"})
    
  }

};


const teamPost = async(req, res)=>{
  const{
    staff_id,
    team_role
  } = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  
 
  try {

    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    const team = await Team.create({
      staff_id,
      team_role
    });

    const user = await User.findById(staff_id);

    if(!user){
      console.log("user not found")

    }else{
      sendRegistrationEmail(user.email_address, user.firstname)
    }

    res.status(201).json({id:team._id})
    
  } catch (error) {
    console.log("Error registering team member:", error.message);

    if(error.message === "he has been added to the team" ){
      res.status(402).json({
        message:"The team member already exist",
        error: error.message,
      });

    }else{
      res.status(500).json({
        message:"An error occured while registering team member",
        error: error.message,
      });

    }
    
  }

};

const teamGet = async(req,res)=>{
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    const users = await User.find({status : "active"});
    const teams = await Team.find();

    if(!users || !teams){
      return res.status(404).json({error : "No users or teams found"});
    }

    res.status(200).json({users,teams});
    
  } catch (error) {
    console.log('Error fetching team data:', error.message)
    res.status(500).json({error : 'failed to fetch team'})
    
  }

};

const teamEdit = async(req, res)=>{
  const {id} = req.params;
  const {team_role} = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  try {

    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    const team = await Team.findById(id);
    if(!team){
      return res.status(404).json({error: "User not found"});
    }

    team.team_role = team_role;
    const updatedTeam = await team.save();

    console.log("UPDATE", updatedTeam)

    res.status(200).json({updatedTeam})

    
  } catch (error) {
    console.log("Error updating User", error)
    res.status(500).json({error :"An error occured while updating user"})
  }

};

const teamDelete = async(req, res)=>{
  const {id} = req.params;
  const token = req.headers.authorization?.split(" ")[1];

  try {

    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }
     
    const team = await Team.findById(id);
    if(!team){
      return res.status(404).json({error: "Team not found"});
    };

    /*await TokenBlacklist.create({
      token,
      expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
    });*/
    
    await Team.findByIdAndDelete(id);
    res.status(200).json({message : "team deleted successfully"})

    
  } catch (error) {
    console.log("Error updating User", error)
    res.status(500).json({error :"An error occured while deleting team"})
    
  }
};

// change to staff id instead of code
const getSelectedTeam = async(req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];
  const {id} = req.params;

  try {
    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }
        
    const team = await Team.findById(id);
    if(!team){
      return res.status(404).json({error: "Team not found"});
    };

    const user = await User.findOne({_id : team.staff_id})
    if(!user){
      return res.status(404).json({error: "user not found"});
    };

    res.status(200).json({
      firstname : user.firstname,
      lastname : user.lastname,
      role : team.team_role,
      staff_code : team.staff_id
    })

    
  } catch (error) {
    console.log("Error fetching selected team member", error)
    res.status(500).json({error :"An error occured while fetching selected team member"})
    
  }

};


const saveOrUpdateBusiness = async (req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];
  const data = req.body;

  try {
    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    let business = await Business.findOne();

    if(!business){
      business = await Business.create(data);
      return res
      .status(201)
      .json({message: "business saved successfully", business});
    }

  
    for(const key in data){
      if(data[key] !== undefined && data[key] !==""){
        business[key] = data[key];
      }
    }

    business.updatedAt = Date.now();
    await business.save();

    return res
    .status(200)
    .json({message:"business updated succesfully", business})
    
  } catch (error) {

    console.error('Error saving or updating business:', error);
    res.status(500).json({error:"Failed to save or update business"})
    
  }
};

const businessGet = async(req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];

  try {

    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
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

};

const patchWorkingHours = async(req, res)=>{
  const {days} = req.body;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    let workingHours = await WorkingHours.findOne();

    if(!workingHours){
      workingHours = new WorkingHours({days,});
      await workingHours.save();
      return res.status(201).json({
        message: "working hours created succesfully", workingHours
      })
    }

    for(const day in days){
      if(workingHours.days[day]){
        workingHours.days[day] = {
          open: days[day].open || "",
          close: days[day].close || "",
          isClosed: days[day].isClosed || false,
        };

      }
    }

    workingHours.updatedAt = Date.now();
    await workingHours.save()
    return res.status(200).json({message :"working hours updated successfully", workingHours})

    
  } catch (error) {
    console.log('Error saving working hours', error)
    res.status(500).json({message:"Error saving working hours", error})
  }

};

const getWorkingHours = async(req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];

  try {

    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    const workingHours = await WorkingHours.find();
    res.json({workingHours});
    
  } catch (error) {
    console.log("Error fetching working hours:", error)
    res.status(500).json({error : "Failed to fetching working hours"})
    
  }

};


const getAttendances = async(req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];

  try {
      
    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    const attendances = await Attendance.find();
    
    const updatedAttendance = attendances.reduce((acc, item)=>{
      const monthYear = new Date(item.createdAt).toLocaleString('default',{month: 'long', year:'numeric'});

      if(!acc[monthYear]){
        acc[monthYear] = [];
      }
      acc[monthYear].push(item)
      return acc

    }, {})

    res.status(200).json({updatedAttendance});
    
  } catch (error) {
    console.log("Error fetching all attendance:", error)
    res.status(500).json({error : "Failed to fetch all attendance"})
    
  }
  
};

const getAttendance = async(req, res)=>{
  const {id} = req.params;
  const {monthYear} = req.query;
  const token = req.headers.authorization?.split(" ")[1];

  try {
    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({error: "users not found"});
    }

    if(!monthYear){
      return res.status(404).json({error: "month and year are required"});
    }

    const [monthName, year] = monthYear.split(" ")
    const monthIndex = new Date(`${monthName} 1, ${year}`).getMonth();

    const startDate = new Date(year, monthIndex, 1)
    const endDate = new Date(year, monthIndex + 1, 0, 23, 59, 59);

    const attendance = await Attendance.find({
      staff_id: user._id,
      createdAt: {$gte : startDate, $lte: endDate}
    });
    
    res.status(200).json({
      attendance,
      user: {
        firstname : user.firstname,
        lastname : user.lastname,
      },
    });
    
  } catch (error) {
    console.log("Error fetching the user attendances", error);
    res.status(500).json({error : "Failed to fetch user attendance"});
    
  }
};


const getAllPayroll = async(req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];

  try {

    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    const users = await User.find({status : "active"})

    if(!users){
      return res.status(404).json({error : "error fetching all payroll"});
    }

    res.json({users});

  } catch (error) {
    console.log("Error fetching all payroll:", error)
    res.status(500).json({error : "Failed to fetch all payroll"})
    
  }

};

const getSinglePayroll = async(req, res)=>{
  const {id} = req.params;
  const token = req.headers.authorization?.split(" ")[1];
  

  try {

    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    const user = await User.findById(id);
    if(!user){
      return res.status(404).json({error : "error fetching user"});
    }

    let userPayroll = null
    if(user.employment_type === "contract"){

      userPayroll = await ContractStaff.find({staff_id : id}).sort({createdAt: 1});

      if(!userPayroll){
        return res.status(404).json({error : "No payroll data found for contract staff "});
      }

    }else if(user.employment_type === "fixed"){

      userPayroll = await FixedStaff.find({staff_id : id})

      if(!userPayroll){
        return res.status(404).json({error : "no payroll data found for fixed staff"});
      }

    }

    let payroll = userPayroll.reduce((acc, item) => {
      const monthYear = new Date(item.createdAt).toLocaleString('default',{month: 'long', year:'numeric'});
      if(!acc[monthYear]){
        acc[monthYear] = [];
      }
      acc[monthYear].push(item)
      return acc;
      
    }, {});
    
    
    res.status(200).json({
      payroll,
      name :{
        firstname : user.firstname,
        lastname : user.lastname
      },
    });
    
    
  } catch (error) {
    console.log(error.message)
    res.status(500).json({error: error.message});

    
  }

};

const postPayrollDetails = async(req, res)=>{
  const {id} = req.params;
  const formData = req.body;
  const token = req.headers.authorization?.split(" ")[1];
  console.log(formData);

  try {

    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }


    const {currentMonthStart, currentMonthEnd} = day();

    const user = await User.findById(id);

    let updatedPayroll;
    if(user.employment_type === "fixed"){

      updatedPayroll = await FixedStaff.findOneAndUpdate(
        {staff_id : id,
          createdAt:{
            $gte: currentMonthStart,
            $lte: currentMonthEnd
          },
          
        },
        {$set: formData},  
        {new: true, upsert: true}
      );

      if(!updatedPayroll){
        return res.status(404).json({error: "Payroll not found"})
      }

    }else if(user.employment_type === "contract"){

      const {weekId, day, rate, unit, loan, bonuses} = req.body;
      updatedPayroll = await ContractStaff.findById(weekId);

      if(!updatedPayroll){
        return res.status(404).json({error: "Payroll not found"})
      }

      updatedPayroll.days[day]. rate = rate;
      updatedPayroll.days[day]. unit = unit;
      updatedPayroll.days[day]. loan = loan;
      updatedPayroll.days[day]. bonuses = bonuses;

      await updatedPayroll.save();

    }else{
      return res.status(400).json({error: "Inavalid staff type"})
    }
    
    res.status(200).json({
      message: "Payroll updated succesfully",
      payroll: updatedPayroll,
    });

  } catch (error) {
    console.error("Error updating payroll:", error)
    res.status(500).json({error: "Internal Server Error. Please try again"})
  
  }

};


const login = async(req, res)=>{
  const{staff_code} = req.body;

  try {
    const user = await User.login(staff_code);
    const team = await Team.findOne({staff_id : user._id});

    if(!team){
      return  res.status(404).json({error: "invalid Team member"})
    }

    const token = createToken(team._id);
    res.cookie("adminAuthToken", token, {
      maxAge: 1000 * maxAge,
      httpOnly: true,
    });

    res.status(200).json({
      token : token,
      team:{
        email: user.email_address,
        firstname : user.firstname,
        lastname : user.lastname,
        role : team.team_role
      },
      
    });
    
  } catch (error) {
    console.log("Error logging team;", error);
     if(error.message === "Unexpected error occured"){
      res.status(400).json({error: error.message});
    }else{
      res.status(500).json({error: error.message});
    }
  }

};


const getDashboard = async(req, res)=>{
  const token = req.headers.authorization?.split(" ")[1];
  const {startOfDay, endOfDay, currentMonthStart, currentMonthEnd, startOfYear, endOfYear } = day();

  try {
    const decodedToken = await adminAuthToken(token);
    if(!decodedToken){
      return res.status(401).json({error:"error authenticating user"});
    }

    const today = [];
    const thisMonth =[];
    const thisYear = []

    const dayAttendanceCount = await Attendance.countDocuments({
      createdAt : {
        $gte :startOfDay,
        $lte : endOfDay
      }
    });
    today.push(dayAttendanceCount);

    const dayEarlyAttendanceCount = await Attendance.countDocuments({
      status : "early",
      createdAt : {
        $gte :startOfDay,
        $lte : endOfDay
      },
      
    });
    today.push(dayEarlyAttendanceCount);

    const dayLateAttendanceCount = await Attendance.countDocuments({
      status : "late",
      createdAt : {
        $gte :startOfDay,
        $lte : endOfDay
      }
    });
    today.push(dayLateAttendanceCount);

    const monthAttendanceCount = await Attendance.countDocuments({
      createdAt : {
        $gte :currentMonthStart,
        $lte : currentMonthEnd
      }

    });
    thisMonth.push(monthAttendanceCount);

    const monthEarlyAttendanceCount = await Attendance.countDocuments({
      status : "early",
      createdAt : {
        $gte :currentMonthStart,
        $lte : currentMonthEnd
      }

    });
    thisMonth.push(monthEarlyAttendanceCount);

    const monthLateAttendanceCount = await Attendance.countDocuments({
      status : "late",
      createdAt : {
        $gte :currentMonthStart,
        $lte : currentMonthEnd
      }

    });
    thisMonth.push(monthLateAttendanceCount);

    const yearAttendanceCount = await Attendance.countDocuments({
      createdAt : {
        $gte :startOfYear,
        $lte : endOfYear
      }


    });
    thisYear.push(yearAttendanceCount);

    const yearEarlyAttendanceCount = await Attendance.countDocuments({
      status : "early",
      createdAt : {
        $gte :startOfYear,
        $lte : endOfYear
      }


    });
    thisYear.push(yearEarlyAttendanceCount);

    const yearLateAttendanceCount = await Attendance.countDocuments({
      status : "late",
      createdAt : {
        $gte :startOfYear,
        $lte : endOfYear
      }


    });
    thisYear.push(yearLateAttendanceCount);

    const allStaffCount = await User.countDocuments({status : "active"});

    const contractStaffCount = await User.countDocuments({
      employment_type : "contract",
      status : "active"
    });

    const fixedStaffCount = await User.countDocuments({
      employment_type : "fixed",
      status : "active"
    });

    res.status(200).json({
      attendance:{
        today,
        thisMonth,
        thisYear,
      },

      staff:{
        allStaffCount,
        contractStaffCount,
        fixedStaffCount
      }
    
    })

  } catch (error) {
    console.error("Error fetching attendance dashboard numbers:", error);
    res.status(500).json({error : "error fetching attendance dashboard numbers"});
    
  }
}



module.exports = {
  regPost,
  staffGet,
  teamPost,
  teamGet,
  saveOrUpdateBusiness,
  businessGet,
  patchWorkingHours,
  getWorkingHours,
  getAttendance,
  getAttendances,
  getAllPayroll,
  getSinglePayroll,
  postPayrollDetails,
  login,
  getSelectedUser,
  postUser,
  teamDelete,
  teamEdit,
  getSelectedTeam,
  getDashboard
}
