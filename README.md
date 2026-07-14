# Project Titan — AI Exercise Form Correction

Project Titan is a Next.js fitness dashboard with a real browser webcam surface, session controls, recording/upload hooks, and a companion FastAPI analysis contract.

## Run the web app

```bash
npm install
npm run dev
```

Open `http://localhost:3000/camera`. Camera access requires a secure context (`localhost` is supported) and a user permission grant.

## Analysis API

The API defines the stable REST/WebSocket contract for pose telemetry. It intentionally starts without bundled model weights; mount approved MediaPipe/YOLO weights before deploying it as a real inference service.

```bash
cd backend
python -m venv .venv
.venv/Scripts/pip install -r requirements.txt
.venv/Scripts/uvicorn app.main:app --reload --port 8000
```

- `GET /health` checks API readiness.
- `POST /v1/analyze` accepts normalized landmark-derived telemetry.
- `WS /v1/stream` accepts the same JSON payload for low-latency feedback.

## Architecture

```text
Browser camera / uploaded clip
        │
        ├── Next.js Vision Lens (consent, preview, recording, speech)
        │
        └── FastAPI stream contract
                ├── person tracking (YOLO)
                ├── pose landmarks (MediaPipe / YOLO Pose)
                ├── temporal rep state machine
                └── form-score and feedback service
```

## Safety and privacy

Video stays in the browser until a user explicitly submits it to an analysis endpoint. Form scores are coaching guidance, not medical advice. Production deployment should use authenticated users, HTTPS, a managed Postgres database, and an approved data-retention policy.
