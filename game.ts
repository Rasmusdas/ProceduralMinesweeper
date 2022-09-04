
const chunkSize = 19;
const mineChance = 0.3;
var cellSize = 32;
const perlinXSeed = 69.420;
const perlinYSeed = 420.69;
const renderRadius = 4;

class MinesweeperChunk
{
    public chunk: number[][];
    public revealed: boolean[][];

    public completed: boolean;

    private offsetX: number
    private offsetY: number

    constructor(offsetX: number, offsetY: number)
    {
        this.chunk = [];
        this.chunk.length = chunkSize;
        this.chunk = [];
        this.revealed = [];
        this.offsetX = offsetX;
        this.offsetY = offsetY;

        for (let x = 0; x < chunkSize; x++) {
            this.chunk[x] = [];
            this.revealed[x] = [];
            this.chunk[x].length = chunkSize;
            this.revealed[x].length = chunkSize;

            for (let y = 0; y < chunkSize; y++) {
                this.chunk[x][y] = 0;
                this.revealed[x][y] = false;
                if(noise.perlin2((x+this.offsetX)*perlinXSeed,(y+this.offsetY)*perlinYSeed) > mineChance)
                {
                    this.chunk[x][y] = -1;
                }
            }
        }

        for (let x = 0; x < chunkSize; x++) {
            for (let y = 0; y < chunkSize; y++) {
                if(this.chunk[x][y] != -1)
                {
                    this.chunk[x][y] = this.getBombsNear(x,y);
                }
            }
        }
    }

    private getBombsNear(x: number, y: number)
    {
        let count = 0
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if(noise.perlin2((x+i+this.offsetX)*perlinXSeed,(y+j+this.offsetY)*perlinYSeed) > mineChance)
                {
                    count++;
                }
            }
        }
        return count;
    }
}

class MinesweeperGame
{
    private chunks: Map<string,MinesweeperChunk>

    constructor()
    {
        this.chunks = new Map<string,MinesweeperChunk>();
    }

    private generateChunk(x: number, y: number)
    {
        this.chunks.set(x + "|" + y,new MinesweeperChunk(x*chunkSize,y*chunkSize));
    }

    public getChunk(x: number, y: number)
    {
        if(!this.chunks.get(x+"|"+y))
        {
            this.generateChunk(x,y);
        }
        
        return this.chunks.get(x+"|"+y);
    }

    public reveal(x: number, y: number, xChunk: number, yChunk: number)
    {
        let chunk = this.getChunk(xChunk,yChunk);

        if(chunk.revealed[x][y] == true)
        {
            return;
        }

        chunk.revealed[x][y] = true

        if(chunk.chunk[x][y] == -1 )
        {
            return;
        }
        
        if(chunk.chunk[x][y] >= 10)
        {
            chunk.chunk[x][y] -= 20;
        }

        if(chunk.chunk[x][y] > 0)
        {
            return;
        }


        for (let i= -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                if(i == 0 && j == 0)
                {
                    continue;
                }

                if(x+i < 0)
                {
                    this.reveal(chunkSize-1,y,xChunk-1,yChunk)
                    continue;
                }
                if(x+i >= chunkSize)
                {
                    this.reveal(0,y,xChunk+1,yChunk)
                    continue;
                }
                if(y+j < 0)
                {
                    this.reveal(x,chunkSize-1,xChunk,yChunk-1) 
                    continue;
                }
                if(y+j >= chunkSize)
                {
                    this.reveal(x,0,xChunk,yChunk+1)
                    continue;
                }

                this.reveal(x+i,y+j,xChunk,yChunk)
            }
        }
    }
}

class MinesweeperUI
{
    private game: MinesweeperGame;
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;

    private offsetX: number
    private offsetY: number

    constructor()
    {
        this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
        this.ctx = this.canvas.getContext("2d");

        this.canvas.width = document.body.clientWidth-4;
        this.canvas.height = document.body.clientHeight-4;

        this.canvas.onmousedown = (eventArgs: MouseEvent) => {
            var x = eventArgs.clientX-this.canvas.width/2+cellSize/2
            var y = eventArgs.clientY-this.canvas.height/2+cellSize/2

            if(x < 0)
            {
                x-=cellSize;
            }
            if(y < 0)
            {
                y-=cellSize;
            }

            x = (x - x%cellSize) / cellSize
            y = (y - y%cellSize) / cellSize
            x = x + Math.floor(chunkSize/2)
            y = y + Math.floor(chunkSize/2)

            x = x + this.offsetX
            y = y + this.offsetY

            let xChunk = Math.floor(x/chunkSize)
            let yChunk = Math.floor(y/chunkSize)

            x = x%chunkSize
            y = y%chunkSize

            //console.log("Raw Coordinates: (" + (eventArgs.clientX-this.canvas.width/2+cellSize/2) + "," + (eventArgs.clientY-this.canvas.height/2+cellSize/2) + ")" )
            this.clickTile(x,y,xChunk,yChunk, eventArgs.button == 2)
        }

        document.onkeydown = (eventArgs: KeyboardEvent) => 
        {
            console.log(eventArgs.code)
            switch(eventArgs.code)
            {
                case "ArrowDown":
                    this.offsetY++
                    break;
                case "ArrowUp":
                    this.offsetY--
                    break;
                case "ArrowRight":
                    this.offsetX++
                    break;
                case "ArrowLeft":
                    this.offsetX--
                    break;
                    
            }

            this.drawMap();
        }
        document.onwheel = (eventArgs: WheelEvent) =>
        {
            console.log(eventArgs)
            if(eventArgs.deltaY < 0)
            {
                if(cellSize-2 > 8)
                {
                    cellSize-=2;
                }
            }
            if(eventArgs.deltaY > 0)
            {
                if(cellSize+2 < 32)
                {
                    cellSize+=2;
                }
            }
            this.drawMap()
        } 

        this.game = new MinesweeperGame;
        
        this.offsetX = 0;
        this.offsetY = 0;
        this.drawMap();
    }

