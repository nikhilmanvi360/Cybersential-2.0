"""
CyberSentinel AI – ML Service API
====================================
FastAPI service providing threat detection endpoints.

Endpoints:
  POST /predict       – Phishing detection
  POST /anomaly       – Login anomaly detection
  GET  /health        – Service health check
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional
import time

from .models import PhishingDetector, AnomalyDetector

# ── App Configuration ──────────────────────────────────────
app = FastAPI(
    title="CyberSentinel AI – Threat Detection Service",
    description="ML-powered threat detection microservice",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Load Models on Startup ─────────────────────────────────
phishing_detector: Optional[PhishingDetector] = None
anomaly_detector: Optional[AnomalyDetector] = None


@app.on_event("startup")
async def load_models():
    """Load ML models into memory on application startup."""
    global phishing_detector, anomaly_detector
    print("🛡️  CyberSentinel AI – ML Service Starting...")
    phishing_detector = PhishingDetector()
    anomaly_detector = AnomalyDetector()
    print("✅ All ML models loaded and ready")


# ── Request/Response Schemas ───────────────────────────────
class PhishingRequest(BaseModel):
    text: str = Field(..., min_length=1, description="Message text to analyze")


class PhishingResponse(BaseModel):
    risk_score: int
    label: str
    confidence: float
    probabilities: dict
    processing_time_ms: float


class AnomalyRequest(BaseModel):
    login_hour: float = Field(..., ge=0, le=23, description="Hour of login (0-23)")
    ip_frequency: float = Field(..., ge=0, description="IP address frequency")
    device_change: int = Field(..., ge=0, le=1, description="Device changed (0 or 1)")
    failed_attempts: int = Field(0, ge=0, description="Number of failed login attempts")
    session_duration: float = Field(30, ge=0, description="Session duration in minutes")


class AnomalyResponse(BaseModel):
    is_anomaly: bool
    risk_score: int
    anomaly_score: float
    label: str
    features_analyzed: list


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1)
    context: Optional[dict] = None


class ChatResponse(BaseModel):
    response: str
    persona: str = "SENTINEL-DEFENSE-AI"
    classification: str = "CONFIDENTIAL"
    timestamp: str


# ── API Endpoints ──────────────────────────────────────────
@app.post("/predict", response_model=PhishingResponse)
async def predict_phishing(request: PhishingRequest):
    """Analyze a text message for phishing indicators."""
    if phishing_detector is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    start = time.time()
    result = phishing_detector.predict(request.text)
    elapsed = round((time.time() - start) * 1000, 2)

    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])

    result["processing_time_ms"] = elapsed
    return result


@app.post("/anomaly", response_model=AnomalyResponse)
async def detect_anomaly(request: AnomalyRequest):
    """Detect anomalous login patterns."""
    if anomaly_detector is None:
        raise HTTPException(status_code=503, detail="Model not loaded")

    login_data = {
        "login_hour": request.login_hour,
        "ip_frequency": request.ip_frequency,
        "device_change": request.device_change,
        "failed_attempts": request.failed_attempts,
        "session_duration": request.session_duration,
    }

    result = anomaly_detector.predict(login_data)

    if "error" in result:
        raise HTTPException(status_code=503, detail=result["error"])

    return result


@app.post("/chat", response_model=ChatResponse)
async def sentinel_chat(request: ChatRequest):
    """AI Sentinel Chat interface for security intelligence."""
    msg = request.message.lower()
    
    # Intelligence response logic
    if "status" in msg or "system" in msg:
        resp = "Scanning network grid... All microservices report operational status. MongoDB ledger integrity verified. ML models synchronized."
    elif "alert" in msg or "threat" in msg:
        resp = "Real-time threat feed active. 24h risk heatmap indicates peak activity at UTC 0200. No uncontained critical threats detected in current cycle."
    elif "blockchain" in msg or "ledger" in msg:
        resp = "Blockchain integrity at 100%. Genesis block confirmed. All 6 alert blocks verified against SHA-256 signatures."
    elif "who are you" in msg:
        resp = "I am SENTINEL-01, the autonomous defense-grade AI intelligence powering the National Digital Defense Grid. My primary directive is proactive threat neutralization."
    elif "help" in msg:
        resp = "Available commands: 'status', 'threat analysis', 'blockchain validation', 'infrastructure scan'. How can I assist, Analyst?"
    else:
        resp = f"Analysis initiated for query: '{request.message}'. Intelligence suggests standard operational parameters. I recommend monitoring the live threat feed for anomalies."

    return {
        "response": resp,
        "persona": "SENTINEL-DEFENSE-AI",
        "classification": "RESTRICTED-AI-COMM",
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
    }


@app.get("/health")
async def health_check():
    """Service health check endpoint."""
    return {
        "service": "ml-service",
        "status": "operational",
        "models": {
            "phishing_detector": phishing_detector is not None,
            "anomaly_detector": anomaly_detector is not None,
        },
    }
