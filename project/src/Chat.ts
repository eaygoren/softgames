import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { EMOJI_DATA, LANDSCAPE_RESULATION, ORIENTATIONS } from "./Configs";

export class Chat extends PIXI.Container {
    private _dialogue: any[] = [];
    private _avatars: any = {};
    private _currentIndex: number = 0;
    private _textDisplay!: PIXI.Text;
    private _avatarSprite!: PIXI.Sprite;
    private _bubble!: PIXI.Sprite;
    private _startText!: PIXI.Text;
    private _isAnimating: boolean = false;

    constructor() {
        super();
    }

    // initializes the chat bubble, text, and avatar
    public async create() {
        this._currentIndex = 0;

        this._bubble = PIXI.Sprite.from("bubble");
        this._bubble.name = "Bubble";
        this._bubble.anchor.set(0.5);
        this._bubble.position.set(LANDSCAPE_RESULATION.width / 2, LANDSCAPE_RESULATION.height / 3);
        this._bubble.scale.set(1);
        this.addChild(this._bubble);

        this._startText = new PIXI.Text("Click to start the dialogue!", {
            fontFamily: "Sniglet",
            fontSize: 30,
            fill: 0x000000,
            align: "center",
            wordWrap: true,
            wordWrapWidth: 320,
        });
        this._startText.anchor.set(0.5);
        this._startText.position.set(LANDSCAPE_RESULATION.width / 2, LANDSCAPE_RESULATION.height / 3);
        this.addChild(this._startText);

        this._textDisplay = new PIXI.Text("", {
            fontFamily: "Sniglet",
            fontSize: 27,
            fill: 0x000000,
            wordWrap: true,
            wordWrapWidth: 300,
        });
        this._textDisplay.anchor.set(0.5);
        this._textDisplay.position.set(0, 0);
        this._bubble.addChild(this._textDisplay);

        this._avatarSprite = new PIXI.Sprite();
        this._avatarSprite.name = "AvatarSprite";
        this._avatarSprite.anchor.set(0.5);
        this._avatarSprite.x = 520;
        this._avatarSprite.y = 390;
        this.addChild(this._avatarSprite);

        await this.loadChatData();

        this.interactive = true;
        this.on("pointerdown", this.handleStartClick.bind(this));

        const screenWidth = document.documentElement.clientWidth;
        const screenHeight = document.documentElement.clientHeight;
        let orientation = screenWidth > screenHeight ? ORIENTATIONS.landscape : ORIENTATIONS.portrait;
        this.onResize(orientation);
    }

    // handles the first click to start the chat
    private handleStartClick() {
        if (this._startText) {
            this.removeChild(this._startText);
            this._startText.destroy();
            this._startText = null!;
        }

        this.handleBubbleAnimation();
        
        this.off("pointerdown", this.handleStartClick);
        this.on("pointerdown", this.handleBubbleAnimation.bind(this));
    }

    // loads chat data from an external API
    private async loadChatData() {
        try {
            const response = await fetch("https://private-624120-softgamesassignment.apiary-mock.com/v2/magicwords");
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();

            this._dialogue = data.dialogue || [];
            this._avatars = this.mapByName(data.avatars || []);

            if (this._dialogue.length === 0) {
                this._startText.text = "No dialogue found!";
            }
        } catch (error) {
            console.error("Error loading chat data:", error);
            this._startText.text = "Failed to load chat data.";
        }
    }

    // animates the chat bubble when transitioning to the next dialogue
    private handleBubbleAnimation() {
        if (this._isAnimating) return;

        this._isAnimating = true;

        gsap.to(this._bubble.scale, {
            x: 0,
            y: 0,
            duration: 0.25,
            ease: "back.in(2)",
            onComplete: () => {
                this.showNextDialogue();

                gsap.to(this._bubble.scale, {
                    x: 1,
                    y: 1,
                    duration: 0.25,
                    ease: "back.out(2)",
                    onComplete: () => {
                        this._isAnimating = false;
                    },
                });
            },
        });
    }

    // displays the next dialogue in the chat
    private showNextDialogue() {
        if (this._dialogue.length === 0) {
            return;
        }

        const currentDialogue = this._dialogue[this._currentIndex];

        const processedText = this.replaceEmojis(currentDialogue.text);
        this._textDisplay.text = processedText;

        const avatarData = this._avatars[currentDialogue.name];
        if (avatarData) {
            this.loadSpriteTexture(this._avatarSprite, avatarData.url);
            this._avatarSprite.x = avatarData.position === "left" ? 520 : 760;
        }

        this._currentIndex = (this._currentIndex + 1) % this._dialogue.length;
    }

    // replaces emoji placeholders in the text with actual emojis
    private replaceEmojis(text: string): string {
        return text.replace(/{(.*?)}/g, (match, key) => {
            const emojiData = EMOJI_DATA.find((emoji) => emoji.name === key);
            return emojiData ? emojiData.emoji : match;
        });
    }

    // maps an array of items by their name property
    private mapByName(items: any[]): any {
        const map: any = {};
        items.forEach((item) => {
            map[item.name] = item;
        });
        return map;
    }

    // loads a texture from a URL and applies it to a sprite
    private loadSpriteTexture(sprite: PIXI.Sprite, url: string) {
        PIXI.Texture.fromURL(url).then((texture) => {
            sprite.texture = texture;
        });
    }

    // cleans up all resources and event listeners
    public dispose() {
        this.off("pointerdown", this.handleStartClick);
        this.off("pointerdown", this.handleBubbleAnimation);

        this._dialogue = [];
        this._avatars = {};

        if (this._startText) {
            this._startText.destroy();
        }
        if (this._textDisplay) {
            this._textDisplay.destroy();
        }
        if (this._avatarSprite) {
            this._avatarSprite.destroy();
        }
        if (this._bubble) {
            this._bubble.destroy();
        }
    }

    // adjusts the position of the container based on screen orientation
    public onResize(orientation: ORIENTATIONS) {
        switch (orientation) {
            case ORIENTATIONS.landscape:
                this.position.set(0, 0);
                break;
            case ORIENTATIONS.portrait:
                this.position.set(-425, 80);
                break;
        }
    }
}