const path = require("path");
const multer = require("multer");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads"));
  },
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, "-");
    cb(null, `${Date.now()}-${safeName}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = [".csv", ".xlsx", ".xls"];
  const extension = path.extname(file.originalname).toLowerCase();

  if (!allowed.includes(extension)) {
    return cb(new Error("Only CSV, XLSX, and XLS files are allowed"));
  }

  cb(null, true);
};

module.exports = multer({ storage, fileFilter });
