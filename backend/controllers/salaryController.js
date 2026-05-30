const fs = require("fs");
const path = require("path");
const archiver = require("archiver");
const Employee = require("../models/Employee");
const Salary = require("../models/Salary");
const { parseSpreadsheet, validateColumns } = require("../utils/fileParser");
const { generatePdfForSalary, sendEmailForSalary } = require("../services/salaryService");
const { removeOrphanSalaryRecords } = require("../services/dataCleanupService");

const requiredSalaryColumns = [
  "employeeId",
  "baseSalary",
  "hra",
  "allowances",
  "deductions",
  "month",
  "year"
];

const toNumber = (value) => Number(String(value).replace(/,/g, ""));

const buildSalaryPreview = async (rows) => {
  const preview = [];
  const rejected = [];

  for (const row of rows) {
    const employeeId = String(row.employeeId || "").trim();
    const employee = await Employee.findOne({ employeeId });

    if (!employee) {
      rejected.push({ row, reason: "Invalid employee ID" });
      continue;
    }

    const baseSalary = toNumber(row.baseSalary);
    const hra = toNumber(row.hra);
    const allowances = toNumber(row.allowances);
    const deductions = toNumber(row.deductions);
    const year = toNumber(row.year);
    const month = String(row.month || "").trim();

    if ([baseSalary, hra, allowances, deductions, year].some((value) => Number.isNaN(value)) || !month) {
      rejected.push({ row, reason: "Invalid salary values" });
      continue;
    }

    const netSalary = baseSalary + hra + allowances - deductions;
    preview.push({
      employeeId,
      employeeName: employee.name,
      email: employee.email,
      designation: employee.designation,
      baseSalary,
      hra,
      allowances,
      deductions,
      month,
      year,
      netSalary
    });
  }

  return { preview, rejected };
};

const uploadSalary = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please upload a CSV or Excel file" });
    }

    const rows = parseSpreadsheet(req.file.path);
    const missingColumns = validateColumns(rows, requiredSalaryColumns);

    if (missingColumns.length) {
      return res.status(400).json({
        message: "Missing required columns",
        missingColumns
      });
    }

    const { preview, rejected } = await buildSalaryPreview(rows);

    fs.unlink(req.file.path, () => {});

    res.json({
      message: "Salary file parsed successfully. Review the preview before saving.",
      previewCount: preview.length,
      rejectedCount: rejected.length,
      preview,
      rejected
    });
  } catch (error) {
    next(error);
  }
};

const saveSalaryPreview = async (req, res, next) => {
  try {
    const records = Array.isArray(req.body.records) ? req.body.records : [];

    if (!records.length) {
      return res.status(400).json({ message: "No salary records provided to save" });
    }

    const { preview, rejected } = await buildSalaryPreview(records);

    if (!preview.length) {
      return res.status(400).json({
        message: "No valid salary records to save",
        rejected
      });
    }

    const saved = await Salary.insertMany(
      preview.map((record) => ({
        employeeId: record.employeeId,
        baseSalary: record.baseSalary,
        hra: record.hra,
        allowances: record.allowances,
        deductions: record.deductions,
        month: record.month,
        year: record.year,
        netSalary: record.netSalary
      }))
    );

    res.status(201).json({
      message: "Salary records saved successfully",
      savedCount: saved.length,
      rejectedCount: rejected.length,
      saved,
      rejected
    });
  } catch (error) {
    next(error);
  }
};

const getSalaryRecords = async (req, res, next) => {
  try {
    await removeOrphanSalaryRecords();

    const records = await Salary.aggregate([
      {
        $lookup: {
          from: "employees",
          localField: "employeeId",
          foreignField: "employeeId",
          as: "employee"
        }
      },
      { $unwind: { path: "$employee", preserveNullAndEmptyArrays: true } },
      { $sort: { createdAt: -1 } },
      {
        $project: {
          employeeId: 1,
          baseSalary: 1,
          hra: 1,
          allowances: 1,
          deductions: 1,
          month: 1,
          year: 1,
          netSalary: 1,
          pdfPath: 1,
          emailStatus: 1,
          createdAt: 1,
          employeeName: "$employee.name",
          email: "$employee.email",
          designation: "$employee.designation"
        }
      }
    ]);

    res.json(records);
  } catch (error) {
    next(error);
  }
};

