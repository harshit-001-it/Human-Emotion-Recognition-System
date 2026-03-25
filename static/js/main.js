// Scene Setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('canvas-container').appendChild(renderer.domElement);

// Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1, 100);
pointLight.position.set(10, 10, 10);
scene.add(pointLight);

// Particles
const particlesGeometry = new THREE.BufferGeometry();
const particlesCount = 2000;
const posArray = new Float32Array(particlesCount * 3);

for (let i = 0; i < particlesCount * 3; i++) {
    posArray[i] = (Math.random() - 0.5) * 15;
}

particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

const particlesMaterial = new THREE.PointsMaterial({
    size: 0.02,
    color: 0x007aff,
    transparent: true,
    opacity: 0.8,
});

const particlesMesh = new THREE.Points(particlesGeometry, particlesMaterial);
scene.add(particlesMesh);

// Floating Shapes (Abstract representation of emotion)
const geometry = new THREE.IcosahedronGeometry(1, 1);
const material = new THREE.MeshPhongMaterial({
    color: 0x007aff,
    wireframe: true,
    transparent: true,
    opacity: 0.5
});
const mainShape = new THREE.Mesh(geometry, material);
scene.add(mainShape);

camera.position.z = 5;

// Emotion Colors & Settings
const emotionSettings = {
    'Angry': { color: 0xff0000, speed: 0.02, scale: 1.2 },
    'Disgust': { color: 0x00ff00, speed: 0.005, scale: 0.8 },
    'Fear': { color: 0x800080, speed: 0.03, scale: 0.9 },
    'Happy': { color: 0xffaa00, speed: 0.01, scale: 1.5 },
    'Neutral': { color: 0x007aff, speed: 0.005, scale: 1.0 },
    'Sad': { color: 0x0000ff, speed: 0.002, scale: 0.8 },
    'Surprise': { color: 0xff00ff, speed: 0.015, scale: 1.3 }
};

let currentEmotion = 'Neutral';
let targetColor = new THREE.Color(0x007aff);
let targetSpeed = 0.005;
let targetScale = 1.0;

// Animation Loop
function animate() {
    requestAnimationFrame(animate);

    // Rotate Particles
    particlesMesh.rotation.y += targetSpeed * 0.5;
    particlesMesh.rotation.x += targetSpeed * 0.2;

    // Rotate Main Shape
    mainShape.rotation.x += targetSpeed;
    mainShape.rotation.y += targetSpeed;

    // Smooth Transitions
    mainShape.material.color.lerp(targetColor, 0.05);
    particlesMaterial.color.lerp(targetColor, 0.05);

    // Pulse Effect
    const time = Date.now() * 0.001;
    const scale = targetScale + Math.sin(time * 2) * 0.1;
    mainShape.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
}

animate();

// Handle Window Resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Client-Side Camera & Processing
const video = document.getElementById('video-feed');
const canvas = document.getElementById('capture-canvas');
const faceBoxesContainer = document.getElementById('face-boxes-container');
const context = canvas.getContext('2d');

// Optimization Constants
const CAPTURE_WIDTH = 320;
const CAPTURE_HEIGHT = 240;
const POLLING_INTERVAL = 300; // 300ms for responsiveness

async function setupCamera() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { width: 640, height: 480 } 
        });
        video.srcObject = stream;
    } catch (err) {
        console.error("Error accessing camera:", err);
        alert("Camera access is required for emotion detection. Please ensure you are using HTTPS if hosted online.");
    }
}

async function processFrame() {
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Prepare canvas at lower resolution for faster processing
        canvas.width = CAPTURE_WIDTH;
        canvas.height = CAPTURE_HEIGHT;
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        
        // Get base64 image with lower quality for speed
        const imageData = canvas.toDataURL('image/jpeg', 0.5);
        
        try {
            const response = await fetch('/process_frame', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: imageData })
            });
            const data = await response.json();
            
            if (data.detections) {
                updateMultiUI(data.detections);
                updateFaceBoxes(data.detections);
            }
        } catch (error) {
            console.error('Error processing frame:', error);
        }
    }
}

function updateFaceBoxes(detections) {
    // Clear existing boxes
    faceBoxesContainer.innerHTML = '';
    
    if (!detections || detections.length === 0) return;

    const videoRect = video.getBoundingClientRect();
    const scaleX = video.offsetWidth / CAPTURE_WIDTH;
    const scaleY = video.offsetHeight / CAPTURE_HEIGHT;

    detections.forEach(face => {
        const box = document.createElement('div');
        box.className = 'face-box';
        box.style.left = (face.x * scaleX) + 'px';
        box.style.top = (face.y * scaleY) + 'px';
        box.style.width = (face.w * scaleX) + 'px';
        box.style.height = (face.h * scaleY) + 'px';

        const label = document.createElement('div');
        label.className = 'face-label';
        label.textContent = face.emotion;
        box.appendChild(label);

        faceBoxesContainer.appendChild(box);
    });
}

function updateMultiUI(detections) {
    if (!detections || detections.length === 0) return;
    
    // Update main UI with the first detected face (or primary subject)
    const primary = detections[0];
    updateUI(primary);
    update3DScene(primary.emotion);
}

// Start sequence
setupCamera().then(() => {
    setInterval(processFrame, POLLING_INTERVAL);
});

function updateUI(data) {
    const emotionEl = document.getElementById('current-emotion');
    const confidenceFill = document.getElementById('confidence-fill');
    const statsContainer = document.getElementById('stats-container');

    // Update Main Emotion
    if (data.emotion && data.emotion !== currentEmotion) {
        currentEmotion = data.emotion;
        emotionEl.textContent = currentEmotion;

        // Animate Text
        gsap.from(emotionEl, {
            y: 20,
            opacity: 0,
            duration: 0.5,
            ease: "power2.out"
        });
    }

    // Update Confidence Bar (Max probability)
    let maxProb = 0;
    if (data.probabilities) {
        const probs = Object.values(data.probabilities);
        if (probs.length > 0) {
            maxProb = Math.max(...probs);
        }
    }
    confidenceFill.style.width = `${maxProb * 100}%`;
    confidenceFill.style.backgroundColor = '#' + targetColor.getHexString();

    // Update Stats
    if (data.probabilities) {
        statsContainer.innerHTML = '';
        // Sort by probability
        const sortedProbs = Object.entries(data.probabilities)
            .sort(([, a], [, b]) => b - a)
            .slice(0, 4); // Top 4

        sortedProbs.forEach(([label, prob]) => {
            const div = document.createElement('div');
            div.className = 'stat-item';
            div.innerHTML = `
                <div class="stat-label">${label}</div>
                <div class="stat-value">${(prob * 100).toFixed(1)}%</div>
            `;
            statsContainer.appendChild(div);
        });
    }
}

function update3DScene(emotion) {
    if (emotionSettings[emotion]) {
        const settings = emotionSettings[emotion];
        targetColor.setHex(settings.color);
        targetSpeed = settings.speed;
        targetScale = settings.scale;
    }
}

// Polling for emotion_data removed in favor of processFrame

// Shutdown on tab close
window.addEventListener('beforeunload', function (e) {
    navigator.sendBeacon('/shutdown');
});
