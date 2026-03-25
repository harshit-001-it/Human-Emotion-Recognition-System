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

// Fetch Emotion Data
async function fetchEmotionData() {
    try {
        const response = await fetch('/emotion_data');
        const data = await response.json();

        updateUI(data);
        update3DScene(data.emotion);
    } catch (error) {
        console.error('Error fetching emotion data:', error);
    }
}

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

// Poll for data
setInterval(fetchEmotionData, 500);
