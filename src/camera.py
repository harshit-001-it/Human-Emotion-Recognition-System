import cv2
import numpy as np
from tensorflow.keras.models import load_model
from tensorflow.keras.preprocessing.image import img_to_array
import os

class VideoCamera(object):
    def __init__(self):
        try:
            self.video = cv2.VideoCapture(0)
            if not self.video.isOpened():
                self.video = None
        except Exception as e:
            print(f"Warning: Could not open server-side camera: {e}")
            self.video = None
        
        # Load Face Detection Cascade
        self.face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        
        # Load Emotion Detection Model
        model_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'models', 'model.h5')
        if os.path.exists(model_path):
            self.model = load_model(model_path)
            self.class_labels = ['Angry', 'Disgust', 'Fear', 'Happy', 'Neutral', 'Sad', 'Surprise']
            self.model_loaded = True
        else:
            print("Model not found. Please train the model first.")
            self.model_loaded = False
            self.class_labels = ['Neutral'] # Default

        self.current_emotion = "Neutral"
        self.emotion_probs = {}

    def __del__(self):
        if hasattr(self, 'video') and self.video:
            self.video.release()

    def analyze_frame(self, frame_data):
        """Analyze a frame passed as bytes (from client side)"""
        # Convert bytes to image
        nparr = np.frombuffer(frame_data, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            return "Neutral", {}

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)

        for (x, y, w, h) in faces:
            if self.model_loaded:
                roi_gray = gray[y:y+h, x:x+w]
                roi_gray = cv2.resize(roi_gray, (48, 48), interpolation=cv2.INTER_AREA)

                if np.sum([roi_gray]) != 0:
                    roi = roi_gray.astype('float') / 255.0
                    roi = img_to_array(roi)
                    roi = np.expand_dims(roi, axis=0)

                    prediction = self.model.predict(roi)[0]
                    label = self.class_labels[prediction.argmax()]
                    self.current_emotion = label
                    
                    # Store probabilities
                    probs = {}
                    for i, prob in enumerate(prediction):
                        probs[self.class_labels[i]] = float(prob)
                    self.emotion_probs = probs
                    
                    return label, probs, {'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)}

        return "Neutral", {}, None

    def get_frame(self):
        success, image = self.video.read()
        if not success:
            # Return a black frame with error message if camera fails
            blank_frame = np.zeros((480, 640, 3), dtype=np.uint8)
            cv2.putText(blank_frame, "Camera Error", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
            ret, jpeg = cv2.imencode('.jpg', blank_frame)
            return jpeg.tobytes(), "Neutral"

        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(gray, 1.3, 5)

        if not self.model_loaded:
            cv2.putText(image, "Model Training...", (20, 60), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 165, 255), 2)
            cv2.putText(image, "Please wait.", (20, 100), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 165, 255), 2)

        for (x, y, w, h) in faces:
            cv2.rectangle(image, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            if self.model_loaded:
                roi_gray = gray[y:y+h, x:x+w]
                roi_gray = cv2.resize(roi_gray, (48, 48), interpolation=cv2.INTER_AREA)

                if np.sum([roi_gray]) != 0:
                    roi = roi_gray.astype('float') / 255.0
                    roi = img_to_array(roi)
                    roi = np.expand_dims(roi, axis=0)

                    prediction = self.model.predict(roi)[0]
                    label = self.class_labels[prediction.argmax()]
                    self.current_emotion = label
                    
                    # Store probabilities for frontend
                    for i, prob in enumerate(prediction):
                        self.emotion_probs[self.class_labels[i]] = float(prob)
                    
                    label_position = (x, y - 10)
                    cv2.putText(image, label, label_position, cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)

        ret, jpeg = cv2.imencode('.jpg', image)
        return jpeg.tobytes(), self.current_emotion

    def get_emotion_data(self):
        return {
            'emotion': self.current_emotion,
            'probabilities': self.emotion_probs
        }
