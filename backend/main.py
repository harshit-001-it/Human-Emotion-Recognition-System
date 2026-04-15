import cv2
import numpy as np
import base64
from fastapi import FastAPI, UploadFile, File, WebSocket, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from model_engine import EmotionModel
from security import get_current_user, create_access_token, Token
import uvicorn
import io
from PIL import Image

app = FastAPI(title="Emotion Recognition API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Model
# Note: In a real app, you'd load the trained model file
model_engine = EmotionModel() 
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
@app.post("/token", response_model=Token)
async def login():
    # Mock login for demonstration
    access_token = create_access_token(data={"sub": "admin"})
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/predict-image")
async def predict_image(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if img is None:
        raise HTTPException(status_code=400, detail="Invalid image file")
        
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.3, 5)
    
    results = []
    if len(faces) == 0:
        if img.shape[0] < 300: # Pre-cropped dataset images are usually small
            # Fallback for pre-cropped dataset images
            emotion, confidence = model_engine.predict(img)
            results.append({
                "emotion": emotion,
                "confidence": confidence,
                "bbox": [0, 0, int(img.shape[1]), int(img.shape[0])]
            })
    else:
        for (x, y, w, h) in faces:
            face_img = img[y:y+h, x:x+w]
            emotion, confidence = model_engine.predict(face_img)
            results.append({
                "emotion": emotion,
                "confidence": confidence,
                "bbox": [int(x), int(y), int(w), int(h)]
            })
    
    return {"results": results}

@app.websocket("/ws/video")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            data = await websocket.receive_text()
            # Expecting base64 image data
            try:
                header, encoded = data.split(",", 1)
                img_data = base64.b64decode(encoded)
                nparr = np.frombuffer(img_data, np.uint8)
                img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            except Exception as decode_err:
                await websocket.send_json({"error": "Invalid data format"})
                continue
                
            if img is None:
                await websocket.send_json({"error": "Invalid image"})
                continue
            
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)
            
            predictions = []
            if len(faces) == 0:
                if img.shape[0] < 300:
                    emotion, confidence = model_engine.predict(img)
                    predictions.append({
                        "emotion": emotion,
                        "confidence": confidence,
                        "bbox": [0, 0, int(img.shape[1]), int(img.shape[0])]
                    })
            else:
                for (x, y, w, h) in faces:
                    face_img = img[y:y+h, x:x+w]
                    emotion, confidence = model_engine.predict(face_img)
                    predictions.append({
                        "emotion": emotion,
                        "confidence": confidence,
                        "bbox": [int(x), int(y), int(w), int(h)]
                    })
            
            await websocket.send_json({"predictions": predictions})
    except Exception as e:
        print(f"WS Error: {e}")
    finally:
        try:
            await websocket.close()
        except Exception:
            pass # Prevent ASGI RuntimeError if already disconnected

@app.post("/shutdown")
async def shutdown():
    import os
    import signal
    print("Shutdown signal received. Terminating Sentient-AI System...")
    os.kill(os.getpid(), signal.SIGINT)
    return {"status": "shutting down"}

# Catch-all route for SPA frontend and all static assets
@app.get("/")
@app.get("/{path:path}")
async def serve_spa(path: str = ""):
    dist_dir = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")
    if path:
        file_path = os.path.join(dist_dir, path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
    
    # Fallback to index.html for root or unknown paths (React Router support)
    index_path = os.path.join(dist_dir, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return {"message": "Emotion Recognition API is running"}

if __name__ == "__main__":
    import os
    import threading
    import webbrowser
    import time

    # Default to localhost for safe clickable console links on Windows, 
    # but respect environment variables for Docker
    host_addr = os.getenv("HOST", "127.0.0.1")
    
    def open_browser():
        time.sleep(1.5)
        webbrowser.open(f"http://{host_addr}:8000")
        
    threading.Thread(target=open_browser, daemon=True).start()
    
    uvicorn.run(app, host=host_addr, port=8000)
