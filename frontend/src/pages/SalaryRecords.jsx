import { useEffect, useState } from "react";
import AlertBox from "../components/AlertBox";
import api, { apiBaseUrl } from "../services/api";
import getApiErrorMessage from "../utils/errorMessage";

const statusClass = (status) => {
  if (status === "Sent") return "status-sent";
  if (status === "Failed") return "status-failed";
  return "status-pending";
};

function SalaryRecords() {
  const [records, setRecords] = useState([]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loadingId, setLoadingId] = useState("");

  const loadRecords = async () => {
    const response = await api.get("/api/salary");
    setRecords(response.data);
  };

  useEffect(() => {
    loadRecords().catch(() => setError("Unable to load salary records"));
  }, []);

  const handleGeneratePdf = async (id) => {
    setLoadingId(id);
    setMessage("");
    setError("");
    try {
      await api.post(`/api/salary/generate-pdf/${id}`);
      setMessage("PDF generated successfully");
      await loadRecords();
    } catch (err) {
      setError(getApiErrorMessage(err, "PDF generation failed"));
    } finally {
      setLoadingId("");
    }
  };

  const handleSendEmail = async (id) => {
    setLoadingId(id);
    setMessage("");
    setError("");
    try {
      await api.post(`/api/salary/send-email/${id}`);
      setMessage("Email sent successfully");
      await loadRecords();
    } catch (err) {
      setError(getApiErrorMessage(err, "Email sending failed"));
    } finally {
      setLoadingId("");
    }
  };

  return (
    <>
      <div className="page-title">
        <h2>Salary Records</h2>
        <p>View generated salary records, download PDFs, and send salary slips by email.</p>
      </div>

      <AlertBox type="success" message={message} />
      <AlertBox type="danger" message={error} />

      <div className="panel">
        <div className="table-responsive">
          <table className="table table-striped">
            <thead>
              <tr>
                <th>Employee ID</th>
                <th>Name</th>
                <th>Month</th>
                <th>Year</th>
                <th>Net Salary</th>
                <th>Email Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={record._id}>
                  <td>{record.employeeId}</td>
                  <td>{record.employeeName || "-"}</td>
                  <td>{record.month}</td>
                  <td>{record.year}</td>
                  <td>{record.netSalary}</td>
                  <td>
                    <span className={`status-pill ${statusClass(record.emailStatus)}`}>
                      {record.emailStatus}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-2 flex-wrap">
                      {record.pdfPath ? (
                        <>
                          <a className="btn btn-sm btn-outline-secondary" href={`${apiBaseUrl}${record.pdfPath}`} target="_blank" rel="noreferrer">
                            View PDF
                          </a>
                          <a className="btn btn-sm btn-outline-secondary" href={`${apiBaseUrl}${record.pdfPath}`} download>
                            Download
                          </a>
                        </>
                      ) : (
                        <button className="btn btn-sm btn-outline-primary" onClick={() => handleGeneratePdf(record._id)} disabled={loadingId === record._id}>
                          Generate PDF
                        </button>
                      )}
                      <button className="btn btn-sm btn-primary" onClick={() => handleSendEmail(record._id)} disabled={loadingId === record._id}>
                        Send Email
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!records.length && (
                <tr>
                  <td colSpan="7" className="text-center text-muted py-4">
                    No salary records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

export default SalaryRecords;
