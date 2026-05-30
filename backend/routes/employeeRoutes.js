const express = require("express");
const upload = require("../utils/upload");
const { uploadEmployees, saveEmployeePreview, getEmployees } = require("../controllers/employeeController");

const router = express.Router();

router.post("/upload", upload.single("file"), uploadEmployees);
router.post("/save-preview", saveEmployeePreview);
router.get("/", getEmployees);

module.exports = router;
