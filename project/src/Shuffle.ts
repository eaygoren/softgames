import * as PIXI from "pixi.js";
import { gsap } from "gsap";
import { CARD_COUNT, LANDSCAPE_RESULATION, ORIENTATIONS } from "./Configs";

export class Shuffle extends PIXI.Container {
    private _cardContainer: PIXI.ParticleContainer;
    private _cards: PIXI.Sprite[] = [];
    private _completedCards: PIXI.Sprite[] = [];
    private _isAnimating: boolean = false;
    private _triggerText: PIXI.Text;
    private _timeoutId: number | null = null;

    constructor() {
        super();
    }

    // initializes the card container, trigger text, and cards
    public async create() {
        this._cardContainer = new PIXI.ParticleContainer(145, {
            scale: true,
            position: true,
            rotation: true,
            alpha: true,
        });
        this._cardContainer.name = "CardContainer";
        this.addChild(this._cardContainer);

        this._triggerText = new PIXI.Text("Click to shuffle!", {
            fontFamily: "Sniglet",
            fontSize: 24,
            fill: 0xffffff,
        });
        this._triggerText.name = "TriggerText";
        this._triggerText.anchor.set(0.5);
        this._triggerText.position.set(LANDSCAPE_RESULATION.width / 2, LANDSCAPE_RESULATION.height / 1.1);
        this._triggerText.interactive = true;
        this._triggerText.cursor = "pointer";
        this._triggerText.on("pointerdown", () => {
            this._triggerText.interactive = false;
            this._triggerText.cursor = "default";

            if (!this._isAnimating) {
                this._isAnimating = true;
                this.startShuffle();
            }
        });
        this.addChild(this._triggerText);

        const cardTextures = PIXI.Assets.get("cards") as PIXI.Spritesheet;

        if (!cardTextures) {
            console.error("cards could not be loaded!");
            return;
        }

        const cardKeys = Object.keys(cardTextures.textures);

        // duplicate and shuffle card keys to create a deck
        const repeatedKeys = [];
        while (repeatedKeys.length < CARD_COUNT) {
            repeatedKeys.push(...cardKeys);
        }
        const shuffledKeys = this.shuffleArray(repeatedKeys).slice(0, CARD_COUNT);

        shuffledKeys.forEach((key, index) => {
            const card = new PIXI.Sprite(cardTextures.textures[key]);
            card.anchor.set(0.5);

            card.x = (LANDSCAPE_RESULATION.width / 2) - 100;
            card.y = (LANDSCAPE_RESULATION.height / 4) + (index * 2) + 50;

            this._cardContainer.addChild(card);
            this._cards.push(card);
        });

        const screenWidth = document.documentElement.clientWidth;
        const screenHeight = document.documentElement.clientHeight;
        let orientation = screenWidth > screenHeight ? ORIENTATIONS.landscape : ORIENTATIONS.portrait;
        this.onResize(orientation);
    }

    // starts the shuffle animation for the cards
    private startShuffle() {
        let isMovingRight = true;

        const animateCard = () => {
            if (!this._isAnimating) return;

            // if all cards are shuffled, reset the deck
            if (this._cards.length === 0) {
                isMovingRight = !isMovingRight;
                this._cards = [...this._completedCards];
                this._completedCards.length = 0;
            }

            const topCard = isMovingRight ? this._cards.pop() : this._cards.shift();
            if (!topCard) return;

            const targetX = isMovingRight ? LANDSCAPE_RESULATION.width / 2 + 100 : LANDSCAPE_RESULATION.width / 2 - 100;
            const targetY = (LANDSCAPE_RESULATION.height / 4) + (this._completedCards.length * 2) + 50;

            this._cardContainer.setChildIndex(topCard, this._cardContainer.children.length - 1);

            gsap.to(topCard, {
                x: targetX,
                y: targetY,
                duration: 2,
                onComplete: () => {
                    topCard.x = targetX;
                    topCard.y = targetY;

                    if (isMovingRight) {
                        this._completedCards.unshift(topCard);
                    } else {
                        this._completedCards.push(topCard);
                    }

                    this._timeoutId = window.setTimeout(animateCard, 1000);
                },
            });
        };

        animateCard();
    }

    // shuffles an array using the fisher-yates algorithm
    private shuffleArray(array: any[]): any[] {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // cleans up resources and stops animations
    public dispose() {
        this._isAnimating = false;

        if (this._timeoutId !== null) {
            clearTimeout(this._timeoutId);
            this._timeoutId = null;
        }

        if (this._triggerText) {
            this._triggerText.destroy();
        }

        this._cards = [];
        this._completedCards = [];

        if (this._cardContainer) {
            this._cardContainer.destroy();
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