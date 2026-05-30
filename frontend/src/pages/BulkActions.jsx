import { useState } from "react";
import { FileText, Send } from "lucide-react";
import AlertBox from "../components/AlertBox";
import api from "../services/api";

function BulkActions() {
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);

  const runAction = async (action) => {
    setLoading(action);
    setMessage("");
    setError("");
    setResults([]);

    try {
      const endpoint = action === "pdf" ? "/api/salary/generate-all" : "/api/salary/send-all";
      const response = await api.post(endpoint);
      setMessage(response.data.message);
      setResults(response.data.results || []);
    } catch (err) {
      setError(err.response?.data?.message || "Bulk action failed");
    } finally {
      setLoading("");
    }
  };

  return (
    <>
      <div className="page-title">
        <h2>Bulk Actions</h2>
        <p>Generate all pending salary slip PDFs or email all salary slips.</p>
      </div>

      <AlertBox type="success" message={message} />
      <AlertBox type="danger" message={error} />

      <div className="panel">
        <div className="d-flex flex-wrap gap-3">
          <button className="btn btn-primary" onClick={() => runAction("pdf")} disabled={!!loading}>
            <FileText size={17} />
            {loading === "pdf" ? "Generating..." : "Generate All PDFs"}
          </button>
          <button className="btn btn-primary" onClick={() => runAction("email")} disabled={!!loading}>
            <Send size={17} />
            {loading === "email" ? "Sending..." : "Email All Salary Slips"}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="panel mt-4">
          <h5>Results</h5>
          <div className="table-responsive">
            <table className="table table-sm">
              <thead>
                <tr>
                  <th>Record ID</th>
                  <th>Status</th>
                  <th>Reason</th>
                </tr>
              </thead>
              <tbody>
                {results.map((item) => (
                  <tr key={item.id}>
                    <td>{item.id}</td>
                    <td>{item.status}</td>
                    <td>{item.reason || "-"}</td>
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

export default BulkActions;
