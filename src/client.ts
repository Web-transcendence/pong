const canvas = document.getElementById("gameCanvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

class Ball {
    x: number;
    y: number;
    radius: number;
    color: string;
    constructor(x: number, y: number, radius: number, color: string) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
    }
}

class Paddle {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
    score: string;
    constructor(x: number, y: number, width: number, height: number, color: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.score = "0";
    }
}

// let animFrame = 0;
// let animLoop = 1;
//
// function titleScreen() {
//     ctx.fillStyle = "#364153";
//     ctx.fillRect(0, 0, canvas.width, canvas.height);
//     ctx.fillStyle = "#101828";
//     ctx.fillRect(15, 15, canvas.width - 30, canvas.height - 30);
//     ctx.fillStyle = "#fcc800";
//     ctx.font = "84px 'Press Start 2P'";
//     ctx.textAlign = "center"
//     ctx.fillText("Pong Game", canvas.width * 0.5, canvas.height * 0.5);
//     if (animFrame === 0 || animFrame === 1)
//         ctx.fillStyle = "#fcc800";
//     else if (animFrame === 2 || animFrame === 3)
//         ctx.fillStyle = "#ffd014";
//     else if (animFrame === 4 || animFrame === 5)
//         ctx.fillStyle = "#ffd52b";
//     else if (animFrame === 6 || animFrame === 7)
//         ctx.fillStyle = "#ffd83e";
//     else if (animFrame === 8 || animFrame === 9)
//         ctx.fillStyle = "#ffdb5e";
//     ctx.font = "30px 'Press Start 2P'";
//     ctx.fillText("Press any key", canvas.width * 0.5, canvas.height * 0.5 + 60 + animFrame);
//     animFrame += animLoop;
//     if (animFrame === 0 || animFrame === 9)
//         animLoop *= -1;
//     if (state === 0)
//         setTimeout(() => titleScreen(), 70);
// }
//
// function endScreen() {
//     ctx.fillStyle = "#ddae00";
//     ctx.font = "60px 'Press Start 2P'";
//     ctx.textAlign = "center";
//     if (lPaddle.score === maxScore)
//         ctx.fillText("Player 1 Wins", canvas.width * 0.5, canvas.height * 0.4);
//     else if (rPaddle.score === maxScore)
//         ctx.fillText("Player 2 Wins", canvas.width * 0.5, canvas.height * 0.4);
//     ctx.font = "26px 'Press Start 2P'";
//     ctx.textAlign = "center";
//     ctx.fillText("Press any key to restart game", canvas.width * 0.5, canvas.height * 0.65);
//     rPaddle.score = "0";
//     lPaddle.score = "0";
//     if (state === 4)
//         setTimeout(() => endScreen(), 70);
// }

let ball = new Ball(canvas.width / 2, canvas.height / 2, 10, "#fcc800");
let lPaddle = new Paddle(30, canvas.height / 2, 20, 200, "#fcc800");
let rPaddle = new Paddle(canvas.width - 30, canvas.height / 2, 20, 200, "#fcc800");

function animateBall() {
    // Remplir le fond
    ctx.fillStyle = "#101828";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    // Debug
    ctx.fillStyle = "#364153";
    for (let i = 0; i < canvas.height; i += 60) {
        ctx.fillRect(canvas.width * 0.5 - 4, i, 8, 30);
    }
    // Dessiner la balle
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    // Dessiner les raquettes
    ctx.fillStyle = lPaddle.color;
    ctx.fillRect(lPaddle.x - lPaddle.width * 0.5, lPaddle.y - lPaddle.height * 0.5, lPaddle.width, lPaddle.height);
    ctx.fillStyle = rPaddle.color;
    ctx.fillRect(rPaddle.x - rPaddle.width * 0.5, rPaddle.y - rPaddle.height * 0.5, rPaddle.width, rPaddle.height);
    ctx.fillStyle = "#fcc800";
    ctx.font = "48px 'Press Start 2P'";
    ctx.textAlign = "left"
    ctx.fillText(rPaddle.score, canvas.width * 0.5 + 46, 80);
    ctx.textAlign = "right"
    ctx.fillText(lPaddle.score, canvas.width * 0.5 - 40, 80);
    // Relance l'animation à chaque frame
    requestAnimationFrame(animateBall);
}

// function gameLoop () { // 0 = TitleScreen || 1 = LoadGame || 2 = Playing || 3 = LoadEndScreen || 4 = EndScreenRunning
//     if (state === 1) {
//         state = 2;
//         animateBall();
//         moveBall();
//         movePaddle();
//     }
//     if (state === 3) {
//         state = 4;
//         endScreen();
//     }
//     requestAnimationFrame(gameLoop);
// }

// titleScreen();
animateBall();

const socket = new WebSocket("ws://localhost:8080");

window.addEventListener("keydown", (event) => {
    socket.send(JSON.stringify({ type: "input", key: event.key, state: "down" }));
});

window.addEventListener("keyup", (event) => {
    socket.send(JSON.stringify({ type: "input", key: event.key, state: "up" }));
});

socket.onopen = function () { return console.log("Connected to server"); };

socket.onmessage = function (event) {
    const data = JSON.parse(event.data);
    switch (data.type) {
        case "Ball":
            ball.x = data.x;
            ball.y = data.y;
            ball.radius = data.radius;
            ball.color = data.color;
            break;
        case "Paddle":
            if (data.x === 30) {
                lPaddle.y = data.y;
                lPaddle.width = data.width;
                lPaddle.height = data.height;
                lPaddle.color = data.color;
                lPaddle.score = data.score;
            }
            else {
                rPaddle.y = data.y;
                rPaddle.width = data.width;
                rPaddle.height = data.height;
                rPaddle.color = data.color;
                rPaddle.score = data.score;
            }
            break;
        default:
            console.warn("Unknown type received:", data);
    }
};

socket.onclose = function () { return console.log("Disconnected"); };