import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { LANDSCAPE_RESULATION, ORIENTATIONS } from "./Configs";

export class Flames extends PIXI.Container {
    private _particleContainer!: PIXI.Container;
    private _particles: PIXI.Graphics[] = [];
    private _emitterPosition: PIXI.Point;
    private _particleInterval!: number;
    private _startText!: PIXI.Text;

    constructor() {
        super();
        this._emitterPosition = new PIXI.Point(
            LANDSCAPE_RESULATION.width / 2,
            LANDSCAPE_RESULATION.height / 1.5
        );
    }

    // initializes the particle container and start text
    public async create() {
        this._particleContainer = new PIXI.Container();
        this.addChild(this._particleContainer);

        this._startText = new PIXI.Text("Click to start flames!", {
            fontFamily: "Sniglet",
            fontSize: 30,
            fill: 0xffffff,
            align: "center",
        });
        this._startText.anchor.set(0.5);
        this._startText.position.set(LANDSCAPE_RESULATION.width / 2, LANDSCAPE_RESULATION.height / 2);
        this.addChild(this._startText);

        this._startText.interactive = true;
        this._startText.cursor = "pointer";
        this._startText.on("pointerdown", this.handleStartClick.bind(this));

        const screenWidth = document.documentElement.clientWidth;
        const screenHeight = document.documentElement.clientHeight;
        let orientation = screenWidth > screenHeight ? ORIENTATIONS.landscape : ORIENTATIONS.portrait;
        this.onResize(orientation);
    }

    // handles the click event to start the flame animation
    private handleStartClick() {
        this._startText.visible = false;
        this._startText.interactive = false;
        this.startEmitting();
    }

    // starts emitting particles at regular intervals
    private startEmitting() {
        this._particleInterval = window.setInterval(() => {
            this.createFlame();
        }, 50);
    }

    // creates a single flame particle and animates it
    private createFlame() {
        const flame = new PIXI.Graphics();
        const radius = 8 + Math.random() * 6;
        flame.beginFill(0xFFA500);
        flame.drawCircle(0, 0, radius);
        flame.endFill();

        flame.x = this._emitterPosition.x + (Math.random() - 0.5) * 100;
        flame.y = this._emitterPosition.y;
        flame.alpha = 1;
        this._particleContainer.addChild(flame);
        this._particles.push(flame);

        // animates the flame particle
        gsap.to(flame, {
            duration: 1.5 + Math.random() * 0.5,
            x: flame.x + (Math.random() - 0.5) * 50,
            y: flame.y - 200 - Math.random() * 50,
            alpha: 0,
            scaleX: 0.5,
            scaleY: 0.5,
            onUpdate: () => {
                // updates the flame's color based on its alpha value
                const progress = 1 - flame.alpha;
                const color = this.lerpColor(0xFFA500, 0xFF0000, progress);
                flame.clear();
                flame.beginFill(color);
                flame.drawCircle(0, 0, radius);
                flame.endFill();
            },
            onComplete: () => {
                // removes the flame particle after animation is complete
                this._particleContainer.removeChild(flame);
                this._particles = this._particles.filter(p => p !== flame);
                flame.destroy();
            },
        });
    }

    // interpolates between two colors based on a progress value
    private lerpColor(a: number, b: number, t: number): number {
        const ar = (a >> 16) & 0xff, ag = (a >> 8) & 0xff, ab = a & 0xff;
        const br = (b >> 16) & 0xff, bg = (b >> 8) & 0xff, bb = b & 0xff;

        const rr = ar + (br - ar) * t;
        const rg = ag + (bg - ag) * t;
        const rb = ab + (bb - ab) * t;

        return (rr << 16) | (rg << 8) | rb;
    }

    // cleans up all particles and intervals
    public dispose() {
        window.clearInterval(this._particleInterval);

        this._particles.forEach(particle => {
            gsap.killTweensOf(particle);
            this._particleContainer.removeChild(particle);
            particle.destroy();
        });
        this._particles = [];

        if (this._particleContainer) {
            this.removeChild(this._particleContainer);
            this._particleContainer.destroy();
        }

        if (this._startText) {
            this._startText.off("pointerdown", this.handleStartClick);
            this.removeChild(this._startText);
            this._startText.destroy();
        }
    }

    // adjusts the position of the container based on screen orientation
    public onResize(orientation: ORIENTATIONS) {
        switch (orientation) {
            case ORIENTATIONS.landscape:
                this.position.set(0, 0);
                break;
            case ORIENTATIONS.portrait:
                this.position.set(-425, 0);
                break;
        }
    }
}
