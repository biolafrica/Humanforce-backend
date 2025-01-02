const User = require("../model/userModel");
const sendRegistrationEmail = require("../Middleware/mailer");
const Team = require("../model/teamModel");
const Business = require("../model/businessModel");
const WorkingHours = require("../model/workingHoursModel");


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

  try {
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
    console.log("Error creating user:", error);

    res.status(500).json({
      message:"An error occured while creating user",
      error: error.message,
    });
    
  }

  
};

const staffGet = async(req, res)=>{

  try {
    const users = await User.find();
    res.json({users});
    
  } catch (error) {
    console.log("Error fetching user:", error)
    res.status(500).json({error : "Failed to fetch user"})
    
  }

};

const teamPost = async(req, res)=>{
  const{
    staff_code,
    team_role
  } = req.body;

  try {
    const team = await Team.create({
      staff_code,
      team_role
    });

    res.status(201).json({id:team._id})
    
  } catch (error) {
    console.log("Error registering team member:", error);
    res.status(500).json({
      message: "An error occured while registering team member",
      error: error.message
    });
    
  }

}

const teamGet = async(req,res)=>{
  try {
    const users = await User.find();
    const teams = await Team.find();

    if(!users || !teams){
      return res.status(404).json({error : "No users or teams found"});
    }

    res.status(200).json({users,teams});
    
  } catch (error) {
    console.log('Error fetching team data:', error.message)
    res.status(500).json({error : 'failed to fetch team'})
    
  }

}

const saveOrUpdateBusiness = async (req, res)=>{
  try {
    const data = req.body;

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
}

const businessGet = async(req, res)=>{
  try {
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

const patchWorkingHours = async(req, res)=>{
  const {days} = req.body;

  try {

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

}

const getWorkingHours = async(req, res)=>{

  try {
    const workingHours = await WorkingHours.find();
    res.json({workingHours});
    
  } catch (error) {
    console.log("Error fetching working hours:", error)
    res.status(500).json({error : "Failed to fetching working hours"})
    
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
}
