const nodemailer = require("nodemailer");

//transporter
const pass = process.env.emailPassword;
const user = process.env.email;

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth:{
    user,
    pass,
  },
});

const sendRegistrationEmail = async(to, name,) => {
  try {
    const mailOptions = {
      from:"'Eatup Food Services Limited' biolafrica@gmail.com",
      to,
      subject : "Team Member access",
      text: `Hello ${name},
      \n\n
      You have been given access to the staff management dashboard, Login with your staff Code to get started.
      \n\n
      Feel free to reach out to support on info@eatupng.com if you have an question
      \n\n
      Best regards,\n
      Head of HR`,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Registration email sent to ${to}`);
    
  } catch (error) {
    console.log("Error sending email:", error)
    
  }
};

module.exports = sendRegistrationEmail;