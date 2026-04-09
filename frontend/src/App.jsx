import { useState, useRef, useCallback } from "react";
import axios from "axios";
import "./App.css";

const API = "";

const DEFAULT_OPTS = {
  threshold: 240,
  meshSize: 20,
  meshColorR: 180,
  meshColorG: 180,
  meshColorB: 180,
  meshAlpha: 0.6,
  minArea: 500,
  mode: "bright",
};

export default function App() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [opts, setOpts] = useState(DEFAULT_OPTS);
  const [jobId, setJobId] = useState(null);
  const [job, setJob] = useState(null);
  const [error, setError] = useState("");
  const fileInput = useRef();
  const pollRef = useRef();

  const set = (key) => (e) =>
    setOpts((o) => ({
      ...o,
      [key]:
        e.target.type === "range" || e.target.type === "number"
          ? Number(e.target.value)
          : e.target.value,
    }));

  const onDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("video/")) setFile(f);
  }, []);

  const pollStatus = (id) => {
    pollRef.current = setInterval(async () => {
      try {
        const { data } = await axios.get(`${API}/api/status/${id}`);
        setJob(data);
        if (data.status === "done" || data.status === "error") {
          clearInterval(pollRef.current);
        }
      } catch {
        clearInterval(pollRef.current);
      }
    }, 800);
  };

  const handleSubmit = async () => {
    if (!file) return;
    setError("");
    setJob(null);
    setJobId(null);
    clearInterval(pollRef.current);

    const form = new FormData();
    form.append("video", file);
    Object.entries(opts).forEach(([k, v]) => form.append(k, v));

    try {
      const { data } = await axios.post(`${API}/api/upload`, form);
      setJobId(data.jobId);
      setJob({ status: "queued", progress: 0, message: "Queued…" });
      pollStatus(data.jobId);
    } catch (err) {
      setError(err.response?.data?.error || "Upload failed");
    }
  };

  const meshColor = `rgb(${opts.meshColorR},${opts.meshColorG},${opts.meshColorB})`;
  const isProcessing = job?.status === "processing" || job?.status === "queued";

  return (
    <div className="app">
      <header className="header">
        <h1>Video Mesh</h1>
        <p className="subtitle">
          Detect blank regions in a video and fill them with a mesh overlay
        </p>
      </header>

      <main className="main">
        {/* Drop zone */}
        <section
          className={`dropzone${dragging ? " dragging" : ""}${file ? " has-file" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => fileInput.current.click()}
        >
          <input
            ref={fileInput}
            type="file"
            accept="video/*"
            style={{ display: "none" }}
            onChange={(e) => e.target.files[0] && setFile(e.target.files[0])}
          />
          {file ? (
            <>
              <div className="drop-icon">🎬</div>
              <div className="file-name">{file.name}</div>
              <div className="file-meta">
                {(file.size / 1024 / 1024).toFixed(1)} MB — click to change
              </div>
            </>
          ) : (
            <>
              <div className="drop-icon">⬆</div>
              <div className="drop-label">Drop a video here or click to browse</div>
              <div className="drop-hint">MP4, MOV, AVI — recommended ~3 seconds</div>
            </>
          )}
        </section>

        {/* Settings */}
        <section className="settings">
          <h2>Settings</h2>

          <div className="setting-row">
            <label>Detection mode</label>
            <select value={opts.mode} onChange={set("mode")}>
              <option value="bright">Bright blanks (white regions)</option>
              <option value="dark">Dark blanks (black bars)</option>
              <option value="both">Both bright &amp; dark</option>
            </select>
          </div>

          <div className="setting-row">
            <label>
              Brightness threshold <span className="val">{opts.threshold}</span>
            </label>
            <input
              type="range"
              min={100}
              max={255}
              value={opts.threshold}
              onChange={set("threshold")}
            />
          </div>

          <div className="setting-row">
            <label>
              Mesh cell size <span className="val">{opts.meshSize}px</span>
            </label>
            <input
              type="range"
              min={5}
              max={80}
              value={opts.meshSize}
              onChange={set("meshSize")}
            />
          </div>

          <div className="setting-row">
            <label>
              Mesh opacity <span className="val">{opts.meshAlpha}</span>
            </label>
            <input
              type="range"
              min={0.1}
              max={1}
              step={0.05}
              value={opts.meshAlpha}
              onChange={set("meshAlpha")}
            />
          </div>

          <div className="setting-row">
            <label>
              Minimum blank area <span className="val">{opts.minArea}px²</span>
            </label>
            <input
              type="range"
              min={100}
              max={10000}
              step={100}
              value={opts.minArea}
              onChange={set("minArea")}
            />
          </div>

          <div className="setting-row color-row">
            <label>Mesh color</label>
            <div className="color-inputs">
              <label>
                R
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={opts.meshColorR}
                  onChange={set("meshColorR")}
                />
              </label>
              <label>
                G
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={opts.meshColorG}
                  onChange={set("meshColorG")}
                />
              </label>
              <label>
                B
                <input
                  type="number"
                  min={0}
                  max={255}
                  value={opts.meshColorB}
                  onChange={set("meshColorB")}
                />
              </label>
              <div
                className="color-swatch"
                style={{ background: meshColor }}
                title={meshColor}
              />
            </div>
          </div>
        </section>

        {/* Submit */}
        <button
          className="process-btn"
          disabled={!file || isProcessing}
          onClick={handleSubmit}
        >
          {isProcessing ? "Processing…" : "Process Video"}
        </button>

        {error && <div className="error-msg">{error}</div>}

        {/* Progress */}
        {job && (
          <section className="progress-section">
            <div className="status-row">
              <span className={`badge badge-${job.status}`}>{job.status}</span>
              <span className="progress-msg">{job.message}</span>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <div className="progress-pct">{job.progress}%</div>

            {job.status === "done" && (
              <a
                className="download-btn"
                href={`${API}/api/download/${jobId}`}
                download
              >
                ⬇ Download Meshed Video
              </a>
            )}

            {job.status === "error" && (
              <div className="error-msg">Error: {job.message}</div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}
