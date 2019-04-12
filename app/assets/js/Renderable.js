export default class Renderable {

    constructor(
        img, scale = 1, startFrame = 0, frameCount = 9,
        framesX = 9, framesY = 4, speed = 1
    ) {
        this.img = new Image();
        this.img.src = img;

        this.scale = scale;
        this.frame = startFrame;

        this.startFrame = startFrame;
        this.frameCount = frameCount;

        this.framesX = framesX;
        this.framesY = framesY;

        this.subWidth = this.img.width / this.framesX;
        this.subHeight = this.img.height / this.framesY;

        this.speed = speed;

        this.animTime = new Date().getTime();
    }

    draw(ctx) {
        let t = new Date().getTime();

        if (t >= this.animTime) {
            this.frame++;
            this.animTime = t + 1000 / this.speed;
        }

        if (this.frame > this.startFrame + this.frameCount) {
            this.frame = this.startFrame;
        }

        let posX = (this.frame % this.framesX) * this.subWidth;
        let posY = Math.floor(this.frame / this.framesX) * this.subHeight;

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