const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth * 0.8;
canvas.height = window.innerHeight * 0.8;

let player = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 20,
    color: 'blue',
    speed: 5
};

// Conectar al servidor WebSocket
const socket = new WebSocket('ws://localhost:8080');

// Mover al jugador con el teclado
document.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp") player.y -= player.speed;
    if (e.key === "ArrowDown") player.y += player.speed;
    if (e.key === "ArrowLeft") player.x -= player.speed;
    if (e.key === "ArrowRight") player.x += player.speed;
    sendPlayerData();
});

// Enviar los datos del jugador al servidor
function sendPlayerData() {
    socket.send(JSON.stringify({ x: player.x, y: player.y }));
}

// Dibujar al jugador
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.beginPath();
    ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
    ctx.fillStyle = player.color;
    ctx.fill();
    ctx.closePath();
    requestAnimationFrame(draw);
}

draw();
