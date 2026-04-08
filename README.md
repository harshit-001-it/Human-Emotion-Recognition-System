# Sentient-AI: Human Emotion Recognition System

A production-ready, secure, and scalable system for real-time and static emotion recognition using Deep Learning and FastAPI.

## 🚀 Features

- **Real-Time Video Recognition**: High-FPS emotion detection via WebSockets.
- **Static Image Analysis**: Drag-and-drop face detection and emotion classification.
- **Premium UI**: Advanced dashboard built with React, Vite, and Glassmorphism aesthetics.
- **State-of-the-Art ML**: MobileNetV2 architecture with custom fine-tuned layers.
- **Secure by Design**: JWT-based authentication and rate limiting.
- **Deployment Ready**: Fully Dockerized with Nginx orchestration.

## 🛠️ Tech Stack

- **Backend**: FastAPI, TensorFlow (Keras), OpenCV, MTCNN, PyJWT.
- **Frontend**: React, Vite, Tailwind-inspired Vanilla CSS, Recharts, Lucide.
- **DevOps**: Docker, Docker Compose.

## 📂 Project Structure

```text
├── backend/            # FastAPI Application
│   ├── main.py         # API Entry Point
│   ├── model_engine.py  # Inference Logic
│   └── train_model.py  # ML Training Pipeline
├── frontend/           # React Application
│   ├── src/            # Components & Logic
│   └── Dockerfile      # Production Build
├── data/               # Training/Test Datasets (Local)
├── models/             # Saved Model Artifacts
└── docker-compose.yml  # System Orchestration
```

## 🚥 Quick Start

### 1. Prerequisite
Ensure you have **Python 3.11+**, **Node.js 20+**, and **Docker** installed.

### 2. Setup Backend
```bash
cd backend
pip install -r requirements.txt
python main.py
```

### 3. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Running with Docker (Recommended)
```bash
docker-compose up --build
```

## 🧠 Model Training
To retrain the model on your local dataset:
```bash
cd backend
python train_model.py
```

## 🔒 Security
The API uses **OAuth2 + JWT** for secure communication. Modify the `SECRET_KEY` in `security.py` for production environments.

---
*Created by Sentient AI Systems*
