const fs = require("fs");
const Employee = require("../models/Employee");
const { parseSpreadsheet, validateColumns } = require("../utils/fileParser");

const requiredEmployeeColumns = ["employeeId", "name", "email", "designation"];

const buildEmployeePreview = async (rows) => {
  const preview = [];
  const rejected = [];
  const seenIds = new Set();

  for (const row of rows) {
    const employeeId = String(row.employeeId || "").trim();
    const name = String(row.name || "").trim();
    const email = String(row.email || "").trim();
    const designation = String(row.designation || "").trim();

    if (!employeeId || !name || !email || !designation) {
      rejected.push({ row, reason: "All fields are required" });
      continue;
    }

    if (seenIds.has(employeeId)) {
      rejected.push({ row, reason: "Duplicate employee ID in uploaded file" });
      continue;
    }

    seenIds.add(employeeId);

    const exists = await Employee.findOne({ employeeId });
    if (exists) {
      rejected.push({ row, reason: "Employee ID already exists" });
      continue;
    }

    preview.push({ employeeId, name, email, designation });
  }

  return { preview, rejected };
};

const uploadEmployees = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a CSV or Excel file" });
    }

    const rows = parseSpreadsheet(req.file.path);
    const missingColumns = validateColumns(rows, requiredEmployeeColumns);

    if (missingColumns.length) {
      return res.status(400).json({
        message: "Missing required columns",
        missingColumns
      });
    }

    const { preview, rejected } = await buildEmployeePreview(rows);

    fs.unlink(req.file.path, () => {});

    res.json({
      message: "Employee file parsed successfully. Review the preview before saving.",
      previewCount: preview.length,
      rejectedCount: rejected.length,
      preview,
      rejected
    });
  } catch (error) {
    next(error);
  }
};

const saveEmployeePreview = async (req, res, next) => {
  try {
    const records = Array.isArray(req.body.records) ? req.body.records : [];

    if (!records.length) {
      return res.status(400).json({ message: "No employee records provided to save" });
    }

    const { preview, rejected } = await buildEmployeePreview(records);

    if (!preview.length) {
      return res.status(400).json({
        message: "No valid employee records to save",
        rejected
      });
    }

    const saved = await Employee.insertMany(preview);

    res.status(201).json({
      message: "Employee records saved successfully",
      savedCount: saved.length,
      rejectedCount: rejected.length,
      saved,
      rejected
    });
  } catch (error) {
    next(error);
  }
};

const getEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadEmployees,
  saveEmployeePreview,
  getEmployees
};
