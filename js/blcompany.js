
$(function () {
    init();		//初始化
});


var COLOR = "#0099FF"
var MESSAGE = document.getElementById("title-desktop").textContent;
var FONT_SIZE = 70;//字体大小
var AMOUNT = 1450;//粒子数量
var SIZE = 2;//粒子大小
var INITIAL_DISPLACEMENT = 50;//初始位移
var INITIAL_VELOCITY = 3;//初速度
var VELOCITY_RETENTION = 0.95;//速度保持力
var SETTLE_SPEED = 2;//定速
var FLEE_SPEED = 1;//快速逃离
var FLEE_DISTANCE = 50;//逃离距离
var FLEE = true;
var SCATTER_VELOCITY = 2;//散射速度
var SCATTER = true;
if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
    // Mobile
    MESSAGE = document.getElementById("title-mobile").textContent;
    FONT_SIZE = 30;
    AMOUNT = 200;
    SIZE = 2;
    INITIAL_DISPLACEMENT = 50;
    SETTLE_SPEED = 1;
    FLEE = false;
    SCATTER_VELOCITY = 2;
}
const canvas = document.getElementById("spring-text");
const ctx = canvas.getContext("2d");

var POINTS = [];
var MOUSE = {
    x: 0,
    y: 0
}
function Point(x, y, r, g, b, a) {
    var angle = Math.random() * 5.28;
    this.dest_x = x;
    this.dest_y = y;
    this.original_r = r;
    this.original_g = g;
    this.original_a = a;
    this.x = canvas.width / 2 - x + (Math.random() - 0.5) * INITIAL_DISPLACEMENT;
    this.y = canvas.height / 2 - y + (Math.random() - 0.5) * INITIAL_DISPLACEMENT;
    this.velx = INITIAL_VELOCITY * Math.cos(angle);
    this.vely = INITIAL_VELOCITY * Math.sin(angle);
    this.target_x = canvas.width / 2 - x;
    this.target_y = canvas.height / 2 - y;
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;

    this.getX = function () {
        return this.x;
    }

    this.getY = function () {
        return this.y;
    }

    this.resetTarget = function () {
        this.target_x = canvas.width / 2 - this.dest_x;
        this.target_y = canvas.height / 2 - this.dest_y;
    }

    this.fleeFrom = function (x, y) {
        this.velx -= ((MOUSE.x - this.x) * FLEE_SPEED / 10);
        this.vely -= ((MOUSE.y - this.y) * FLEE_SPEED / 10);
    }

    this.settleTo = function (x, y) {
        this.velx += ((this.target_x - this.x) * SETTLE_SPEED / 100);
        this.vely += ((this.target_y - this.y) * SETTLE_SPEED / 100);
        this.velx -= this.velx * (1 - VELOCITY_RETENTION);
        this.vely -= this.vely * (1 - VELOCITY_RETENTION);
    }

    this.scatter = function () {
        var unit = this.unitVecToMouse();
        var vel = SCATTER_VELOCITY * 10 * (0.5 + Math.random() / 2);
        this.velx = -unit.x * vel;
        this.vely = -unit.y * vel;
    }
    this.move = function () {
        if (this.distanceToMouse() <= FLEE_DISTANCE) {
            this.fleeFrom(MOUSE.x, MOUSE.y);
        }
        else {
            this.settleTo(this.target_x, this.target_y);
        }

        if (this.x + this.velx < 0 || this.x + this.velx >= canvas.width) {
            this.velx *= -1;
        }
        if (this.y + this.vely < 0 || this.y + this.vely >= canvas.height) {
            this.vely *= -1;
        }

        this.x += this.velx;
        this.y += this.vely;
    }
    this.distanceToTarget = function () {
        return this.distanceTo(this.target_x, this.target_y);
    }
    this.distanceToMouse = function () {
        return this.distanceTo(MOUSE.x, MOUSE.y);
    }
    this.distanceTo = function (x, y) {
        return Math.sqrt((x - this.x) * (x - this.x) + (y - this.y) * (y - this.y));
    }
    this.unitVecToTarget = function () {
        return this.unitVecTo(this.target_x, this.target_y);
    }
    this.unitVecToMouse = function () {
        return this.unitVecTo(MOUSE.x, MOUSE.y);
    }
    this.unitVecTo = function (x, y) {
        var dx = x - this.x;
        var dy = y - this.y;
        return {
            x: dx / Math.sqrt(dx * dx + dy * dy),
            y: dy / Math.sqrt(dx * dx + dy * dy)
        };
    }
}
// window.addEventListener("resize", function () {
//     resizeCanvas()
//     adjustText()
// });
if (FLEE) {
    window.addEventListener("mousemove", function (event) {
        MOUSE.x = event.clientX;
        MOUSE.y = event.clientY;
    });
}
if (SCATTER) {
    window.addEventListener("click", function (event) {
        MOUSE.x = event.clientX;
        MOUSE.y = event.clientY;
        for (var i = 0; i < POINTS.length; i++) {
            POINTS[i].scatter();
        }
    });
}
function resizeCanvas() {
    //canvas.width = window.innerWidth;
    //canvas.height = window.innerHeight;
    canvas.width = 200;//画布大小
    canvas.height = 70;
}
function adjustText() {
    ctx.fillStyle = COLOR;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";
    ctx.font = FONT_SIZE + "px Arial";
    ctx.fillText(MESSAGE, canvas.width / 2, canvas.height / 2);
    var textWidth = ctx.measureText(MESSAGE).width;
    if (textWidth == 0) {
        return;
    }
    var minX = canvas.width / 2 - textWidth / 2;
    var minY = canvas.height / 2 - FONT_SIZE / 2;
    var data = ctx.getImageData(minX, minY, textWidth, FONT_SIZE).data;
    var isBlank = true;
    for (var i = 0; i < data.length; i++) {
        if (data[i] != 0) {
            isBlank = false;
            break;
        }
    }
    if (!isBlank) {
        var count = 0;
        var curr = 0;
        var num = 0;
        var x = 0;
        var y = 0;
        var w = Math.floor(textWidth);
        POINTS = [];
        while (count < AMOUNT) {
            while (curr == 0) {
                num = Math.floor(Math.random() * data.length);
                curr = data[num];
            }
            num = Math.floor(num / 4);
            x = w / 2 - num % w;
            y = FONT_SIZE / 2 - Math.floor(num / w);
            POINTS.push(new Point(x, y, data[num * 4], data[num * 4 + 1], data[num * 4 + 2], data[num * 4 + 3]));
            curr = 0;
            count++;
        }
    }
}
function init() {
    resizeCanvas()
    adjustText()
    window.requestAnimationFrame(animate);
}
function animate() {
    update();
    draw();
}
function update() {
    var point;
    for (var i = 0; i < POINTS.length; i++) {
        point = POINTS[i];
        point.move();
    }
}
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    var point;
    for (var i = 0; i < POINTS.length; i++) {
        point = POINTS[i];
        ctx.fillStyle = "rgba(" + point.r + "," + point.g + "," + point.b + "," + point.a + ")";
        ctx.beginPath();
        ctx.arc(point.getX(), point.getY(), SIZE, 0, 2 * Math.PI);
        ctx.fill();
    }
    window.requestAnimationFrame(animate);
}

