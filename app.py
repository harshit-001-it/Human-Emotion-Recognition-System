from flask import Flask, render_template, Response, jsonify
from camera import VideoCamera

app = Flask(__name__)

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

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
