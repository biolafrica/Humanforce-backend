const jwt = require("jsonwebtoken");
const TokenBlacklist = require("../model/tokenBlacklist")


const authToken = async(token)=>{
  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);
    //console.log("Decoded token:", decoded);
    return decoded;
    
  } catch (error) {
    console.log('Token verification error:', error.message)
    throw new Error ("Inavlid or expired token")
  }

};

const adminAuthToken = async(token)=>{
  try {

    const blacklistedToken = await TokenBlacklist.findOne({token})
    if(blacklistedToken){
      throw new Error ("Token has been blacklisted")
    }

    const decoded = jwt.verify(token, process.env.adminjwtSecret);
    //console.log("Decoded token:", decoded);
    return decoded;
    
  } catch (error) {
    console.log('Token verification error:', error.message)
    throw new Error ("Inavlid or expired token")
    
    
  }


}


module.exports = 
{
  authToken,
  adminAuthToken
}