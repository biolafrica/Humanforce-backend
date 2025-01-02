const jwt = require("jsonwebtoken");


const jwtSecret = process.env.jwtSecret;

const requireAuth = (req, res, next)=>{
  const token = req.cookies.authToken;

  if(!token){
    return res.status(401).json({error:"Authentication required"});
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({error : 'Invalid or expired token'});
    
  }

}

const authToken = async(token)=>{
  try {
    const decoded = jwt.verify(token, process.env.jwtSecret);
    //console.log("Decoded token:", decoded);
    return decoded;
    
  } catch (error) {
    console.log('Token verification error:', error.message)
    throw new Error ("Inavlid or expired token")
    
    
  }


}


module.exports = 
{
  requireAuth,
  authToken
}