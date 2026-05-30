import { BrowserRouter, NavLink, Route, Routes } from "react-router-dom";
import { BarChart3, FileSpreadsheet, MailCheck, ReceiptText, UsersRound } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import EmployeeUpload from "./pages/EmployeeUpload";
import SalaryUpload from "./pages/SalaryUpload";
import SalaryRecords from "./pages/SalaryRecords";
import BulkActions from "./pages/BulkActions";
import GlobalLoader from "./components/GlobalLoader";

const navItems = [
  { to: "/", label: "Dashboard", icon: BarChart3 },
  { to: "/employees/upload", label: "Employee Upload", icon: UsersRound },
  { to: "/salary/upload", label: "Salary Upload", icon: FileSpreadsheet },
  { to: "/salary-records", label: "Salary Records", icon: ReceiptText },
  { to: "/bulk-actions", label: "Bulk Actions", icon: MailCheck }
];

function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <GlobalLoader />
        <aside className="sidebar">
          <div className="brand-block">
            <div className="brand-mark">SS</div>
            <div>
              <h1>Salary Slip System</h1>
              <span>Payroll Automation</span>
            </div>
          </div>
          <nav>
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <item.icon size={18} />
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>
        <main className="content">
          <div className="topbar">
            <div>
              <strong>Nippon Toyota Pvt Ltd</strong>
              <span>Admin Payroll Portal</span>
            </div>
            <div className="topbar-badge">No Login Required</div>
          </div>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/employees/upload" element={<EmployeeUpload />} />
            <Route path="/salary/upload" element={<SalaryUpload />} />
            <Route path="/salary-records" element={<SalaryRecords />} />
            <Route path="/bulk-actions" element={<BulkActions />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
