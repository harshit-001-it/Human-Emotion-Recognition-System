from flask import Flask, render_template, Response, jsonify, request
from camera import VideoCamera
import base64
import os
import io

import os

# Define the project root directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

app = Flask(__name__, 
            template_folder=os.path.join(BASE_DIR, 'templates'),
            static_folder=os.path.join(BASE_DIR, 'static'))

# Global camera instance to share state
camera = None

def get_camera():
    global camera
    if camera is None:
        camera = VideoCamera()
    return camera

@app.route('/')
def index():
    return render_template('index.html')

def gen(camera):
    while True:
        frame, emotion = camera.get_frame()
        if frame:
            yield (b'--frame\r\n'
                   b'Content-Type: image/jpeg\r\n\r\n' + frame + b'\r\n\r\n')

@app.route('/video_feed')
def video_feed():
    return Response(gen(get_camera()),
                    mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/emotion_data')
def emotion_data():
    cam = get_camera()
    return jsonify(cam.get_emotion_data())

@app.route('/process_frame', methods=['POST'])
def process_frame():
    data = request.json
    if not data or 'image' not in data:
        return jsonify({'error': 'No image data'}), 400
    
    # Decode base64 image
    image_data = data['image'].split(',')[1]
    image_bytes = base64.b64decode(image_data)
    
    cam = get_camera()
    detections = cam.analyze_frame(image_bytes)
    
    return jsonify({
        'detections': detections
    })

@app.route('/shutdown', methods=['POST'])
def shutdown():
    print("Tab closed. Shutting down server...")
    os._exit(0)
    return 'Server shutting down...'

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
