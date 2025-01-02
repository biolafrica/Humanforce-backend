const nodemailer = require("nodemailer");

//transporter
const email = process.env.EMAIL;
const password = process.env.PASSWORD;
console.log(email, password)
const transporter = nodemailer.createTransport({
  //host: "smtp.zoho.com",
  //port: 587,
  //secure: false,
  service: "gmail",
  auth:{
    user: email,
    pass: password,
  },
});

const sendRegistrationEmail = async(to, name, staff_code) => {
  try {
    const mailOptions = {
      from:"'Eatup Food Services Limited' biolafrica@gmail.com",
      to,
      subject : "Registration Succesfull",
      html: `
      <h1>Wlecome to Eatup Food Services limited ${name}</h1>
      <p>We are happy to have you join our team, Your staff code is ${staff_code}</p>
      <p>Feel free to reach out to support on info@eatupng.com if you have an question</p>
      <p>Best Regards, <b>Eatup Food Limited</b> </p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log(`Registration email sent to ${to}`);
    
  } catch (error) {
    console.log("Error sending email:", error)
    
  }
};

module.exports = sendRegistrationEmail;