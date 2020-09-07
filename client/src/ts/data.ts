import * as si from "./spotify-interface";
import { Colors } from "three";
import * as THREE from 'three';

export const COLOURS = {
    beige : "#FCF1DB",
    orange : "#FF1900",
    purple : "#88009D",
    blue : "#00C1F5",
    yellow: "#FFE700",
    white : "#FFFFFF"
}

export const COLOURS_THREE : { [id: string] : THREE.Color } = {
    "#FCF1DB" : new THREE.Color(0xFCF1DB),
    "#FF1900" : new THREE.Color(0xFF2000),
    "#88009D" : new THREE.Color(0x88009D),
    "#00C1F5" : new THREE.Color(0x00C1F5),
    "#FFE700" : new THREE.Color(0xFFE700)
}

export const CONTRAST : { [id: string] : string } = {
    "#FCF1DB" : COLOURS.purple,
    "#FF2000" : COLOURS.purple,
    "FF1900" : COLOURS.orange,
    "#00C1F5" : COLOURS.yellow,
    "#FFE700" : COLOURS.purple
}

export enum QuestionType {
    Slider,
    MultiChoice,
    QuickFire
}

export interface QuestionRound {
    round : number;
    color: string;
    waveColor: string;
    numberColor: string,
    btnTextColor: string,
    btnPaddingColor: string,
    text : string;
    
}

export interface Question {
    params: si.QueryParameters;
    question : string;
}

export interface SliderQuestion extends Question {
    minTextValue : string,
    maxTextValue : string,
    answer : number
}

export interface MCQuestion extends Question {
    options: number,
    answer : string;
}

export interface QuickFireQuestion extends Question {
    answered : boolean,
    answer : boolean
}

export const ROUNDS : QuestionRound[] = [
    {
        round: 1,
        color: COLOURS.orange,
        waveColor : "orange",
        numberColor: COLOURS.yellow,
        btnTextColor : COLOURS.orange,
        btnPaddingColor : COLOURS.purple,
        text : "Light? dark? Hazies? Lagers? There’s a science to it. Slide the dial to show what you’re in to..." 
    },
    {
        round : 2,
        color: COLOURS.purple,
        waveColor : "purple",
        numberColor: COLOURS.yellow,
        btnTextColor : COLOURS.purple,
        btnPaddingColor : COLOURS.orange,
        text: "It’s time to imbue some of your personality into this thing. What makes you, you?"
    },
    {
        round: 3,
        color: COLOURS.blue,
        waveColor : "blue",
        numberColor: COLOURS.purple,
        btnTextColor : COLOURS.orange,
        btnPaddingColor : COLOURS.purple,
        text: "OK, for this part switch off your brain. Don’t think. Just follow your instinct."
    }
]

export const sliderQuestions : Array<SliderQuestion> = [
    {
        params: si.QueryParameters.Valence,
        question : "What brew style are you after?",
        minTextValue : "Light",
        maxTextValue : "Dark",
        answer : 0
    },
    {
        params: si.QueryParameters.Valence,
        question : "How bitter would you like your brew?",
        minTextValue : "0 IBU",
        maxTextValue : "100 IBU",
        answer : 0
    },
    {
        params: si.QueryParameters.Valence,
        question : "What mouthfeel would you like?",
        minTextValue : "Sharp",
        maxTextValue : "Round",
        answer : 0
    },
    {
        params: si.QueryParameters.Valence,
        question : "How long would you like to boil for?",
        minTextValue : "0 min",
        maxTextValue : "120 min",
        answer : 0
    },
    {
        params: si.QueryParameters.Valence,
        question : "How strong are the beer goggles on this one??",
        minTextValue : "Weak",
        maxTextValue : "Strong",
        answer : 0
    }
]

export const mcqQuestions : Array<MCQuestion> = [
    {
        params: si.QueryParameters.Valence,
        question : "Choose your brewer",
        options: 6,
        answer : ""
    },
    {
        params: si.QueryParameters.Valence,
        question : "Where is you Nectaron brew savoured?",
        options: 4,
        answer : ""
    },
    {
        params: si.QueryParameters.Valence,
        question : "Choose your drinking buddy",
        options: 6,
        answer : ""
    },
    {
        params: si.QueryParameters.Valence,
        question : "Perfect pairing?",
        options: 6,
        answer : ""
    },
    {
        params: si.QueryParameters.Valence,
        question : "Choose your vessel",
        options: 6,
        answer : ""
    }
]

export const qfQuestions : Array<QuickFireQuestion> = [
    {
        params: si.QueryParameters.Valence,
        question: "Pineapple belongs on pizza?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "British version of The Office is better than the American?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "New Zealand invented the pavlova?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Do you remember Ben Lummis?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Rollerblading is cooler than roller skating?",
        answered : false,
        answer: false,
    },
    {
        params: si.QueryParameters.Valence,
        question: "Do you enjoy your own farts?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Wipe from front to back over back to front?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Take your shoes off in the house?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "You should always finish your plate?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Never kiss on a first date?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "BK is better than McDonald's?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Kevin Hart is funnier than Dave Chappelle?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "An eye for an eye?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Who Wants to Be a Millionaire is better than The Chase?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "It’s OK to park in a disabled spot if you’ll “be quick”?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Gingers have no soul?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Freedom doesn’t exist?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "The Big Bang Theory is better than Modern Family?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Marijuana should be legal?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Apple is better than Samsung?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Biggie & 2Pac are still alive?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Macaulay Culkin is not telling the truth?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "In a marriage, everything becomes 50% off?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Jesus is an effective form of contraceptive?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Last GoT episode was horseshit?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Is the Earth flat?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "You should clap along to the Friends intro?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "The Rock is greater than Stone Cold?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Street Fighter over Tekken?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Socks and sandals are only for school kids?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Pants shouldn’t ride higher than your belly button?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Front door over back door?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "East Coast over West Coast?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Mountains over lakes?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Aliens exist?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Vaccines cause Autism?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "The Big Bang did not create Earth?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Mona Lisa is overrated?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Paper straws are better than plastic straws?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "I’ll have the usual?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Beer in a can over a bottle?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Ketchup should be left in the fridge?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Hazys over lagers?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "German beer over American beer?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "You wash your legs in the shower?",
        answered : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Brew bar over micro pub?",
        answered : false,
        answer: false
    },
]