const path = require("path");
const fs = require("fs");
const Employee = require("../models/Employee");
const Salary = require("../models/Salary");
const generateSalarySlip = require("../utils/pdfGenerator");
const sendSalaryEmail = require("../utils/emailSender");

const publicPdfPath = (absolutePath) => {
  const fileName = path.basename(absolutePath);
  return `/generated-pdfs/${fileName}`;
};

const findSalaryWithEmployee = async (salaryId) => {
  const salary = await Salary.findById(salaryId);
  if (!salary) {
    const error = new Error("Salary record not found");
    error.status = 404;
    throw error;
  }

  const employee = await Employee.findOne({ employeeId: salary.employeeId });
  if (!employee) {
    const error = new Error("Employee not found for salary record");
    error.status = 404;
    throw error;
  }

  return { salary, employee };
};

const generatePdfForSalary = async (salaryId) => {
  const { salary, employee } = await findSalaryWithEmployee(salaryId);
  const absolutePath = await generateSalarySlip({ salary, employee });
  salary.pdfPath = publicPdfPath(absolutePath);
  await salary.save();
  return salary;
};

const sendEmailForSalary = async (salaryId) => {
  const { salary, employee } = await findSalaryWithEmployee(salaryId);

  let refreshedSalary = salary;
  let absolutePdfPath = salary.pdfPath
    ? path.join(__dirname, "..", "generated-pdfs", path.basename(salary.pdfPath))
    : "";

  if (!salary.pdfPath || !fs.existsSync(absolutePdfPath)) {
    await generatePdfForSalary(salary._id);
    refreshedSalary = await Salary.findById(salaryId);
    absolutePdfPath = path.join(__dirname, "..", "generated-pdfs", path.basename(refreshedSalary.pdfPath));
  }

  try {
    await sendSalaryEmail({ employee, salary: refreshedSalary, pdfPath: absolutePdfPath });
    refreshedSalary.emailStatus = "Sent";
    await refreshedSalary.save();
    return refreshedSalary;
  } catch (error) {
    refreshedSalary.emailStatus = "Failed";
    await refreshedSalary.save();
    throw error;
  }
};

module.exports = {
  generatePdfForSalary,
  sendEmailForSalary
};
