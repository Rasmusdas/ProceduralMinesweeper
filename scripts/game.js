var noise = {};
function Grad(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
}
Grad.prototype.dot2 = function (x, y) {
    return this.x * x + this.y * y;
};
Grad.prototype.dot3 = function (x, y, z) {
    return this.x * x + this.y * y + this.z * z;
};
var grad3 = [new Grad(1, 1, 0), new Grad(-1, 1, 0), new Grad(1, -1, 0), new Grad(-1, -1, 0),
    new Grad(1, 0, 1), new Grad(-1, 0, 1), new Grad(1, 0, -1), new Grad(-1, 0, -1),
    new Grad(0, 1, 1), new Grad(0, -1, 1), new Grad(0, 1, -1), new Grad(0, -1, -1)];
var p = [151, 160, 137, 91, 90, 15,
    131, 13, 201, 95, 96, 53, 194, 233, 7, 225, 140, 36, 103, 30, 69, 142, 8, 99, 37, 240, 21, 10, 23,
    190, 6, 148, 247, 120, 234, 75, 0, 26, 197, 62, 94, 252, 219, 203, 117, 35, 11, 32, 57, 177, 33,
    88, 237, 149, 56, 87, 174, 20, 125, 136, 171, 168, 68, 175, 74, 165, 71, 134, 139, 48, 27, 166,
    77, 146, 158, 231, 83, 111, 229, 122, 60, 211, 133, 230, 220, 105, 92, 41, 55, 46, 245, 40, 244,
    102, 143, 54, 65, 25, 63, 161, 1, 216, 80, 73, 209, 76, 132, 187, 208, 89, 18, 169, 200, 196,
    135, 130, 116, 188, 159, 86, 164, 100, 109, 198, 173, 186, 3, 64, 52, 217, 226, 250, 124, 123,
    5, 202, 38, 147, 118, 126, 255, 82, 85, 212, 207, 206, 59, 227, 47, 16, 58, 17, 182, 189, 28, 42,
    223, 183, 170, 213, 119, 248, 152, 2, 44, 154, 163, 70, 221, 153, 101, 155, 167, 43, 172, 9,
    129, 22, 39, 253, 19, 98, 108, 110, 79, 113, 224, 232, 178, 185, 112, 104, 218, 246, 97, 228,
    251, 34, 242, 193, 238, 210, 144, 12, 191, 179, 162, 241, 81, 51, 145, 235, 249, 14, 239, 107,
    49, 192, 214, 31, 181, 199, 106, 157, 184, 84, 204, 176, 115, 121, 50, 45, 127, 4, 150, 254,
    138, 236, 205, 93, 222, 114, 67, 29, 24, 72, 243, 141, 128, 195, 78, 66, 215, 61, 156, 180];
