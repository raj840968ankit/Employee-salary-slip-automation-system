const XLSX = require("xlsx");

const normalizeKey = (key) => String(key).trim();

const parseSpreadsheet = (filePath) => {
  const workbook = XLSX.readFile(filePath);
  const firstSheet = workbook.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[firstSheet], {
    defval: "",
    raw: false
  });

  return rows.map((row) => {
    const normalized = {};
    Object.keys(row).forEach((key) => {
      normalized[normalizeKey(key)] = typeof row[key] === "string" ? row[key].trim() : row[key];
    });
    return normalized;
  });
};

const validateColumns = (rows, requiredColumns) => {
  if (!rows.length) {
    return ["Uploaded file is empty"];
  }

  const availableColumns = Object.keys(rows[0]);
  return requiredColumns.filter((column) => !availableColumns.includes(column));
};

module.exports = {
  parseSpreadsheet,
  validateColumns
};
