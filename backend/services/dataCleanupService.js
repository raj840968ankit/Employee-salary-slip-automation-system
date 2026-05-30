const Employee = require("../models/Employee");
const Salary = require("../models/Salary");

const removeOrphanSalaryRecords = async () => {
  const employees = await Employee.find({}, "employeeId");
  const employeeIds = employees.map((employee) => employee.employeeId);

  if (!employeeIds.length) {
    const result = await Salary.deleteMany({});
    return result.deletedCount || 0;
  }

  const result = await Salary.deleteMany({
    employeeId: { $nin: employeeIds }
  });

  return result.deletedCount || 0;
};

module.exports = {
  removeOrphanSalaryRecords
};
