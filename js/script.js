// --- Wish Interaction ---
function blowCandle() {
    const flame = document.getElementById('flame');
    if (!flame.classList.contains('out')) {
        flame.classList.add('out');
        // Show Wish Modal instead of immediate fireworks
        const modal = document.getElementById('wish-modal');
        modal.classList.remove('hidden');
        document.getElementById('wish-input').focus();
    }
}

function submitWish() {
    const input = document.getElementById('wish-input');
    const wish = input.value.trim();
    if (wish) {
        document.querySelector('h1').innerText = wish + " ✨";
    } else {
        document.querySelector('h1').innerText = "Happy Birthday! ✨";
    }

    const modal = document.getElementById('wish-modal');
    modal.classList.add('hidden');

    // Update instruction text
    document.querySelector('.instruction').innerText = "(點擊畫面施放煙火 / Click anywhere for fireworks!)";

    // Launch initial fireworks
    launchExplosion();
    startFireworks();
}

// Allow Enter key to submit wish
document.getElementById('wish-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        submitWish();
    }
});

// --- Parallax Effect ---
document.addEventListener('mousemove', (e) => {
    const x = (window.innerWidth / 2 - e.pageX) / 50;
    const y = (window.innerHeight / 2 - e.pageY) / 50;

    const cake = document.querySelector('.cake');
    const title = document.querySelector('h1');

    if (cake) cake.style.transform = `translateX(${x}px) translateY(${y}px)`;
    if (title) title.style.transform = `translateX(${x * 0.5}px) translateY(${y * 0.5}px)`; // Title moves slower
});

// --- Fireworks Logic ---
const mediaFiles = [
    'IMG_7139.jpg',
    'IMG_7140.jpg',
    'IMG_7141.jpg',
    'IMG_7142.jpg',
    'IMG_7143.jpg',
    'IMG_7144.jpg',
    'IMG_7145.jpg',
    'IMG_7146.jpg',
    'IMG_7147.jpg',
    'IMG_7150.jpg',
    'IMG_7151.jpg',
    'IMG_7152.jpg',
    'IMG_7153.jpg',
    'IMG_7154.jpg',
    'IMG_7155.jpg',
    'IMG_7158.jpg',
    'IMG_7159.jpg',
    'IMG_7160.jpg',
    'IMG_7161.jpg',
    'IMG_7162.jpg',
    'IMG_7163.jpg',
    'CkbBr2skW24nYHfHutu-6aP8wibAnRBIWnF3GcgJpeY.mov',
    'IkIh6ro17VprjsCfkzQKfDy4dX_aM7uK7RhMhucgYhw.mov',
    'P0bJo5xeXG4X_XigqW-ws8sXBmJXiEC9Zd0j6mAixE.mov',
    'n3jb01gb-b9Enq6hQ7nwlDthSKMzziaVkma3gHD6U80.mov'
];

// Initialize available media with a copy of the original list
let availableMedia = [...mediaFiles];

function showRandomMedia(x, y) {
    if (availableMedia.length === 0) {
        // Replenish the pool if all media have been shown
        availableMedia = [...mediaFiles];
    }

    // Pick a random index from the available media
    const randomIndex = Math.floor(Math.random() * availableMedia.length);
    // Remove the chosen media from the available list so it won't be picked again immediately
    const chosenMedia = availableMedia.splice(randomIndex, 1)[0];
    const randomPath = 'images/' + chosenMedia;

    // Check file extension
    const isVideo = /\.(mp4|mov|webm|ogg)$/i.test(chosenMedia);

    let element;
    if (isVideo) {
        element = document.createElement('video');
        element.src = randomPath;
        element.autoplay = true;
        element.muted = true;
        element.setAttribute('playsinline', ''); // Critical for iOS/Mac
        element.setAttribute('webkit-playsinline', ''); // Legacy for iOS

        // Use video-specific class
        element.classList.add('firework-video');

        // Try to play explicitly
        setTimeout(() => {
            element.play().catch(e => console.log("Video playback failed:", e));
        }, 100);

        // When video ends, fade out and remove
        element.onended = () => {
            element.classList.add('fade-out');
            setTimeout(() => {
                element.remove();
            }, 500); // Wait for fade-out transition
        };
    } else {
        element = document.createElement('img');
        element.src = randomPath;
        element.classList.add('firework-photo');

        // Remove image after 3 seconds (CSS animation handles the fade out)
        setTimeout(() => {
            element.remove();
        }, 3000);
    }

    // Polaroid: Random rotation
    const rotation = (Math.random() * 30) - 15; // -15deg to +15deg

    element.style.left = x + 'px';
    element.style.top = y + 'px';
    element.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;

    document.body.appendChild(element);
}

