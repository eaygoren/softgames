import * as PIXI from "pixi.js";
import { LANDSCAPE_RESULATION, ORIENTATIONS } from "./Configs";

export class Background extends PIXI.Container {
    private _background: PIXI.Sprite;
    
    constructor() {
        super();
        this.onLoad();
    }

    // initializes the background by calling the create method
    private onLoad() {
        this.create();
    }

    // creates the background sprite and sets its size and position
    private create() {
        this._background = PIXI.Sprite.from("background");
        this._background.name = "Background";
        this._background.width = LANDSCAPE_RESULATION.width;
        this._background.height = LANDSCAPE_RESULATION.height;
        this._background.anchor.set(0.5, 0.5);
        this._background.position.set(LANDSCAPE_RESULATION.width / 2, LANDSCAPE_RESULATION.height / 2);
        this.addChild(this._background);
    }

    // adjusts the background based on the screen orientation
    public onResize(orientation: ORIENTATIONS) {
        switch (orientation) {
            case ORIENTATIONS.landscape:
                this._background.angle = 0;
                this._background.position.set(LANDSCAPE_RESULATION.width / 2, LANDSCAPE_RESULATION.height / 2);
                break;
            case ORIENTATIONS.portrait:
                this._background.angle = 90;
                this._background.position.set(LANDSCAPE_RESULATION.height / 2, LANDSCAPE_RESULATION.width / 2);
                break;
        }
    }
}