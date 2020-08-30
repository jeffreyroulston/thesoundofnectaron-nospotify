import * as si from "./spotify-interface";
import { Colors } from "three";
import * as THREE from 'three';

export const COLOURS = {
    beige : "#FCF1DB",
    red : "#FF2000",
    purple : "#88009D",
    blue : "#00C1F5",
    yellow: "#FFE700"
}

export const COLOURS_THREE : { [id: string] : THREE.Color } = {
    "#FCF1DB" : new THREE.Color(0xFCF1DB),
    "#FF2000" : new THREE.Color(0xFF2000),
    "#88009D" : new THREE.Color(0x88009D),
    "#00C1F5" : new THREE.Color(0x00C1F5),
    "#FFE700" : new THREE.Color(0xFFE700)
}

export const CONTRAST : { [id: string] : string } = {
    "#FCF1DB" : COLOURS.purple,
    "#FF2000" : COLOURS.purple,
    "#88009D" : COLOURS.red,
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
    answer : string;
}

export interface QuickFireQuestion extends Question {
    asked : boolean,
    answer : boolean
}

export const ROUNDS : QuestionRound[] = [
    {
        round: 1,
        color: COLOURS.red,
        numberColor: COLOURS.yellow,
        btnTextColor : COLOURS.red,
        btnPaddingColor : COLOURS.purple,
        text : "All about the science of brewing. It's the details and the process - the part the brewers will really sing their teeth into. What's the brew style? What flavours are you heroing? Is it light or dark? These slider centric questions will be accompanied by 5 hero images that change based on the answer - all in the style of Nectaron 'visual collision,' half fruit - half something else." 
    },
    {
        round : 2,
        color: COLOURS.purple,
        numberColor: COLOURS.yellow,
        btnTextColor : COLOURS.purple,
        btnPaddingColor : COLOURS.red,
        text: "Now we've covered the basics, it's time to get experimental. Section Two is where we see mastery and mystery come into play. This section is all about imbuing their brew with personality. These questions will come to life visually through an 8 bit style. This will resonate with brewers as it borros from the nostalgia of retro gaming - something that brewers love."
    },
    {
        round: 3,
        color: COLOURS.blue,
        numberColor: COLOURS.purple,
        btnTextColor : COLOURS.red,
        btnPaddingColor : COLOURS.purple,
        text: "Section Three is all about instinct. Every question is phrased as a statement - controversial by design. Brewers can answer either yes or no to these statements. To elicit their sharpest instincts, they’ll have 20 seconds to get through 15 questions in the climax of the experience."
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
        answer : ""
    },
    {
        params: si.QueryParameters.Valence,
        question : "Where is this best enjoyed?",
        answer : ""
    },
    {
        params: si.QueryParameters.Valence,
        question : "Choose your drinking buddy",
        answer : ""
    },
    {
        params: si.QueryParameters.Valence,
        question : "Perfect pairing?",
        answer : ""
    },
    {
        params: si.QueryParameters.Valence,
        question : "Choose your vessel",
        answer : ""
    }
]

export const qfQuestions : Array<QuickFireQuestion> = [
    {
        params: si.QueryParameters.Valence,
        question: "I’ll have the usual?",
        asked : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Beer in a can over a bottle?",
        asked : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Ketchup should be kept in the fridge?",
        asked : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Hazys over Lagers?",
        asked : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Every Die Hard movie is good?",
        asked : false,
        answer: false,
    },
    {
        params: si.QueryParameters.Valence,
        question: "German beer over American beer?",
        asked : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "You wash your legs in the shower?",
        asked : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Six pack over single serve?",
        asked : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "There was enough room for both Jack and Rose on the door?",
        asked : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "Brew bars over micro pub?",
        asked : false,
        answer: false
    },
    {
        params: si.QueryParameters.Valence,
        question: "The Karate Kid is the bad guy in the Karate Kid?",
        asked : false,
        answer: false
    }
]