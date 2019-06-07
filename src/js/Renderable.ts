export default class Renderable {

    protected img: HTMLImageElement;
    protected frame: number;
    protected startFrame: number;
    protected frameCount: number;
    protected framesX: number;
    protected framesY: number;
    protected animTime: number;
    protected speed: number;
    protected scale: number;
    protected subHeight: number;
    protected subWidth: number;

    constructor(
        img: string,
        scale: number = 1,
        startFrame: number = 0,
        frameCount: number = 9,
        framesX: number = 9,
        framesY: number = 4,
        speed: number = 1
    ) {
        this.img = new Image();
        this.img.src = img;
        this.scale = scale;
        this.frame = startFrame;
        this.startFrame = startFrame;
        this.frameCount = frameCount;
        this.framesX = framesX;
        this.framesY = framesY;
        this.speed = speed;
        this.animTime = new Date().getTime();

        this.img.onload = () => {
            this.subWidth = this.img.width / this.framesX;
            this.subHeight = this.img.height / this.framesY;
        }
    }

    draw(ctx: CanvasRenderingContext2D) {
        let t = new Date().getTime();

        if (t >= this.animTime) {
            this.frame++;
            this.animTime = t + 1000 / this.speed;
        }

        if (this.frame > this.startFrame + this.frameCount) {
            this.frame = this.startFrame;
        }

        let posX: number = (this.frame % this.framesX) * this.subWidth;
        let posY: number = Math.floor(this.frame / this.framesX) * this.subHeight;


        ctx.drawImage(
            this.img,
            posX, posY,
            this.subWidth, this.subHeight,
            0, 0,
            this.subWidth * this.scale,
            this.subHeight * this.scale
        );
    }
}