const generatePdf = async (req, res, next) => {
  try {
    const salary = await generatePdfForSalary(req.params.id);
    res.json({ message: "PDF generated successfully", salary });
  } catch (error) {
    error.message = `PDF generation failure: ${error.message}`;
    next(error);
  }
};

const sendEmail = async (req, res, next) => {
  try {
    const salary = await sendEmailForSalary(req.params.id);
    res.json({ message: "Email sent successfully", salary });
  } catch (error) {
    error.message = `Email sending failure: ${error.message}`;
    next(error);
  }
};

const generateAllPdfs = async (req, res, next) => {
  try {
    await removeOrphanSalaryRecords();

    const salaries = await Salary.find();

    if (!salaries.length) {
      return res.status(400).json({
        message: "Can't generate PDFs because no salary records exist."
      });
    }

    const results = [];

    for (const salary of salaries) {
      try {
        const updated = await generatePdfForSalary(salary._id);
        results.push({ id: salary._id, status: "Generated", pdfPath: updated.pdfPath });
      } catch (error) {
        results.push({ id: salary._id, status: "Failed", reason: error.message });
      }
    }

    res.json({ message: "Bulk PDFs generated.", results });
  } catch (error) {
    next(error);
  }
};

const downloadAllPdfs = async (req, res, next) => {
  try {
    await removeOrphanSalaryRecords();

    const salaries = await Salary.find();

    if (!salaries.length) {
      return res.status(400).json({
        message: "Can't download PDFs because no salary records exist."
      });
    }

    const pdfFiles = [];

    for (const salary of salaries) {
      let currentSalary = salary;

      if (!currentSalary.pdfPath) {
        currentSalary = await generatePdfForSalary(currentSalary._id);
      }

      let absolutePdfPath = path.join(
        __dirname,
        "..",
        "generated-pdfs",
        path.basename(currentSalary.pdfPath)
      );

      if (!fs.existsSync(absolutePdfPath)) {
        currentSalary = await generatePdfForSalary(currentSalary._id);
        absolutePdfPath = path.join(
          __dirname,
          "..",
          "generated-pdfs",
          path.basename(currentSalary.pdfPath)
        );
      }

      if (fs.existsSync(absolutePdfPath)) {
        pdfFiles.push({
          path: absolutePdfPath,
          name: path.basename(currentSalary.pdfPath)
        });
      }
    }

    if (!pdfFiles.length) {
      return res.status(400).json({
        message: "No PDF files found to download."
      });
    }

    res.setHeader("Content-Type", "application/zip");
    res.setHeader("Content-Disposition", "attachment; filename=salary-slips.zip");

    const archive = archiver("zip", { zlib: { level: 9 } });

    archive.on("error", (err) => {
      console.error("Archiver error:", err);
      if (!res.headersSent) {
        res.status(500).json({ message: "Failed to create zip file" });
      }
    });

    archive.on("warning", (err) => {
      if (err.code !== "ENOENT") {
        console.warn("Archiver warning:", err);
      }
    });

    archive.pipe(res);

    pdfFiles.forEach((file) => {
      archive.file(file.path, { name: file.name });
    });

    await archive.finalize();
  } catch (error) {
    console.error("Download error:", error);
    next(error);
  }
};

const sendAllEmails = async (req, res, next) => {
  try {
    await removeOrphanSalaryRecords();

    const salaries = await Salary.find();

    if (!salaries.length) {
      return res.status(400).json({
        message: "Can't send emails because no salary records exist."
      });
    }

    const results = [];

    for (const salary of salaries) {
      try {
        await sendEmailForSalary(salary._id);
        results.push({ id: salary._id, status: "Sent" });
      } catch (error) {
        results.push({ id: salary._id, status: "Failed", reason: error.message });
      }
    }

    res.json({ message: "Bulk email sending completed", results });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadSalary,
  saveSalaryPreview,
  getSalaryRecords,
  generatePdf,
  sendEmail,
  generateAllPdfs,
  downloadAllPdfs,
  sendAllEmails
};
