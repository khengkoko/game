// ==================== 开场花树动画 · 新版极致花朵系统 ====================
const canvas = document.getElementById('tree-canvas');
const ctx = canvas.getContext('2d');
const container = document.getElementById('tree-container');
const opening = document.getElementById('opening');
const app = document.getElementById('app');

function resizeCanvas() {
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// 树枝 & 花朵全局数据
let branches = [];
let flowerPoints = [];
let flowers = [];
let fallenFlowers = new Set();
let windStrength = 0;
let treeLean = 0;
let treeVelocity = 0;
const DAMPING = 0.85;
let animationProgress = 0;
let totalFallen = 0;
const MAX_FALL = 550;

// 生成树枝
function generateBranches() {
    branches = [];
    flowerPoints = [];
    const startX = canvas.width / 2;
    const startY = canvas.height * 0.9;
    const trunk = {
        x: startX, y: startY,
        endX: startX, endY: canvas.height * 0.6,
        thickness: 8, depth: 0
    };
    branches.push(trunk);
    growBranch(trunk, 1);
}

function growBranch(parent, depth) {
    if (depth > 4) return;
    const count = depth === 1 ? 3 : depth === 2 ? 2 : Math.random() > 0.5 ? 2 : 1;
    const length = Math.hypot(parent.endX - parent.x, parent.endY - parent.y) * (0.6 + Math.random() * 0.25);
    const thickness = parent.thickness * 0.7;

    for (let i = 0; i < count; i++) {
        const angle = (Math.random() - 0.5) * Math.PI * 0.8 + (depth === 1 ? 0 : Math.atan2(parent.endY - parent.y, parent.endX - parent.x));
        const offsetX = (Math.random() - 0.5) * 10;
        const offsetY = (Math.random() - 0.5) * 10;
        const endX = parent.endX + Math.cos(angle) * length + offsetX;
        const endY = parent.endY - Math.sin(angle) * length + offsetY;

        const branch = {
            x: parent.endX + (parent.x - parent.endX) * 0.1,
            y: parent.endY + (parent.y - parent.endY) * 0.1,
            endX, endY, thickness, depth, angle
        };
        branches.push(branch);
        if (depth >= 2) flowerPoints.push({ type: 'end', branch, x: endX, y: endY });
        if (depth >= 1) flowerPoints.push({ type: 'path', branch, x: endX, y: endY });
        growBranch(branch, depth + 1);
    }
}

// 创建花朵（1500朵，30%花苞，依次绽放）
function createFlowers() {
    let index = 0;
    const total = 1500;

    // 末端簇拥 1100朵
    for (let i = 0; i < 1100; i++) {
        const p = flowerPoints.filter(f => f.type === 'end')[Math.floor(Math.random() * flowerPoints.length)];
        if (!p) continue;
        const angle = Math.random() * Math.PI * 2;
        const r = 6 + Math.random() * 19;
        const x = p.x + Math.cos(angle) * r;
        const y = p.y + Math.sin(angle) * r * 0.75;
        createOneFlower(x, y, p.branch, index++);
    }

    // 路径点缀 400朵
    for (let i = 0; i < 400; i++) {
        const p = flowerPoints.filter(f => f.type === 'path')[Math.floor(Math.random() * flowerPoints.length)];
        if (!p) continue;
        const t = 0.2 + Math.random() * 0.6;
        const x = p.x + (Math.random() - 0.5) * 10;
        const y = p.y + (Math.random() - 0.5) * 10;
        createOneFlower(x, y, p.branch, index++);
    }
}

function createOneFlower(x, y, branch, index) {
    const isBud = Math.random() < 0.3;
    const flower = document.createElement('div');
    flower.className = 'flower';
    if (isBud) flower.classList.add('bud');

    flower.innerHTML = `
        <div class="petal"></div>
        <div class="petal"></div>
        <div class="petal"></div>
        <div class="petal"></div>
        <div class="petal"></div>
        <div class="stamen"></div>
    `;

    const delay = 0.5 + (index % 50) * 0.01 + (isBud ? 0.2 + Math.random() * 0.2 : 0);
    flower.style.animationDelay = `${delay}s`;
    flower.style.left = `${x}px`;
    flower.style.top = `${y}px`;
    container.appendChild(flower);

    flowers.push({
        element: flower,
        branch: branch,
        offsetX: x - (branch ? branch.endX : x),
        offsetY: y - (branch ? branch.endY : y),
        baseX: x,
        baseY: y,
        flyAngle: Math.random() * Math.PI * 2,
        isBud: isBud
    });
}

// 风场物理
function updateWind() {
    let windPhase = 0;
    if (animationProgress < 0.55) windPhase = 0;
    else if (animationProgress < 0.7) windPhase = 1;
    else if (animationProgress < 0.88) windPhase = 2;
    else if (animationProgress < 0.95) windPhase = 3;
    else windPhase = 4;

    if (windPhase === 0) windStrength = 0;
    else if (windPhase === 1) windStrength = (animationProgress - 0.55) / 0.15 * 0.8;
    else if (windPhase === 2) windStrength = 1;
    else if (windPhase === 3) windStrength = 1 - (animationProgress - 0.88) / 0.07 * 0.8;
    else windStrength = 0.2;

    const target = windStrength * 30;
    treeVelocity += (target - treeLean) * 0.1;
    treeVelocity *= DAMPING;
    treeLean += treeVelocity;

    // 强风吹落花朵
    if (windPhase === 2 && totalFallen < MAX_FALL && Math.random() < 0.12) {
        const batch = 80 + Math.floor(Math.random() * 60);
        for (let i = 0; i < batch; i++) fallOneFlower();
    }
}

// 吹落单朵花 → 生成3片花瓣
function fallOneFlower() {
    const alive = flowers.filter(f => !fallenFlowers.has(f));
    if (alive.length === 0) return;
    const f = alive[Math.floor(Math.random() * alive.length)];
    fallenFlowers.add(f);
    f.element.remove();
    totalFallen++;

    const wx = f.branch
        ? Math.cos(f.branch.angle) * 140 + windStrength * 180
        : (Math.random() - 0.5) * 140 + windStrength * 180;

    const dur = windStrength > 0.8
        ? 2.5 + Math.random() * 3
        : 10 + Math.random() * 6;

    for (let i = 0; i < 3; i++) {
        const p = document.createElement('div');
        p.className = 'falling-petal';
        p.style.left = `${f.baseX + treeLean * 0.4}px`;
        p.style.top = `${f.baseY}px`;
        p.style.setProperty('--flyX', `${wx * 1.3}px`);
        p.style.animationDuration = `${dur}s`;
        document.body.appendChild(p);
        setTimeout(() => p.remove(), dur * 1000);
    }
}

// 花朵跟随摇曳
function updateFlowers() {
    flowers.forEach(f => {
        if (fallenFlowers.has(f)) return;
        let x, y;
        if (f.branch) {
            x = f.branch.endX + treeLean * (f.branch.depth / 4) + f.offsetX;
            y = f.branch.endY + f.offsetY;
        } else {
            x = f.baseX + treeLean * 0.6;
            y = f.baseY;
        }
        f.element.style.left = `${x}px`;
        f.element.style.top = `${y}px`;
        f.element.style.transform = `rotate(${treeLean * 0.15}deg)`;
    });
}

// 渲染树
function renderTree() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const grow = Math.min(1, animationProgress / 0.7);
    branches.forEach(b => {
        const w = b.thickness * grow;
        ctx.lineWidth = w;
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#5a4a4a';
        const l = treeLean * (b.depth / 4);
        ctx.beginPath();
        ctx.moveTo(b.x, b.y);
        ctx.quadraticCurveTo((b.x + b.endX) / 2 + l, (b.y + b.endY) / 2 - 20, b.endX + l, b.endY);
        ctx.stroke();
    });
}

// 主循环
function animate() {
    animationProgress += 0.005;
    updateWind();
    renderTree();
    updateFlowers();
    if (animationProgress < 1) {
        requestAnimationFrame(animate);
    } else {
        opening.style.opacity = 0;
        setTimeout(() => {
            opening.style.display = 'none';
            app.style.display = 'block';
            setTimeout(() => app.style.opacity = 1, 50);
        }, 1200);
    }
}

// 启动
generateBranches();
createFlowers();
animate();
