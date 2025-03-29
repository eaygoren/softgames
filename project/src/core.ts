import * as PIXI from "pixi.js";
import { ASSETS, LANDSCAPE_RESULATION, ORIENTATIONS, PORTRAIT_RESULATION } from "./Configs";
import { Background } from "./Background";
import { Shuffle } from "./Shuffle";
import { Chat } from "./Chat";
import { Flames } from "./Flames";
import Stats from "stats.js";

export class core extends PIXI.Container {
    private _app: PIXI.Application;
    private _background: Background;
    private _sceneContainer: PIXI.Container;
    private _buttons: PIXI.Graphics[] = [];
    private _stats!: Stats;

    constructor() {
        super();
        this._app = new PIXI.Application();
        this._app.stage.addChild(this);
        (globalThis as any).__PIXI_APP__ = this._app;

        // initialize fps stats panel
        this._stats = new Stats();
        this._stats.showPanel(0);
        document.body.appendChild(this._stats.dom);

        this._stats.dom.style.position = "absolute";
        this._stats.dom.style.top = "10px";
        this._stats.dom.style.right = "10px";
        this._stats.dom.style.left = "unset";
        this._stats.dom.style.margin = "0";
    }

    // initializes the application and loads assets
    async init() {
        this._app.renderer.resize(LANDSCAPE_RESULATION.width, LANDSCAPE_RESULATION.height);
        this._app.renderer.background.color = 0x1e1e37;
        document.getElementById("Container")?.appendChild(this._app.view as HTMLCanvasElement);
        await PIXI.Assets.load(ASSETS);
        await document.fonts.ready;

        // create and add background
        this._background = new Background();
        this.addChild(this._background);

        // create and add scene container
        this._sceneContainer = new PIXI.Container();
        this._sceneContainer.name = "SceneContainer";
        this.addChild(this._sceneContainer);

        // create buttons for switching scenes
        this.createButtons();

        // handle window resize events
        window.addEventListener("resize", this.onResize.bind(this));
        this.onResize();

        // update fps stats on each frame
        this._app.ticker.add(() => {
            this._stats.begin();
            this._stats.end();
        });
    }

    // creates buttons for switching between scenes
    createButtons() {
        const buttonData = [
            { label: "Ace of Shadows", x: 460, y: 30, scene: new Shuffle() },
            { label: "Magic Words", x: 640, y: 30, scene: new Chat() },
            { label: "Phoenix Flame", x: 820, y: 30, scene: new Flames() },
        ];

        buttonData.forEach((data, index) => {
            this._buttons[index] = new PIXI.Graphics();
            this._buttons[index].beginFill(0x3498db);
            this._buttons[index].drawRoundedRect(0, 0, 100, 50, 10);
            this._buttons[index].endFill();
            this._buttons[index].x = data.x;
            this._buttons[index].y = data.y;

            const buttonText = new PIXI.Text(data.label, {
                fontFamily: "Sniglet",
                fontSize: 13,
                fill: 0xffffff,
                align: "center",
            });
            buttonText.anchor.set(0.5);
            buttonText.x = 50;
            buttonText.y = 25;
            this._buttons[index].addChild(buttonText);
            this.addChild(this._buttons[index]);

            // add click event to load the corresponding scene
            this._buttons[index].interactive = true;
            this._buttons[index].cursor = "pointer";
            this._buttons[index].on("pointerdown", () => {
                this.loadScene(data.scene);
            });
        });
    }

    // loads a new scene and disposes of the current one
    async loadScene(scene: PIXI.Container) {
        if (this._sceneContainer.children.length > 0) {
            const currentScene = this._sceneContainer.getChildAt(0);
            if (currentScene === scene) {
                return;
            }
        }
        if (this._sceneContainer.children.length > 0) {
            const currentScene = this._sceneContainer.getChildAt(0) as any;
            if (currentScene.dispose && typeof currentScene.dispose === "function") {
                currentScene.dispose();
            }
        }
        this._sceneContainer.removeChildren();
        this._sceneContainer.addChild(scene);
        if ((scene as any).create && typeof (scene as any).create === "function") {
            await (scene as any).create();
        }
    }

    // handles window resize and adjusts the layout
    private onResize(): void {
        const screenWidth = document.documentElement.clientWidth;
        const screenHeight = document.documentElement.clientHeight;
        const orientation = screenWidth > screenHeight ? ORIENTATIONS.landscape : ORIENTATIONS.portrait;

        let scale, enlargedWidth, enlargedHeight;
        switch (orientation) {
            case ORIENTATIONS.landscape:
                scale = Math.min(screenWidth / LANDSCAPE_RESULATION.width, screenHeight / LANDSCAPE_RESULATION.height);

                enlargedWidth = Math.floor(scale * LANDSCAPE_RESULATION.width);
                enlargedHeight = Math.floor(scale * LANDSCAPE_RESULATION.height);

                this.children.forEach(element => {
                    element.scale.set(1);
                });

                this._buttons.forEach((button, index) => {
                    button.position.set(460 + (index * 130), 30);
                });
                break;
            case ORIENTATIONS.portrait:
                scale = Math.min(screenWidth / PORTRAIT_RESULATION.width, screenHeight / PORTRAIT_RESULATION.height);

                enlargedWidth = Math.floor(scale * PORTRAIT_RESULATION.width);
                enlargedHeight = Math.floor(scale * PORTRAIT_RESULATION.height);

                this.children.forEach(element => {
                    element.scale.set(3, (PORTRAIT_RESULATION.width / PORTRAIT_RESULATION.height) * 1.6);
                });

                this._buttons.forEach((button, index) => {
                    button.position.set(150 + (index * 335), 30);
                });
                break;
        }

        this._background.onResize(orientation);

        if (this._sceneContainer.children.length > 0) {
            const currentScene = this._sceneContainer.getChildAt(0) as any;
            if (currentScene.onResize && typeof currentScene.onResize === "function") {
                currentScene.onResize(orientation);
            }
        }

        const horizontalMargin = (screenWidth - enlargedWidth) / 2;
        const verticalMargin = (screenHeight - enlargedHeight) / 2;

        this._app.view.style.width = `${enlargedWidth}px`;
        this._app.view.style.height = `${enlargedHeight}px`;

        const canvasStyle = this._app.view.style as CSSStyleDeclaration;
        canvasStyle.marginLeft = canvasStyle.marginRight = `${horizontalMargin}px`;
        canvasStyle.marginTop = canvasStyle.marginBottom = `${verticalMargin}px`;
    }
}