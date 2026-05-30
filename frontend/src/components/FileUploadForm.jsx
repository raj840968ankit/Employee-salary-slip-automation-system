import { useState } from "react";
import { UploadCloud } from "lucide-react";

function FileUploadForm({ label, onSubmit, loading }) {
  const [file, setFile] = useState(null);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (file) {
      onSubmit(file);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel upload-panel">
      <div className="upload-zone">
        <UploadCloud size={34} />
        <div>
          <label className="form-label">{label}</label>
          <p>Choose a CSV, XLSX, or XLS file to validate before saving.</p>
        </div>
        <input
          type="file"
          className="form-control"
          accept=".csv,.xlsx,.xls"
          onChange={(event) => setFile(event.target.files[0])}
        />
      </div>
      {file && <div className="selected-file">Selected file: {file.name}</div>}
      <button type="submit" className="btn btn-primary" disabled={!file || loading}>
        {loading ? "Checking File..." : "Upload & Preview"}
      </button>
    </form>
  );
}

export default FileUploadForm;
