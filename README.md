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

## 🚥 Ways to Run

There are 3 ways to interact with the Sentient-AI system, depending on your needs:

### 1. The "One-Click" Way (Recommended for Local Use)
Perfect for a quick start on Windows.
- Simply **Double-Click `run_system.bat`** in the project root.
- The script automatically checks dependencies, starts both servers, and opens the dashboard in your browser.

### 2. The "Developer" Way (Manual Control)
Best for making changes or debugging.
- **Backend**:
  ```bash
  cd backend
  ..\.venv\Scripts\activate
  python main.py
  ```
- **Frontend**:
  ```bash
  cd frontend
  npm install
  npm run dev
  ```

### 3. The "Production" Way (Docker)
Best for scalable deployment or cross-platform consistency.
- From the project root, run:
  ```bash
  docker-compose up --build
  ```
- This will containerize the environment and serve the application globally.

## 🧠 Model Training
To retrain the model on your local dataset:
1. Ensure your data is in `data/Images/train` and `data/Images/Test`.
2. Run: `python backend/train_model.py`.
3. The new weights will be saved in the `models/` directory.

## 🔒 Security
The API uses **OAuth2 + JWT** for secure communication. Modify the `SECRET_KEY` in `security.py` for production environments.

---
*Created by Sentient AI Systems*
