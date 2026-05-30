const express = require("express");
const upload = require("../utils/upload");
const {
  uploadSalary,
  saveSalaryPreview,
  getSalaryRecords,
  generatePdf,
  sendEmail,
  generateAllPdfs,
  downloadAllPdfs,
  sendAllEmails
} = require("../controllers/salaryController");

const router = express.Router();

router.post("/upload", upload.single("file"), uploadSalary);
router.post("/save-preview", saveSalaryPreview);
router.get("/", getSalaryRecords);
router.post("/generate-pdf/:id", generatePdf);
router.post("/send-email/:id", sendEmail);
router.post("/generate-all", generateAllPdfs);
router.get("/download-all", downloadAllPdfs);
router.post("/send-all", sendAllEmails);

module.exports = router;
