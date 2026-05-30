import { useState } from "react";
import AlertBox from "../components/AlertBox";
import FileUploadForm from "../components/FileUploadForm";
import api from "../services/api";

function EmployeeUpload() {
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
      const response = await api.post("/api/employees/upload", formData);
      setResult(response.data);
      setMessage(`Preview ready: ${response.data.previewCount} valid employees and ${response.data.rejectedCount} rejected rows.`);
    } catch (err) {
      setError(err.response?.data?.message || "Employee upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveRecords = async () => {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.post("/api/employees/save-preview", {
        records: result.preview
      });
      setMessage(`Saved ${response.data.savedCount} employee records successfully.`);
      setResult(null);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to save employee records");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="page-title">
        <h2>Employee Upload</h2>
        <p>Upload employee master data, review valid rows, then save them to MongoDB.</p>
      </div>

      <AlertBox type="success" message={message} />
      <AlertBox type="danger" message={error} />
      <FileUploadForm label="Employee Master Data File" onSubmit={handleUpload} loading={loading} />

      {result?.preview?.length > 0 && (
        <div className="panel mt-4">
          <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-3">
            <div>
              <h5 className="mb-1">Preview Employee Records</h5>
              <div className="text-muted small">These employee records are not saved yet.</div>
            </div>
            <button className="btn btn-primary" onClick={handleSaveRecords} disabled={saving}>
              {saving ? "Saving..." : "Save Employee Records"}
            </button>
          </div>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Employee ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Designation</th>
                </tr>
              </thead>
              <tbody>
                {result.preview.map((record, index) => (
                  <tr key={`${record.employeeId}-${index}`}>
                    <td>{record.employeeId}</td>
                    <td>{record.name}</td>
                    <td>{record.email}</td>
                    <td>{record.designation}</td>
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

export default EmployeeUpload;
