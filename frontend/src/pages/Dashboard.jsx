import { useEffect, useState } from "react";
import { MailCheck, ReceiptText, UsersRound } from "lucide-react";
import api from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    employees: 0,
    salaryRecords: 0,
    emailsSent: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      const [employeesRes, salaryRes] = await Promise.all([
        api.get("/api/employees"),
        api.get("/api/salary")
      ]);

      setStats({
        employees: employeesRes.data.length,
        salaryRecords: salaryRes.data.length,
        emailsSent: salaryRes.data.filter((record) => record.emailStatus === "Sent").length
      });
    };

    loadStats().catch(() => {});
  }, []);

  return (
    <>
      <div className="page-title">
        <h2>Dashboard</h2>
        <p>Quick overview of employees, salary records, and sent emails.</p>
      </div>

      <div className="row g-3">
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon icon-users"><UsersRound size={22} /></div>
            <div className="label">Total Employees</div>
            <div className="value">{stats.employees}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon icon-records"><ReceiptText size={22} /></div>
            <div className="label">Total Salary Records</div>
            <div className="value">{stats.salaryRecords}</div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="stat-card">
            <div className="stat-icon icon-mail"><MailCheck size={22} /></div>
            <div className="label">Total Emails Sent</div>
            <div className="value">{stats.emailsSent}</div>
          </div>
        </div>
      </div>

      <div className="panel mt-4 workflow-panel">
        <div>
          <span className="step-number">1</span>
          <strong>Upload Employees</strong>
          <p>Preview master data and save valid rows.</p>
        </div>
        <div>
          <span className="step-number">2</span>
          <strong>Upload Salaries</strong>
          <p>Validate IDs and calculate net salary.</p>
        </div>
        <div>
          <span className="step-number">3</span>
          <strong>Generate & Email</strong>
          <p>Create PDFs and dispatch slips.</p>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
