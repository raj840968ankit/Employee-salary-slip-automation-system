const fs = require("fs");
const path = require("path");
const PDFDocument = require("pdfkit");

const pdfDirectory = path.join(__dirname, "..", "generated-pdfs");

const formatCurrency = (value) => `Rs. ${Number(value || 0).toFixed(2)}`;

const drawRow = (doc, label, amount, y, fillColor = "#ffffff") => {
  doc.rect(70, y, 470, 30).fillAndStroke(fillColor, "#d8dee9");
  doc.fillColor("#263238").fontSize(10).text(label, 85, y + 9, { width: 250 });
  doc.fillColor("#111827").fontSize(10).text(amount, 360, y + 9, {
    width: 160,
    align: "right"
  });
};

const drawInfo = (doc, label, value, x, y) => {
  doc.fillColor("#6b7280").fontSize(9).text(label.toUpperCase(), x, y);
  doc.fillColor("#111827").fontSize(11).text(value || "-", x, y + 15, { width: 210 });
};

const generateSalarySlip = ({ salary, employee }) => {
  if (!fs.existsSync(pdfDirectory)) {
    fs.mkdirSync(pdfDirectory, { recursive: true });
  }

  const fileName = `${salary.employeeId}-${salary.month}-${salary.year}-${salary._id}.pdf`;
  const filePath = path.join(pdfDirectory, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const stream = fs.createWriteStream(filePath);

    stream.on("finish", () => resolve(filePath));
    stream.on("error", reject);
    doc.on("error", reject);

    doc.pipe(stream);

    doc.rect(0, 0, 595, 120).fill("#172033");
    doc.fillColor("#ffffff").fontSize(22).text("Nippon Toyota Pvt Ltd", 50, 35);
    doc.fontSize(10).fillColor("#dbeafe").text("Human Resources Department", 50, 64);
    doc.roundedRect(405, 34, 140, 44, 4).fill("#0f766e");
    doc.fillColor("#ffffff").fontSize(14).text("SALARY SLIP", 425, 48);

    doc.fillColor("#111827").fontSize(18).text(`${salary.month} ${salary.year}`, 50, 145);
    doc.fillColor("#6b7280").fontSize(10).text("Payroll statement generated for the employee below.", 50, 170);

    doc.roundedRect(50, 200, 495, 130, 6).stroke("#d8dee9");
    doc.rect(50, 200, 495, 34).fill("#f3f6fb");
    doc.fillColor("#111827").fontSize(12).text("Employee Details", 70, 211);

    drawInfo(doc, "Employee ID", employee.employeeId, 70, 250);
    drawInfo(doc, "Employee Name", employee.name, 300, 250);
    drawInfo(doc, "Email", employee.email, 70, 295);
    drawInfo(doc, "Designation", employee.designation, 300, 295);

    doc.fillColor("#111827").fontSize(13).text("Salary Breakdown", 70, 365);
    doc.fillColor("#6b7280").fontSize(9).text("Earnings and deductions for this salary month.", 70, 383);

    drawRow(doc, "Base Salary", formatCurrency(salary.baseSalary), 410, "#ffffff");
    drawRow(doc, "House Rent Allowance (HRA)", formatCurrency(salary.hra), 440, "#f9fafb");
    drawRow(doc, "Allowances", formatCurrency(salary.allowances), 470, "#ffffff");
    drawRow(doc, "Deductions", `- ${formatCurrency(salary.deductions)}`, 500, "#fff7ed");

    doc.roundedRect(70, 550, 470, 54, 6).fill("#ecfdf5");
    doc.fillColor("#065f46").fontSize(11).text("Net Salary", 90, 568);
    doc.fillColor("#064e3b").fontSize(18).text(formatCurrency(salary.netSalary), 330, 562, {
      width: 185,
      align: "right"
    });

    doc.moveTo(50, 730).lineTo(545, 730).strokeColor("#d8dee9").stroke();
    doc.fillColor("#6b7280").fontSize(9).text("This is a system generated salary slip.", 50, 745, {
      width: 495,
      align: "center"
    });

    doc.end();
  });
};

module.exports = generateSalarySlip;