    private drawMap()
    {
        let xOffset = this.offsetX/chunkSize
        let yOffset = this.offsetY/chunkSize

        if(xOffset < 0)
        {
            xOffset = Math.ceil(xOffset)
        }
        else
        {
            xOffset = Math.floor(xOffset)
        }

        if(yOffset < 0)
        {
            yOffset = Math.ceil(yOffset)
        }
        else
        {
            yOffset = Math.floor(yOffset)
        }

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let x = -renderRadius; x <= renderRadius; x++) {
            for (let y = -renderRadius; y <= renderRadius; y++) {
                this.drawChunk(x+xOffset,y+yOffset,x,y);
            }
        }
    }

    private drawChunk(x: number, y: number, posX: number, posY: number)
    {
        let sweeperChunk = this.game.getChunk(x,y)
        for (let i = 0; i < chunkSize; i++) {
            for (let j = 0; j < chunkSize; j++) {
                
                let color = "grey"

                if(sweeperChunk.revealed[i][j])
                {
                    color = "white"

                    if(sweeperChunk.chunk[i][j] == -1)
                    {
                        color = "red";
                    }

                    if(sweeperChunk.chunk[i][j] > 0)
                    {
                        this.ctx.fillStyle = "black"
                        this.ctx.fillText(sweeperChunk.chunk[i][j].toString(),i*cellSize+posX*cellSize*chunkSize - (this.offsetX%chunkSize)*cellSize + this.canvas.width/2- chunkSize/2*cellSize,(j*cellSize+posY*cellSize*chunkSize - (this.offsetY%chunkSize)*cellSize + this.canvas.height/2 - chunkSize/2*cellSize)+8,150)
                    }
                }

                if(sweeperChunk.chunk[i][j] >= 10)
                {
                    color = "green"
                }
                this.drawTile(i*cellSize+posX*cellSize*chunkSize - (this.offsetX%chunkSize)*cellSize + this.canvas.width/2- chunkSize/2*cellSize,j*cellSize+posY*cellSize*chunkSize- (this.offsetY%chunkSize)*cellSize + this.canvas.height/2 - chunkSize/2*cellSize,color);

                if(sweeperChunk.revealed[i][j])
                {
                    color = "white"

                    if(sweeperChunk.chunk[i][j] > 0)
                    {
                        console.log("Beep")
                        this.ctx.fillStyle = "black"
                        this.ctx.fillText(sweeperChunk.chunk[i][j].toString(),i*cellSize+posX*cellSize*chunkSize - (this.offsetX%chunkSize)*cellSize + this.canvas.width/2- chunkSize/2*cellSize,(j*cellSize+posY*cellSize*chunkSize - (this.offsetY%chunkSize)*cellSize + this.canvas.height/2 - chunkSize/2*cellSize)+8,150)
                    }
                }


            }
        }
    }

    private drawTile(x: number, y: number, color: string)
    {
        this.ctx.fillStyle = "grey";
        this.ctx.fillRect(x,y,cellSize,cellSize);


        this.ctx.fillStyle = color;
        this.ctx.fillRect(x+1,y+1,cellSize-1,cellSize-1);

        this.ctx.fillStyle = "white"
        this.ctx.fillRect(x+1,y+1,1,cellSize);
        this.ctx.fillRect(x+1,y+1,cellSize,1);

        this.ctx.fillStyle = "#474747"
        this.ctx.fillRect(x,y+cellSize-1,cellSize,1);
        this.ctx.fillRect(x+cellSize-1,y,1,cellSize);

        
    }

    private clickTile(x: number, y: number, xChunk: number, yChunk: number, rightClick: boolean)
    {
        if(x < 0)
        {
            x = chunkSize - Math.abs(x)
        }
        if(y < 0)
        {
            y = chunkSize - Math.abs(y)
        }

        console.log("Clicked on ("+x+","+y+") in chunk ("+xChunk+","+yChunk+")")
        if(rightClick)
        {
            let chunk = this.game.getChunk(xChunk,yChunk);
            if(chunk.chunk[x][y] >= 10)
            {
                chunk.chunk[x][y] -=20
            }
            else
            {
                chunk.chunk[x][y] +=20
            }
        }
        else
        {
            this.game.reveal(x,y,xChunk,yChunk)
        }
        this.drawMap()
    }
}

new MinesweeperUI;