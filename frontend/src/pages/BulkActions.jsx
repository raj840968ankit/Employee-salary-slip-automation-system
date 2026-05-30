import { useState } from "react";
import { Download, FileText, Send } from "lucide-react";
import AlertBox from "../components/AlertBox";
import api from "../services/api";
import getApiErrorMessage from "../utils/errorMessage";

function BulkActions() {
  const [loading, setLoading] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [pdfsGenerated, setPdfsGenerated] = useState(false);

  const runAction = async (action) => {
    setLoading(action);
    setMessage("");
    setError("");
    setResults([]);

    try {
      const endpoint = action === "pdf" ? "/api/salary/generate-all" : "/api/salary/send-all";
      const response = await api.post(endpoint);
      setMessage(action === "pdf" ? "Bulk PDFs generated." : response.data.message);
      setResults(response.data.results || []);
      if (action === "pdf") {
        setPdfsGenerated(true);
      }
    } catch (err) {
      setError(await getApiErrorMessage(err, "Bulk action failed"));
    } finally {
      setLoading("");
    }
  };

  const downloadAllPdfs = async () => {
    setLoading("download");
    setMessage("");
    setError("");

    try {
      const response = await api.get("/api/salary/download-all", {
        responseType: "blob"
      });
      const url = window.URL.createObjectURL(new Blob([response.data], { type: "application/zip" }));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "salary-slips.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      setMessage("All PDFs downloaded.");
    } catch (err) {
      setError(await getApiErrorMessage(err, "Unable to download PDFs"));
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
          {pdfsGenerated ? (
            <button className="btn btn-primary" onClick={downloadAllPdfs} disabled={!!loading}>
              <Download size={17} />
              {loading === "download" ? "Downloading..." : "Download All PDFs"}
            </button>
          ) : (
            <button className="btn btn-primary" onClick={() => runAction("pdf")} disabled={!!loading}>
              <FileText size={17} />
              {loading === "pdf" ? "Generating..." : "Generate All PDFs"}
            </button>
          )}
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
