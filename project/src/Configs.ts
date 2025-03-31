// list of assets used in the application
export const ASSETS = [
    { alias: "cards",           src: "assets/textures/cards.json" },
    { alias: "background",      src: "assets/environment/background.jpg" },
    { alias: "bubble",          src: "assets/environment/bubble.png" },
    { alias: "logo",            src: "assets/environment/logo.png" },
];

// emoji data used for replacing placeholders in text
export const EMOJI_DATA = [
    { name: "sad", emoji: "😟" },
    { name: "intrigued", emoji: "🧐" },
    { name: "neutral", emoji: "😐" },
    { name: "satisfied", emoji: "😊" },
    { name: "laughing", emoji: "😄" },
    { name: "win", emoji: "🥳" },
    { name: "affirmative", emoji: "👍" },
];

// total number of cards used in the shuffle scene
export const CARD_COUNT = 144;

// emums for screen orientations
export enum ORIENTATIONS {
    landscape = "landscape",
    portrait = "portrait"
}

// resolution settings for portrait mode
export const PORTRAIT_RESULATION = { width: 720, height: 1280 };

// resolution settings for landscape mode
export const LANDSCAPE_RESULATION = { width: 1280, height: 720 };