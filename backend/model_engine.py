import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
import numpy as np
import cv2
import os

class EmotionModel:
    def __init__(self, model_path=None):
        self.labels = ['angry', 'disgust', 'fear', 'happy', 'neutral', 'sad', 'surprise']
        self.img_size = 224
        self.model = self._build_model()
        if model_path and os.path.exists(model_path):
            self.model.load_weights(model_path)
            print(f"Loaded model weights from {model_path}")

    def _build_model(self):
        base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(self.img_size, self.img_size, 3))
        x = base_model.output
        x = GlobalAveragePooling2D()(x)
        x = Dense(512, activation='relu')(x)
        x = Dropout(0.5)(x)
        predictions = Dense(len(self.labels), activation='softmax')(x)
        model = Model(inputs=base_model.input, outputs=predictions)
        
        # Freeze base model layers initially
        for layer in base_model.layers:
            layer.trainable = False
            
        model.compile(optimizer='adam', loss='categorical_crossentropy', metrics=['accuracy'])
        return model

    def preprocess_frame(self, frame):
        # Resize and normalize
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        resized_frame = cv2.resize(rgb_frame, (self.img_size, self.img_size))
        normalized_frame = resized_frame / 255.0
        return np.expand_dims(normalized_frame, axis=0)

    def predict(self, frame):
        processed = self.preprocess_frame(frame)
        predictions = self.model.predict(processed, verbose=0)
        idx = np.argmax(predictions[0])
        confidence = float(predictions[0][idx])
        return self.labels[idx], confidence
