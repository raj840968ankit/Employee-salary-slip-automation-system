const mongoose = require("mongoose");

const salarySchema = new mongoose.Schema({
  employeeId: {
    type: String,
    required: true,
    trim: true
  },
  baseSalary: {
    type: Number,
    required: true,
    min: 0
  },
  hra: {
    type: Number,
    required: true,
    min: 0
  },
  allowances: {
    type: Number,
    required: true,
    min: 0
  },
  deductions: {
    type: Number,
    required: true,
    min: 0
  },
  month: {
    type: String,
    required: true,
    trim: true
  },
  year: {
    type: Number,
    required: true
  },
  netSalary: {
    type: Number,
    required: true
  },
  pdfPath: {
    type: String,
    default: ""
  },
  emailStatus: {
    type: String,
    enum: ["Not Sent", "Sent", "Failed"],
    default: "Not Sent"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Salary", salarySchema);
