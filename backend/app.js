const path = require("path");
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
require("dotenv").config();

const employeeRoutes = require("./routes/employeeRoutes");
const salaryRoutes = require("./routes/salaryRoutes");

const app = express();

app.set("trust proxy", 1);

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || !allowedOrigins.length || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS blocked request from ${origin}`));
    }
  })
);
app.use(morgan(":method :url :status :res[content-length] - :response-time ms"));
app.use(express.json());
app.use("/generated-pdfs", express.static(path.join(__dirname, "generated-pdfs")));

app.get("/", (req, res) => {
  res.json({ message: "Employee Salary Slip Automation API is running" });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/salary", salaryRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 500).json({
    message: error.message || "Internal server error"
  });
});

module.exports = app;
