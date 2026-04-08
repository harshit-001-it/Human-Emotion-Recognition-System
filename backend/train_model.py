import os
import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator
from model_engine import EmotionModel
import matplotlib.pyplot as plt

# Configuration
TRAIN_DIR = '../data/Images/train'
TEST_DIR = '../data/Images/Test'
MODEL_SAVE_PATH = '../models/emotion_model_v1.h5'
BATCH_SIZE = 32
EPOCHS = 20

def train():
    # Data Augmentation
    train_datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        shear_range=0.2,
        zoom_range=0.2,
        horizontal_flip=True,
        fill_mode='nearest'
    )

    test_datagen = ImageDataGenerator(rescale=1./255)

    train_generator = train_datagen.flow_from_directory(
        TRAIN_DIR,
        target_size=(224, 224),
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )

    validation_generator = test_datagen.flow_from_directory(
        TEST_DIR,
        target_size=(224, 224),
        batch_size=BATCH_SIZE,
        class_mode='categorical'
    )

    # Initialize model
    engine = EmotionModel()
    model = engine.model

    # Phase 1: Train top layers
    print("Starting Phase 1: Training top layers...")
    history1 = model.fit(
        train_generator,
        epochs=10,
        validation_data=validation_generator
    )

    # Phase 2: Fine-tuning
    print("Starting Phase 2: Fine-tuning base model...")
    # Unfreeze some layers of the base model
    for layer in model.layers[-30:]:
        layer.trainable = True
        
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-5),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )

    history2 = model.fit(
        train_generator,
        epochs=EPOCHS,
        validation_data=validation_generator
    )

    # Save final model
    os.makedirs('../models', exist_ok=True)
    model.save(MODEL_SAVE_PATH)
    print(f"Model saved to {MODEL_SAVE_PATH}")

if __name__ == "__main__":
    train()
