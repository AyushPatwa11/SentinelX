import os
import logging
import time
from typing import Generator
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse, FileResponse, HTMLResponse

try:
    import cv2
except Exception:
    cv2 = None

import numpy as np

# Prepare a small fallback JPEG in case of stream errors
_FALLBACK_JPEG = None
if cv2 is not None:
    try:
        _fb = np.zeros((2, 2, 3), dtype=np.uint8)
        _, _buf = cv2.imencode('.jpg', _fb)
        _FALLBACK_JPEG = _buf.tobytes()
    except Exception:
        _FALLBACK_JPEG = None

app = FastAPI(title="SentinelX Backend")

# Use absolute path to avoid working-dir issues
BASE_DIR = os.path.dirname(__file__)
VIDEO_PATH = os.path.join(BASE_DIR, "videos", "smoke.mp4")

# Logger (use uvicorn error logger so messages appear in console)
logger = logging.getLogger("uvicorn.error")

# Global storage for alerts & snapshots
alerts_store = []

# Smoke detection configuration - INVERTED for smoke that darkens the scene
SMOKE_BASELINE_FRAMES = 30      # Number of frames to compute baseline
SMOKE_DELTA_THRESHOLD = -5      # NEGATIVE threshold - smoke DARKENS the scene
SMOKE_RETURN_THRESHOLD = -2     # How close to baseline to consider "smoke cleared"
ALERT_COOLDOWN_SEC = 5          # Minimum seconds between alerts

# Smoke detection state (global across requests)
class SmokeDetectionState:
    def __init__(self):
        self.baseline_intensities = []
        self.baseline_intensity = 0.0
        self.smoke_active = False           # TRUE when smoke is currently detected
        self.last_alert_time = 0            # Timestamp of last alert
        self.frame_count = 0
        self.max_intensity_seen = 0.0       # Track max for debugging
        
    def reset(self):
        """Reset state when video loops"""
        self.baseline_intensities = []
        self.baseline_intensity = 0.0
        self.smoke_active = False
        self.frame_count = 0
        self.max_intensity_seen = 0.0

smoke_state = SmokeDetectionState()


@app.get("/")
def root():
    return {"message": "SentinelX backend is running"}


@app.get("/status")
def status():
    return {
        "system": "SentinelX",
        "monitoring": "active",
        "anomaly_score": 18,
        "risk_level": "LOW"
    }


def detect_smoke_event(frame):
    """
    Smoke EVENT detection (not per-frame).
    
    Returns: (event_triggered: bool, avg_intensity: float, delta: float)
    
    Logic:
    1. First N frames: build baseline (normal/no-smoke intensity)
    2. After baseline established:
       - If intensity jumps +DELTA above baseline AND smoke_active=False:
         → Trigger event, set smoke_active=True
       - If intensity returns close to baseline AND smoke_active=True:
         → Reset smoke_active=False (ready for next event)
       - If smoke_active=True already:
         → No new event (prevents continuous alerts)
    """
    global smoke_state
    
    try:
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        avg_intensity = gray.mean()
        
        # Track max intensity for debugging
        if avg_intensity > smoke_state.max_intensity_seen:
            smoke_state.max_intensity_seen = avg_intensity
        
        # Phase 1: Build baseline from first N frames
        if len(smoke_state.baseline_intensities) < SMOKE_BASELINE_FRAMES:
            smoke_state.baseline_intensities.append(avg_intensity)
            
            if len(smoke_state.baseline_intensities) == SMOKE_BASELINE_FRAMES:
                smoke_state.baseline_intensity = sum(smoke_state.baseline_intensities) / len(smoke_state.baseline_intensities)
                logger.info(f"✓ Baseline established: {smoke_state.baseline_intensity:.2f}")
            
            return False, avg_intensity, 0.0
        
        # Phase 2: Detect smoke events
        delta = avg_intensity - smoke_state.baseline_intensity
        
        # MORE FREQUENT logging (every 30 frames) to see what's happening
        smoke_state.frame_count += 1
        if smoke_state.frame_count % 30 == 0:
            logger.info(f"Monitor | Intensity: {avg_intensity:.2f} | Baseline: {smoke_state.baseline_intensity:.2f} | Delta: {delta:+.2f} | Max: {smoke_state.max_intensity_seen:.2f} | Smoke: {smoke_state.smoke_active}")
        
        # Case A: Smoke appears (intensity DROPS below threshold - smoke darkens scene)
        if delta < SMOKE_DELTA_THRESHOLD and not smoke_state.smoke_active:
            smoke_state.smoke_active = True
            logger.warning(f"🔥 SMOKE EVENT STARTED | Intensity: {avg_intensity:.2f} | Delta: {delta:+.2f}")
            return True, avg_intensity, delta
        
        # Case B: Smoke clears (intensity returns near baseline)
        elif delta >= SMOKE_RETURN_THRESHOLD and smoke_state.smoke_active:
            smoke_state.smoke_active = False
            logger.info(f"✓ Smoke cleared | Intensity: {avg_intensity:.2f} | Delta: {delta:+.2f}")
            return False, avg_intensity, delta
        
        # Case C: Smoke still active (no new event)
        elif smoke_state.smoke_active:
            # Already in smoke state, don't trigger new event
            return False, avg_intensity, delta
        
        # Case D: Normal state (no smoke)
        else:
            return False, avg_intensity, delta
        
    except Exception as e:
        logger.error(f"detect_smoke_event error: {e}")
        return False, 0.0, 0.0


