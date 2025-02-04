const puppeteer = require ("puppeteer");
const fs = require("fs");
const path = require("path")

const formatNaira =(amount)=>{
  if(isNaN(amount)){
    return "Invalid Amount"
  }

  return new Intl.NumberFormat('en-NG', {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
  }).format(amount);

}

const generatePayslipPDF = async(staff, payroll)=>{

  try {
    const templatePath = path.join(__dirname, "payslipTemplate.html");
    let htmlContent =fs.readFileSync(templatePath, "utf8")

    htmlContent = htmlContent.replace("{{pay_date}}", new Date().toLocaleString());
    htmlContent = htmlContent.replace("{{staff_name}}", `${staff.firstname} ${staff.lastname}`);
    htmlContent = htmlContent.replace("{{staff_code}}", staff.staff_code );
    htmlContent = htmlContent.replace("{{staff_role}}", staff.role);
    htmlContent = htmlContent.replace("{{basic_pay}}", `${formatNaira(payroll.basic_pay)}`);
    htmlContent = htmlContent.replace("{{bonuses}}", `${formatNaira(payroll.bonuses)}`);
    htmlContent = htmlContent.replace("{{total_deductions}}", `${formatNaira(payroll.tax + payroll.loan + payroll.lateness_fine)}`);
    htmlContent = htmlContent.replace("{{net_pay}}", `${formatNaira((payroll.basic_pay + payroll.bonuses) - (payroll.tax + payroll.loan + payroll.lateness_fine))}`);

    const browser = await puppeteer.launch({args:["--no-sandbox", "--disable-setuid-sandbox"] });
    const page = await browser.newPage();

    await page.setContent(htmlContent, {waitUntil: "networkidle0"});

    const pdfPath = path.join(__dirname, `payslip_${staff.staff_code}.pdf`);
    

    await page.pdf({path:pdfPath, format: "A4"});

    await browser.close();

    console.log("Generated PDF Path", pdfPath)

    return pdfPath;
    
  } catch (error) {
    console.error('Error generating payslip PDF:', error);
    return null;
    
  }

}

module.exports = generatePayslipPDF;