"""Flask API backend for the Video Mesh Blank Spaces tool."""

import os
import uuid
import threading
from flask import Flask, request, jsonify, send_file
from flask.helpers import send_from_directory
from mesh_blank_spaces import process_video

app = Flask(__name__, static_folder="frontend/dist", static_url_path="")

UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# In-memory job store: {job_id: {status, progress, message, output}}
jobs: dict = {}
jobs_lock = threading.Lock()


def run_job(job_id: str, input_path: str, output_path: str, opts: dict) -> None:
    def progress_cb(current: int, total: int, meshed: int) -> None:
        pct = int(current / total * 100)
        with jobs_lock:
            jobs[job_id]["progress"] = pct
            jobs[job_id]["message"] = f"Frame {current}/{total} — meshed regions: {meshed}"

    try:
        with jobs_lock:
            jobs[job_id]["status"] = "processing"

        r, g, b = opts.get("meshColor", [180, 180, 180])
        process_video(
            input_path=input_path,
            output_path=output_path,
            threshold=opts.get("threshold", 240),
            mesh_size=opts.get("meshSize", 20),
            mesh_color=(b, g, r),  # OpenCV uses BGR
            alpha=opts.get("meshAlpha", 0.6),
            min_area=opts.get("minArea", 500),
            mode=opts.get("mode", "bright"),
            progress_cb=progress_cb,
        )
        with jobs_lock:
            jobs[job_id]["status"] = "done"
            jobs[job_id]["progress"] = 100
            jobs[job_id]["output"] = output_path
    except Exception as exc:
        with jobs_lock:
            jobs[job_id]["status"] = "error"
            jobs[job_id]["message"] = str(exc)


@app.route("/api/upload", methods=["POST"])
def upload():
    if "video" not in request.files:
        return jsonify({"error": "No video file provided"}), 400
    f = request.files["video"]
    if f.filename == "":
        return jsonify({"error": "Empty filename"}), 400

    job_id = str(uuid.uuid4())
    ext = os.path.splitext(f.filename)[1] or ".mp4"
    input_path = os.path.join(UPLOAD_DIR, f"{job_id}_input{ext}")
    output_path = os.path.join(OUTPUT_DIR, f"{job_id}_output.mp4")
    f.save(input_path)

    opts = {
        "threshold": int(request.form.get("threshold", 240)),
        "meshSize": int(request.form.get("meshSize", 20)),
        "meshColor": [
            int(request.form.get("meshColorR", 180)),
            int(request.form.get("meshColorG", 180)),
            int(request.form.get("meshColorB", 180)),
        ],
        "meshAlpha": float(request.form.get("meshAlpha", 0.6)),
        "minArea": int(request.form.get("minArea", 500)),
        "mode": request.form.get("mode", "bright"),
    }

    with jobs_lock:
        jobs[job_id] = {"status": "queued", "progress": 0, "message": "Starting…", "output": None}

    t = threading.Thread(target=run_job, args=(job_id, input_path, output_path, opts), daemon=True)
    t.start()

    return jsonify({"jobId": job_id})


@app.route("/api/status/<job_id>")
def status(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)
    if job is None:
        return jsonify({"error": "Unknown job"}), 404
    return jsonify(job)


@app.route("/api/download/<job_id>")
def download(job_id: str):
    with jobs_lock:
        job = jobs.get(job_id)
    if job is None or job["status"] != "done":
        return jsonify({"error": "Not ready"}), 404
    return send_file(os.path.abspath(job["output"]), as_attachment=True, download_name="meshed_output.mp4")


# Serve React app for all non-API routes
@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def serve_react(path):
    dist = os.path.join(app.static_folder)
    if path and os.path.exists(os.path.join(dist, path)):
        return send_from_directory(dist, path)
    return send_from_directory(dist, "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=False)
