// script.js
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const rockStat = document.getElementById('rockStat');
const paperStat = document.getElementById('paperStat');
const scissorsStat = document.getElementById('scissorsStat');
const resultDiv = document.getElementById('result');
const eatSound = document.getElementById('eatSound');
eatSound.volume =1;

let objects = [];
let animationId;
let isSimulationRunning = false;
let startTime;

const OBJECT_TYPES = {
    ROCK: 'rock',
    PAPER: 'paper',
    SCISSORS: 'scissors'
};

const EMOJIS = {
    [OBJECT_TYPES.ROCK]: '🪨',
    [OBJECT_TYPES.PAPER]: '📄',
    [OBJECT_TYPES.SCISSORS]: '✂️'
};

class SimulationObject {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 2;
        this.dx = (Math.random() - 0.5) * this.speed;
        this.dy = (Math.random() - 0.5) * this.speed;
    }

    draw() {
        ctx.font = `${this.size * 2}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(EMOJIS[this.type], this.x, this.y);
    }

    move() {
        this.x += this.dx;
        this.y += this.dy;

        if (this.x < this.size || this.x > canvas.width - this.size) {
            this.dx = -this.dx;
        }
        if (this.y < this.size || this.y > canvas.height - this.size) {
            this.dy = -this.dy;
        }
    }

    interact(other) {
        const dx = this.x - other.x;
        const dy = this.y - other.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < this.size + other.size) {
            if (
                (this.type === OBJECT_TYPES.ROCK && other.type === OBJECT_TYPES.SCISSORS) ||
                (this.type === OBJECT_TYPES.PAPER && other.type === OBJECT_TYPES.ROCK) ||
                (this.type === OBJECT_TYPES.SCISSORS && other.type === OBJECT_TYPES.PAPER)
            ) {
                other.type = this.type;
                eatSound.play();
            } else if (this.type !== other.type) {
                this.type = other.type;
                eatSound.play();
            }
        }
    }
}

function initializeSimulation() {
    const rockCount = parseInt(document.getElementById('rockCount').value);
    const paperCount = parseInt(document.getElementById('paperCount').value);
    const scissorsCount = parseInt(document.getElementById('scissorsCount').value);

    objects = [];

    for (let i = 0; i < rockCount; i++) {
        objects.push(new SimulationObject(OBJECT_TYPES.ROCK, Math.random() * canvas.width, Math.random() * canvas.height));
    }
    for (let i = 0; i < paperCount; i++) {
        objects.push(new SimulationObject(OBJECT_TYPES.PAPER, Math.random() * canvas.width, Math.random() * canvas.height));
    }
    for (let i = 0; i < scissorsCount; i++) {
        objects.push(new SimulationObject(OBJECT_TYPES.SCISSORS, Math.random() * canvas.width, Math.random() * canvas.height));
    }

    updateStats();
    resultDiv.textContent = '';
}

function updateStats() {
    const counts = objects.reduce((acc, obj) => {
        acc[obj.type]++;
        return acc;
    }, { [OBJECT_TYPES.ROCK]: 0, [OBJECT_TYPES.PAPER]: 0, [OBJECT_TYPES.SCISSORS]: 0 });

    rockStat.textContent = counts[OBJECT_TYPES.ROCK];
    paperStat.textContent = counts[OBJECT_TYPES.PAPER];
    scissorsStat.textContent = counts[OBJECT_TYPES.SCISSORS];

    return counts;
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < objects.length; i++) {
        objects[i].move();
        objects[i].draw();

        for (let j = i + 1; j < objects.length; j++) {
            objects[i].interact(objects[j]);
        }
    }

    const counts = updateStats();
    
    if (Object.values(counts).some(count => count === objects.length)) {
        endSimulation();
    } else if (isSimulationRunning) {
        animationId = requestAnimationFrame(animate);
    }
}

function startSimulation() {
    initializeSimulation();
    objects.forEach(obj => obj.draw()); 
    if (!isSimulationRunning) {
        isSimulationRunning = true;
        startBtn.textContent = 'Pause Simulation';
        startTime = Date.now();
        animate();
    } else {
        isSimulationRunning = false;
        startBtn.textContent = 'Resume Simulation';
        cancelAnimationFrame(animationId);
    }
}

function resetSimulation() {
    isSimulationRunning = false;
    startBtn.textContent = 'Start Simulation';
    cancelAnimationFrame(animationId);
    initializeSimulation();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    objects.forEach(obj => obj.draw());
}

function endSimulation() {
    isSimulationRunning = false;
    cancelAnimationFrame(animationId);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds
    const winner = objects[0].type;
    resultDiv.textContent = `Simulation ended! ${EMOJIS[winner]} ${winner.charAt(0).toUpperCase() + winner.slice(1)} wins! Time: ${duration.toFixed(2)} seconds`;
    startBtn.textContent = 'Start Simulation';
}

startBtn.addEventListener('click', startSimulation);
resetBtn.addEventListener('click', resetSimulation);

// Set canvas size
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// // Initialize simulation
// initializeSimulation();
// objects.forEach(obj => obj.draw());

// Adjust simulation speed
document.getElementById('speed').addEventListener('input', function() {
    const speed = this.value;
    objects.forEach(obj => {
        obj.speed = speed / 2;
        obj.dx = (Math.random() - 0.5) * obj.speed;
        obj.dy = (Math.random() - 0.5) * obj.speed;
    });
});