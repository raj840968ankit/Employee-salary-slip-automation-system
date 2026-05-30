import { useState } from "react";
import AlertBox from "../components/AlertBox";
import FileUploadForm from "../components/FileUploadForm";
import api from "../services/api";
import getApiErrorMessage from "../utils/errorMessage";

function SalaryUpload() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleUpload = async (file) => {
    setLoading(true);
    setMessage("");
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/api/salary/upload", formData);
      setResult(response.data);
      setMessage(`Preview ready: ${response.data.previewCount} valid records and ${response.data.rejectedCount} rejected rows.`);
    } catch (err) {
      setError(await getApiErrorMessage(err, "Salary upload failed"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecords = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/api/salary/save-preview", {
        records: result.preview
      });
      setMessage(`Saved ${response.data.savedCount} salary records successfully.`);
      setResult(null);
    } catch (err) {
      setError(await getApiErrorMessage(err, "Unable to save salary records"));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-title">
        <h2>Salary Upload</h2>
        <p>Upload monthly salary data, review the preview, then save the valid records.</p>
      </div>

      <AlertBox type="success" message={message} />
      <AlertBox type="danger" message={error} />
      <FileUploadForm label="Monthly Salary Data File" onSubmit={handleUpload} loading={loading} />

      {result?.preview?.length > 0 && (
        <div className="panel mt-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h5 className="mb-1">Preview Salary Records</h5>
              <div className="text-muted small">These records are not saved yet.</div>
            </div>
            <button className="btn btn-primary" onClick={handleSaveRecords} disabled={saving}>
              {saving ? "Saving..." : "Save Salary Records"}
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Designation</th>
                  <th>Base</th>
                  <th>HRA</th>
                  <th>Allowances</th>
                  <th>Deductions</th>
                  <th>Month</th>
                  <th>Year</th>
                  <th>Net Salary</th>
                </tr>
              </thead>
              <tbody>
                {result.preview.map((record, index) => (
                  <tr key={`${record.employeeId}-${record.month}-${record.year}-${index}`}>
                    <td>{record.employeeId}</td>
                    <td>{record.employeeName}</td>
                    <td>{record.designation}</td>
                    <td>{record.baseSalary}</td>
                    <td>{record.hra}</td>
                    <td>{record.allowances}</td>
                    <td>{record.deductions}</td>
                    <td>{record.month}</td>
                    <td>{record.year}</td>
                    <td>{record.netSalary}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {result?.rejected?.length > 0 && (
        <div className="panel mt-4">
          <h5>Rejected Rows</h5>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {result.rejected.map((item, index) => (
                  <tr key={`${item.row.employeeId}-${index}`}>
                    <td>{item.row.employeeId}</td>
                    <td>{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}

export default SalaryUpload;