var perm = new Array(512);
var gradP = new Array(512);
noise.seed = function (seed) {
    if (seed > 0 && seed < 1) {
        seed *= 65536;
    }
    seed = Math.floor(seed);
    if (seed < 256) {
        seed |= seed << 8;
    }
    for (var i = 0; i < 256; i++) {
        var v;
        if (i & 1) {
            v = p[i] ^ (seed & 255);
        }
        else {
            v = p[i] ^ ((seed >> 8) & 255);
        }
        perm[i] = perm[i + 256] = v;
        gradP[i] = gradP[i + 256] = grad3[v % 12];
    }
};
noise.seed(0);
var F2 = 0.5 * (Math.sqrt(3) - 1);
var G2 = (3 - Math.sqrt(3)) / 6;
var F3 = 1 / 3;
var G3 = 1 / 6;
noise.simplex2 = function (xin, yin) {
    var n0, n1, n2;
    var s = (xin + yin) * F2;
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var t = (i + j) * G2;
    var x0 = xin - i + t;
    var y0 = yin - j + t;
    var i1, j1;
    if (x0 > y0) {
        i1 = 1;
        j1 = 0;
    }
    else {
        i1 = 0;
        j1 = 1;
    }
    var x1 = x0 - i1 + G2;
    var y1 = y0 - j1 + G2;
    var x2 = x0 - 1 + 2 * G2;
    var y2 = y0 - 1 + 2 * G2;
    i &= 255;
    j &= 255;
    var gi0 = gradP[i + perm[j]];
    var gi1 = gradP[i + i1 + perm[j + j1]];
    var gi2 = gradP[i + 1 + perm[j + 1]];
    var t0 = 0.5 - x0 * x0 - y0 * y0;
    if (t0 < 0) {
        n0 = 0;
    }
    else {
        t0 *= t0;
        n0 = t0 * t0 * gi0.dot2(x0, y0);
    }
    var t1 = 0.5 - x1 * x1 - y1 * y1;
    if (t1 < 0) {
        n1 = 0;
    }
    else {
        t1 *= t1;
        n1 = t1 * t1 * gi1.dot2(x1, y1);
    }
    var t2 = 0.5 - x2 * x2 - y2 * y2;
    if (t2 < 0) {
        n2 = 0;
    }
    else {
        t2 *= t2;
        n2 = t2 * t2 * gi2.dot2(x2, y2);
    }
    return 70 * (n0 + n1 + n2);
};
noise.simplex3 = function (xin, yin, zin) {
    var n0, n1, n2, n3;
    var s = (xin + yin + zin) * F3;
    var i = Math.floor(xin + s);
    var j = Math.floor(yin + s);
    var k = Math.floor(zin + s);
    var t = (i + j + k) * G3;
    var x0 = xin - i + t;
    var y0 = yin - j + t;
    var z0 = zin - k + t;
    var i1, j1, k1;
    var i2, j2, k2;
    if (x0 >= y0) {
        if (y0 >= z0) {
            i1 = 1;
            j1 = 0;
            k1 = 0;
            i2 = 1;
            j2 = 1;
            k2 = 0;
        }
        else if (x0 >= z0) {
            i1 = 1;
            j1 = 0;
            k1 = 0;
            i2 = 1;
            j2 = 0;
            k2 = 1;
        }
        else {
            i1 = 0;
            j1 = 0;
            k1 = 1;
            i2 = 1;
            j2 = 0;
            k2 = 1;
        }
    }
    else {
        if (y0 < z0) {
            i1 = 0;
            j1 = 0;
            k1 = 1;
            i2 = 0;
            j2 = 1;
            k2 = 1;
        }
        else if (x0 < z0) {
            i1 = 0;
            j1 = 1;
            k1 = 0;
            i2 = 0;
            j2 = 1;
            k2 = 1;
        }
        else {
            i1 = 0;
            j1 = 1;
            k1 = 0;
            i2 = 1;
            j2 = 1;
            k2 = 0;
        }
    }
    var x1 = x0 - i1 + G3;
    var y1 = y0 - j1 + G3;
    var z1 = z0 - k1 + G3;
    var x2 = x0 - i2 + 2 * G3;
    var y2 = y0 - j2 + 2 * G3;
    var z2 = z0 - k2 + 2 * G3;
    var x3 = x0 - 1 + 3 * G3;
    var y3 = y0 - 1 + 3 * G3;
    var z3 = z0 - 1 + 3 * G3;
    i &= 255;
    j &= 255;
    k &= 255;
    var gi0 = gradP[i + perm[j + perm[k]]];
    var gi1 = gradP[i + i1 + perm[j + j1 + perm[k + k1]]];
    var gi2 = gradP[i + i2 + perm[j + j2 + perm[k + k2]]];
    var gi3 = gradP[i + 1 + perm[j + 1 + perm[k + 1]]];
    var t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) {
        n0 = 0;
    }
    else {
        t0 *= t0;
        n0 = t0 * t0 * gi0.dot3(x0, y0, z0);
    }
    var t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) {
        n1 = 0;
    }
    else {
        t1 *= t1;
        n1 = t1 * t1 * gi1.dot3(x1, y1, z1);
    }
    var t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) {
        n2 = 0;
    }
    else {
        t2 *= t2;
        n2 = t2 * t2 * gi2.dot3(x2, y2, z2);
    }
    var t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) {
        n3 = 0;
    }
    else {
        t3 *= t3;
        n3 = t3 * t3 * gi3.dot3(x3, y3, z3);
    }
    return 32 * (n0 + n1 + n2 + n3);
};
function fade(t) {
    return t * t * t * (t * (t * 6 - 15) + 10);
}
function lerp(a, b, t) {
    return (1 - t) * a + t * b;
}
noise.perlin2 = function (x, y) {
    var X = Math.floor(x), Y = Math.floor(y);
    x = x - X;
    y = y - Y;
    X = X & 255;
    Y = Y & 255;
    var n00 = gradP[X + perm[Y]].dot2(x, y);
    var n01 = gradP[X + perm[Y + 1]].dot2(x, y - 1);
    var n10 = gradP[X + 1 + perm[Y]].dot2(x - 1, y);
    var n11 = gradP[X + 1 + perm[Y + 1]].dot2(x - 1, y - 1);
    var u = fade(x);
    return lerp(lerp(n00, n10, u), lerp(n01, n11, u), fade(y));
};
noise.perlin3 = function (x, y, z) {
    var X = Math.floor(x), Y = Math.floor(y), Z = Math.floor(z);
    x = x - X;
    y = y - Y;
    z = z - Z;
    X = X & 255;
    Y = Y & 255;
    Z = Z & 255;
    var n000 = gradP[X + perm[Y + perm[Z]]].dot3(x, y, z);
    var n001 = gradP[X + perm[Y + perm[Z + 1]]].dot3(x, y, z - 1);
    var n010 = gradP[X + perm[Y + 1 + perm[Z]]].dot3(x, y - 1, z);
    var n011 = gradP[X + perm[Y + 1 + perm[Z + 1]]].dot3(x, y - 1, z - 1);
    var n100 = gradP[X + 1 + perm[Y + perm[Z]]].dot3(x - 1, y, z);
    var n101 = gradP[X + 1 + perm[Y + perm[Z + 1]]].dot3(x - 1, y, z - 1);
    var n110 = gradP[X + 1 + perm[Y + 1 + perm[Z]]].dot3(x - 1, y - 1, z);
    var n111 = gradP[X + 1 + perm[Y + 1 + perm[Z + 1]]].dot3(x - 1, y - 1, z - 1);
    var u = fade(x);
    var v = fade(y);
    var w = fade(z);
    return lerp(lerp(lerp(n000, n100, u), lerp(n001, n101, u), w), lerp(lerp(n010, n110, u), lerp(n011, n111, u), w), v);
};
var chunkSize = 7;
var mineChance = 0.3;
var cellSize = 32;
var perlinXSeed = 69.420;
var perlinYSeed = 420.69;
var renderRadius = 9;
var MinesweeperChunk = (function () {
    function MinesweeperChunk(offsetX, offsetY) {
        this.chunk = [];
        this.chunk.length = chunkSize;
        this.chunk = [];
        this.revealed = [];
        this.offsetX = offsetX;
        this.offsetY = offsetY;
        for (var x = 0; x < chunkSize; x++) {
            this.chunk[x] = [];
            this.revealed[x] = [];
            this.chunk[x].length = chunkSize;
            this.revealed[x].length = chunkSize;
            for (var y = 0; y < chunkSize; y++) {
                this.chunk[x][y] = 0;
                this.revealed[x][y] = false;
                if (noise.perlin2((x + this.offsetX) * perlinXSeed, (y + this.offsetY) * perlinYSeed) > mineChance) {
                    this.chunk[x][y] = -1;
                }
            }
        }
        for (var x = 0; x < chunkSize; x++) {
            for (var y = 0; y < chunkSize; y++) {
                if (this.chunk[x][y] != -1) {
                    this.chunk[x][y] = this.getBombsNear(x, y);
                }
            }
        }
    }
    MinesweeperChunk.prototype.getBombsNear = function (x, y) {
        var count = 0;
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (noise.perlin2((x + i + this.offsetX) * perlinXSeed, (y + j + this.offsetY) * perlinYSeed) > mineChance) {
                    count++;
                }
            }
        }
        return count;
    };
    return MinesweeperChunk;
}());
var MinesweeperGame = (function () {
    function MinesweeperGame() {
        this.chunks = new Map();
    }
    MinesweeperGame.prototype.generateChunk = function (x, y) {
        this.chunks.set(x + "|" + y, new MinesweeperChunk(x * chunkSize, y * chunkSize));
    };
    MinesweeperGame.prototype.getChunk = function (x, y) {
        if (!this.chunks.get(x + "|" + y)) {
            this.generateChunk(x, y);
        }
        return this.chunks.get(x + "|" + y);
    };
    MinesweeperGame.prototype.reveal = function (x, y, xChunk, yChunk) {
        var chunk = this.getChunk(xChunk, yChunk);
        if (chunk.revealed[x][y] == true) {
            return;
        }
        chunk.revealed[x][y] = true;
        if (chunk.chunk[x][y] == -1) {
            return;
        }
        if (chunk.chunk[x][y] >= 10) {
            chunk.chunk[x][y] -= 20;
        }
        if (chunk.chunk[x][y] > 0) {
            return;
        }
        for (var i = -1; i <= 1; i++) {
            for (var j = -1; j <= 1; j++) {
                if (i == 0 && j == 0) {
                    continue;
                }
                if (x + i < 0) {
                    this.reveal(chunkSize - 1, y, xChunk - 1, yChunk);
                    continue;
                }
                if (x + i >= chunkSize) {
                    this.reveal(0, y, xChunk + 1, yChunk);
                    continue;
                }
                if (y + j < 0) {
                    this.reveal(x, chunkSize - 1, xChunk, yChunk - 1);
                    continue;
                }
                if (y + j >= chunkSize) {
                    this.reveal(x, 0, xChunk, yChunk + 1);
                    continue;
                }
                this.reveal(x + i, y + j, xChunk, yChunk);
            }
        }
    };
    return MinesweeperGame;
}());
var MinesweeperUI = (function () {
    function MinesweeperUI() {
        var _this = this;
        this.canvas = document.getElementById("canvas");
        this.ctx = this.canvas.getContext("2d");
        this.canvas.width = document.body.clientWidth - 4;
        this.canvas.height = document.body.clientHeight - 4;
        this.canvas.onmousedown = function (eventArgs) {
            var x = eventArgs.clientX - _this.canvas.width / 2 + cellSize / 2;
            var y = eventArgs.clientY - _this.canvas.height / 2 + cellSize / 2;
            if (x < 0) {
                x -= cellSize;
            }
            if (y < 0) {
                y -= cellSize;
            }
            x = (x - x % cellSize) / cellSize;
            y = (y - y % cellSize) / cellSize;
            x = x + Math.floor(chunkSize / 2);
            y = y + Math.floor(chunkSize / 2);
            var xChunk = Math.floor(x / chunkSize);
            var yChunk = Math.floor(y / chunkSize);
            x = x % chunkSize;
            y = y % chunkSize;
            _this.clickTile(x, y, xChunk + _this.offsetX, yChunk + _this.offsetY, eventArgs.button == 2);
        };
        document.onkeydown = function (eventArgs) {
            console.log(eventArgs.code);
            switch (eventArgs.code) {
                case "ArrowDown":
                    _this.offsetY++;
                    break;
                case "ArrowUp":
                    _this.offsetY--;
                    break;
                case "ArrowRight":
                    _this.offsetX++;
                    break;
                case "ArrowLeft":
                    _this.offsetX--;
                    break;
            }
            _this.drawMap();
        };
        document.onwheel = function (eventArgs) {
            console.log(eventArgs);
            if (eventArgs.deltaY < 0) {
                if (cellSize - 2 > 8) {
                    cellSize -= 2;
                }
            }
            if (eventArgs.deltaY > 0) {
                if (cellSize + 2 < 32) {
                    cellSize += 2;
                }
            }
            _this.drawMap();
        };
        this.game = new MinesweeperGame;
        this.offsetX = 0;
        this.offsetY = 0;
        this.drawMap();
    }
    MinesweeperUI.prototype.drawMap = function () {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (var x = -renderRadius; x <= renderRadius; x++) {
            for (var y = -renderRadius; y <= renderRadius; y++) {
                this.drawChunk(x + this.offsetX, y + this.offsetY, x, y);
            }
        }
    };
    MinesweeperUI.prototype.drawChunk = function (x, y, posX, posY) {
        var sweeperChunk = this.game.getChunk(x, y);
        for (var i = 0; i < chunkSize; i++) {
            for (var j = 0; j < chunkSize; j++) {
                var color = "grey";
                if (sweeperChunk.revealed[i][j]) {
                    color = "white";
                    if (sweeperChunk.chunk[i][j] == -1) {
                        color = "red";
                    }
                    if (sweeperChunk.chunk[i][j] > 0) {
                        this.ctx.fillStyle = "black";
                        this.ctx.fillText(sweeperChunk.chunk[i][j].toString(), i * cellSize + posX * cellSize * chunkSize + this.canvas.width / 2 - chunkSize / 2 * cellSize, (j * cellSize + posY * cellSize * chunkSize + this.canvas.height / 2 - chunkSize / 2 * cellSize) + 8, 150);
                    }
                }
                if (sweeperChunk.chunk[i][j] >= 10) {
                    color = "green";
                }
                this.drawTile(i * cellSize + posX * cellSize * chunkSize + this.canvas.width / 2 - chunkSize / 2 * cellSize, j * cellSize + posY * cellSize * chunkSize + this.canvas.height / 2 - chunkSize / 2 * cellSize, color);
                if (sweeperChunk.revealed[i][j]) {
                    color = "white";
                    if (sweeperChunk.chunk[i][j] > 0) {
                        this.ctx.fillStyle = "black";
                        this.ctx.fillText(sweeperChunk.chunk[i][j].toString(), i * cellSize + posX * cellSize * chunkSize + this.canvas.width / 2 - chunkSize / 2 * cellSize, (j * cellSize + posY * cellSize * chunkSize + this.canvas.height / 2 - chunkSize / 2 * cellSize) + 8, 150);
                    }
                }
            }
        }
    };
    MinesweeperUI.prototype.drawTile = function (x, y, color) {
        this.ctx.fillStyle = "grey";
        this.ctx.fillRect(x, y, cellSize, cellSize);
        this.ctx.fillStyle = color;
        this.ctx.fillRect(x + 1, y + 1, cellSize - 1, cellSize - 1);
        this.ctx.fillStyle = "white";
        this.ctx.fillRect(x + 1, y + 1, 1, cellSize);
        this.ctx.fillRect(x + 1, y + 1, cellSize, 1);
        this.ctx.fillStyle = "#474747";
        this.ctx.fillRect(x, y + cellSize - 1, cellSize, 1);
        this.ctx.fillRect(x + cellSize - 1, y, 1, cellSize);
    };
    MinesweeperUI.prototype.clickTile = function (x, y, xChunk, yChunk, rightClick) {
        if (x < 0) {
            x = chunkSize - Math.abs(x);
        }
        if (y < 0) {
            y = chunkSize - Math.abs(y);
        }
        console.log("Clicked on (" + x + "," + y + ") in chunk (" + xChunk + "," + yChunk + ")");
        if (rightClick) {
            var chunk = this.game.getChunk(xChunk, yChunk);
            if (chunk.chunk[x][y] >= 10) {
                chunk.chunk[x][y] -= 20;
            }
            else {
                chunk.chunk[x][y] += 20;
            }
        }
        else {
            this.game.reveal(x, y, xChunk, yChunk);
        }
        this.drawMap();
    };
    return MinesweeperUI;
}());
new MinesweeperUI;
//# sourceMappingURL=game.js.map