@app.get("/snapshot/{filename}")
def get_snapshot(filename: str):
    """Serve a saved snapshot image file from backend directory"""
    path = os.path.join(BASE_DIR, filename)
    if not os.path.exists(path):
        raise HTTPException(status_code=404, detail="Snapshot not found")
    return FileResponse(path=path)


def video_generator() -> Generator[bytes, None, None]:
    """
    Stream video frames with smoke event detection.
    
    Key changes:
    - Triggers alert ONLY when smoke event starts (not every frame)
    - Saves ONE snapshot per event
    - Enforces cooldown between alerts
    - Resets state when video loops
    """
    global smoke_state
    
    cap = cv2.VideoCapture(VIDEO_PATH)
    if not cap.isOpened():
        logger.error(f"VideoCapture failed to open: {VIDEO_PATH}")
        rel_path = os.path.join(os.getcwd(), "videos", "smoke.mp4")
        logger.error(f"Attempting fallback path: {rel_path}")
        cap = cv2.VideoCapture(rel_path)
        if not cap.isOpened():
            logger.error("Fallback VideoCapture also failed. Streaming fallback frames.")

    while True:
        try:
            success, frame = cap.read()
            
            # Video ended - loop back and reset detection state
            if not success:
                logger.info(f"Video ended, looping. Max intensity seen was: {smoke_state.max_intensity_seen:.2f}")
                cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
                smoke_state.reset()  # Reset baseline and smoke_active
                time.sleep(0.05)
                continue

            # Detect smoke EVENT (not per-frame detection)
            event_triggered, intensity, delta = detect_smoke_event(frame)

            # Generate alert ONLY if:
            # 1. Event was triggered (smoke appeared for first time)
            # 2. Cooldown period has passed
            if event_triggered:
                current_time = time.time()
                
                if current_time - smoke_state.last_alert_time >= ALERT_COOLDOWN_SEC:
                    smoke_state.last_alert_time = current_time
                    
                    # Save ONE snapshot for this event
                    timestamp = int(current_time)
                    snapshot_path = f"snapshot_{timestamp}.jpg"
                    
                    try:
                        cv2.imwrite(snapshot_path, frame)
                        logger.info(f"📸 Snapshot saved: {snapshot_path}")
                    except Exception as e:
                        logger.error(f"Failed to save snapshot: {e}")

                    # Create ONE alert for this event
                    alert = {
                        "id": timestamp,
                        "type": "Smoke",
                        "location": "Kitchen Module",
                        "severity": "HIGH",
                        "anomaly_score": round(intensity, 2),
                        "delta": round(delta, 2),
                        "snapshot": snapshot_path,
                        "time": time.strftime("%H:%M:%S", time.localtime(current_time))
                    }
                    alerts_store.append(alert)
                    logger.info(f"🚨 Alert created: {alert}")
                else:
                    logger.debug("Event triggered but cooldown active, skipping alert")

            # Encode frame for streaming
            try:
                _, buffer = cv2.imencode('.jpg', frame)
                frame_bytes = buffer.tobytes()
            except Exception as e:
                logger.error(f"imencode error: {e}")
                if _FALLBACK_JPEG is not None:
                    frame_bytes = _FALLBACK_JPEG
                else:
                    time.sleep(0.05)
                    continue

            yield (
                b"--frame\r\n"
                b"Content-Type: image/jpeg\r\n\r\n" + frame_bytes + b"\r\n"
            )
            
        except Exception as ex:
            logger.error(f"video_generator exception: {ex}")
            if _FALLBACK_JPEG is not None:
                yield (
                    b"--frame\r\n"
                    b"Content-Type: image/jpeg\r\n\r\n" + _FALLBACK_JPEG + b"\r\n"
                )
            else:
                time.sleep(0.1)
                continue


@app.get("/video")
def video_feed():
    if cv2 is None:
        return JSONResponse(status_code=503, content={"detail": "OpenCV (cv2) is not installed on the server"})

    return StreamingResponse(
        video_generator(),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )


@app.get("/video_file")
def video_file():
    """Serve the MP4 file directly (no detection)"""
    try:
        return FileResponse(VIDEO_PATH, media_type="video/mp4")
    except Exception as e:
        raise HTTPException(status_code=404, detail=str(e))


@app.get("/player")
def player():
    html = """
    <html>
        <head><title>SentinelX Video Player</title></head>
        <body>
            <h3>SentinelX Video (Direct MP4)</h3>
            <video width="720" height="480" controls autoplay>
                <source src="/video_file" type="video/mp4">
                Your browser does not support the video tag.
            </video>
        </body>
    </html>
    """
    return HTMLResponse(content=html)


@app.get("/player_stream")
def player_stream():
    html = """
    <html>
        <head><title>SentinelX MJPEG Stream</title></head>
        <body>
            <h3>SentinelX MJPEG Stream (with Detection)</h3>
            <img src="/video" alt="video stream" width="720" height="480" />
        </body>
    </html>
    """
    return HTMLResponse(content=html)


@app.get("/alerts")
def get_alerts():
    """Return all alerts (latest first)"""
    return alerts_store[::-1]


@app.get("/reset")
def reset_detection():
    """Reset smoke detection state and clear alerts (for testing)"""
    global smoke_state, alerts_store
    smoke_state.reset()
    alerts_store.clear()
    logger.info("Detection state and alerts cleared")
    return {"message": "Detection reset successfully"}
