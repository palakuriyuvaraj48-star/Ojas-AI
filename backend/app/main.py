"""FastAPI boundary for real-time form analysis.

Inference packages are deliberately loaded inside the service layer in the next
iteration so the API can start on CPU-only machines and report model readiness.
"""
from datetime import datetime, timezone
from typing import Literal

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

app = FastAPI(title="Titan Form Analysis API", version="0.1.0")


class FrameTelemetry(BaseModel):
    exercise: str = "squat"
    confidence: float = Field(0.0, ge=0, le=1)
    knee_angle: float | None = Field(None, ge=0, le=180)
    hip_angle: float | None = Field(None, ge=0, le=180)


class AnalysisResult(BaseModel):
    exercise: str
    confidence: float
    rep_delta: int
    form_score: int
    feedback: list[str]
    processed_at: datetime


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "inference": "configure MediaPipe/YOLO model weights to enable"}


@app.post("/v1/analyze", response_model=AnalysisResult)
def analyze_frame(frame: FrameTelemetry) -> AnalysisResult:
    """Return a deterministic contract-safe result until model weights are mounted.

    The request/response shape is the same endpoint used by the browser stream;
    replace this function with PoseService inference without changing clients.
    """
    depth = frame.knee_angle is not None and frame.knee_angle <= 105
    score = 92 if depth else 74
    feedback = ["Excellent depth and knee tracking."] if depth else ["Go lower while keeping your heels grounded."]
    return AnalysisResult(exercise=frame.exercise, confidence=frame.confidence, rep_delta=int(depth), form_score=score, feedback=feedback, processed_at=datetime.now(timezone.utc))


@app.websocket("/v1/stream")
async def stream_analysis(websocket: WebSocket) -> None:
    await websocket.accept()
    try:
        while True:
            payload = FrameTelemetry.model_validate_json(await websocket.receive_text())
            result = analyze_frame(payload)
            await websocket.send_json(result.model_dump(mode="json"))
    except WebSocketDisconnect:
        return