const canvas = document.getElementById('fireworks');
const ctx = canvas.getContext('2d');
let fireworks = [];
let particles = [];
let animationRequested = false;

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Firework {
    constructor(sx, sy, tx, ty) {
        this.x = sx;
        this.y = sy;
        this.sx = sx;
        this.sy = sy;
        this.tx = tx;
        this.ty = ty;
        this.distanceToTarget = calculateDistance(sx, sy, tx, ty);
        this.distanceTraveled = 0;
        this.coordinates = [];
        this.coordinateCount = 3;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.atan2(ty - sy, tx - sx);
        this.speed = 2;
        this.acceleration = 1.05;
        this.brightness = Math.random() * 50 + 50;
        this.targetRadius = 1;
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);

        this.speed *= this.acceleration;
        const vx = Math.cos(this.angle) * this.speed;
        const vy = Math.sin(this.angle) * this.speed;
        this.distanceTraveled = calculateDistance(this.sx, this.sy, this.x + vx, this.y + vy);

        if (this.distanceTraveled >= this.distanceToTarget) {
            createParticles(this.tx, this.ty);
            showRandomMedia(this.tx, this.ty); // Show photo/video at explosion
            fireworks.splice(index, 1);
        } else {
            this.x += vx;
            this.y += vy;
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'hsl(' + Math.random() * 360 + ', 100%, ' + this.brightness + '%)';
        ctx.stroke();
    }
}

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.coordinates = [];
        this.coordinateCount = 5;
        while (this.coordinateCount--) {
            this.coordinates.push([this.x, this.y]);
        }
        this.angle = Math.random() * Math.PI * 2;
        this.speed = Math.random() * 10 + 1;
        this.friction = 0.95;
        this.gravity = 1;
        this.hue = Math.random() * 360;
        this.brightness = Math.random() * 50 + 50;
        this.alpha = 1;
        this.decay = Math.random() * 0.015 + 0.015;
    }

    update(index) {
        this.coordinates.pop();
        this.coordinates.unshift([this.x, this.y]);
        this.speed *= this.friction;
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed + this.gravity;
        this.alpha -= this.decay;

        if (this.alpha <= this.decay) {
            particles.splice(index, 1);
        }
    }

    draw() {
        ctx.beginPath();
        ctx.moveTo(this.coordinates[this.coordinates.length - 1][0], this.coordinates[this.coordinates.length - 1][1]);
        ctx.lineTo(this.x, this.y);
        ctx.strokeStyle = 'hsla(' + this.hue + ', 100%, ' + this.brightness + '%, ' + this.alpha + ')';
        ctx.stroke();
    }
}

function createParticles(x, y) {
    let particleCount = 30;
    while (particleCount--) {
        particles.push(new Particle(x, y));
    }
}

function calculateDistance(p1x, p1y, p2x, p2y) {
    const xDistance = p1x - p2x;
    const yDistance = p1y - p2y;
    return Math.sqrt(Math.pow(xDistance, 2) + Math.pow(yDistance, 2));
}

function loop() {
    if (!animationRequested) return;

    requestAnimationFrame(loop);
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.globalCompositeOperation = 'lighter';

    let i = fireworks.length;
    while (i--) {
        fireworks[i].draw();
        fireworks[i].update(i);
    }

    let j = particles.length;
    while (j--) {
        particles[j].draw();
        particles[j].update(j);
    }

    /* Random auto-launch removed for interactive mode */
}

function startFireworks() {
    if (!animationRequested) {
        animationRequested = true;
        loop();
        // Launch a few initial ones
        for (let k = 0; k < 5; k++) {
            setTimeout(() => {
                const startX = window.innerWidth / 2;
                const startY = window.innerHeight;
                const targetX = Math.random() * window.innerWidth;
                const targetY = Math.random() * window.innerHeight * 0.4;
                fireworks.push(new Firework(startX, startY, targetX, targetY));
            }, k * 300);
        }
    }
}

// Interactive Fireworks
document.addEventListener('mousedown', (e) => {
    if (!animationRequested) return; // Only allow after candle is blown (active animation)

    // Avoid double triggering if clicking the flame initially (though flame is gone/out)
    // but just in case, we can rely on animationRequested being set in blowCandle

    const targetX = e.clientX;
    const targetY = e.clientY;
    const startX = window.innerWidth / 2;
    const startY = window.innerHeight;
    fireworks.push(new Firework(startX, startY, targetX, targetY));
});

// --- Original Confetti Logic ---
function createConfetti() {
    const container = document.getElementById('confetti-container');
    const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'];

    setInterval(() => {
        const el = document.createElement('div');
        el.classList.add('confetti');
        el.style.left = Math.random() * 100 + 'vw';
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.animationDuration = Math.random() * 2 + 3 + 's';
        el.style.width = Math.random() * 8 + 4 + 'px';
        el.style.height = Math.random() * 8 + 4 + 'px';

        container.appendChild(el);

        // Cleanup
        setTimeout(() => el.remove(), 5000);
    }, 200);
}

function launchExplosion() {
    const container = document.getElementById('confetti-container');
    const colors = ['#f1c40f', '#e74c3c', '#3498db', '#2ecc71', '#9b59b6'];

    for (let i = 0; i < 50; i++) {
        const el = document.createElement('div');
        el.classList.add('confetti');
        el.style.left = '50%';
        el.style.top = '50%';
        el.style.transition = 'all 1s ease-out';
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];

        // Random explosion direction
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 200 + 50;

        // Custom animation for explosion
        // Since this is a simple script, we stick to the falling one but maybe inject a burst?
        // Let's just spawn more falling confetti for now to keep it simple but "rich"
    }
    // Increase confetti intensity temporarily
    const originalInterval = setInterval(() => {
        const el = document.createElement('div');
        el.classList.add('confetti');
        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = '-10px';
        el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        el.style.animationDuration = Math.random() * 1 + 2 + 's'; // Faster fall
        container.appendChild(el);
        setTimeout(() => el.remove(), 3000);
    }, 50);

    setTimeout(() => clearInterval(originalInterval), 2000);
}

// Start background confetti
createConfetti();
