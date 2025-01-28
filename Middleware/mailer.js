const { text } = require("body-parser");
const nodemailer = require("nodemailer");
const { from } = require("pdfkit");

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

const sendPayrollEmail = async(staff, pdfPath)=>{
  try {
    const mailOptions ={
      from:"'Eatup Food Services Limited' biolafrica@gmail.com",
      to: staff.email_address,
      subject: "Your Summarized Payslip Report",
      text: `
        Hello ${staff.firstname},
        \n\n
        Please find your payslip summary attached, Kindly visit www.eatup.com for your extensive payslip report.
        \n
        If you encounter any issues opening your payslip, then please feel free to contact one of the team via email, hr@eatup.ng or call Boluwatife on +2348185191968
        \n\n
        Best,
        \n
        Eatup Human Resources Team
      `,
      attachments:[{filename:"Payroll.pdf", pdfPath}]
    }

    await transporter.sendMail(mailOptions);
    console.log(`Payroll email sent to ${staff.email_address}`);
    
    
  } catch (error) {
    console.log("Error sending payrll email:", error)
    
  }


}

module.exports = {
  sendRegistrationEmail, 
  sendPayrollEmail 
}