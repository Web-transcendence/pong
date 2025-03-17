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

class gameState {
    state: number = 0;
    start: boolean = false;
    score1: string = "0";
    score2: string = "0";
}

let animFrame = 0;
let animLoop = 1;
let game = new gameState();
let ball = new Ball(canvas.width / 2, canvas.height / 2, 10, "#fcc800");
let lPaddle = new Paddle(30, canvas.height / 2, 20, 200, "#fcc800");
let rPaddle = new Paddle(canvas.width - 30, canvas.height / 2, 20, 200, "#fcc800");

function titleScreen() {
    ctx.fillStyle = "#364153";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#101828";
    ctx.fillRect(15, 15, canvas.width - 30, canvas.height - 30);
    ctx.fillStyle = "#fcc800";
    ctx.font = "84px 'Press Start 2P'";
    ctx.textAlign = "center"
    ctx.fillText("Pong Game", canvas.width * 0.5, canvas.height * 0.5);
    if (animFrame === 0 || animFrame === 1)
        ctx.fillStyle = "#fcc800";
    else if (animFrame === 2 || animFrame === 3)
        ctx.fillStyle = "#ffd014";
    else if (animFrame === 4 || animFrame === 5)
        ctx.fillStyle = "#ffd52b";
    else if (animFrame === 6 || animFrame === 7)
        ctx.fillStyle = "#ffd83e";
    else if (animFrame === 8 || animFrame === 9)
        ctx.fillStyle = "#ffdb5e";
    ctx.font = "30px 'Press Start 2P'";
    ctx.fillText("Press any key", canvas.width * 0.5, canvas.height * 0.5 + 60 + animFrame);
    animFrame += animLoop;
    if (animFrame === 0 || animFrame === 9)
        animLoop *= -1;
}

function endScreen() {
    ctx.fillStyle = "#101828";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#364153";
    for (let i = 0; i < canvas.height; i += 60) {
        ctx.fillRect(canvas.width * 0.5 - 4, i, 8, 30);
    }
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = lPaddle.color;
    ctx.fillRect(lPaddle.x - lPaddle.width * 0.5, lPaddle.y - lPaddle.height * 0.5, lPaddle.width, lPaddle.height);
    ctx.fillStyle = rPaddle.color;
    ctx.fillRect(rPaddle.x - rPaddle.width * 0.5, rPaddle.y - rPaddle.height * 0.5, rPaddle.width, rPaddle.height);
    ctx.fillStyle = "#fcc800";
    ctx.font = "48px 'Press Start 2P'";
    ctx.textAlign = "left"
    ctx.fillText(game.score2, canvas.width * 0.5 + 46, 80);
    ctx.textAlign = "right"
    ctx.fillText(game.score1, canvas.width * 0.5 - 40, 80);
    ctx.fillStyle = "#ddae00";
    ctx.font = "60px 'Press Start 2P'";
    ctx.textAlign = "center";
    if (game.score1 > game.score2)
        ctx.fillText("Player 1 Wins", canvas.width * 0.5, canvas.height * 0.4);
    else
        ctx.fillText("Player 2 Wins", canvas.width * 0.5, canvas.height * 0.4);
    ctx.font = "26px 'Press Start 2P'";
    ctx.textAlign = "center";
    ctx.fillText("Press any key to restart game", canvas.width * 0.5, canvas.height * 0.65);
}

function animateBall() {
    ctx.fillStyle = "#101828";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#364153";
    for (let i = 0; i < canvas.height; i += 60) {
        ctx.fillRect(canvas.width * 0.5 - 4, i, 8, 30);
    }
    ctx.fillStyle = ball.color;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
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
}

function gameLoop () {
    switch (game.state) {
        case 0:
            titleScreen();
            break;
        case 1:
            animateBall();
            break;
        case 2:
            endScreen();
            break;
    }
    requestAnimationFrame(gameLoop);
}

gameLoop();

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
        case "Game":
            game.state = data.state;
            game.score1 = data.score1;
            game.score2 = data.score2;
            game.start = data.start;
            break;
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