import * as q from "./questions";
import * as si from "./spotify-interface";
import { Colors } from "three";

export const COLOURS = {
    beige : "#FCF1DB",
    red : "#FF2000",
    purple : "#88009D",
    blue : "#00C1F5",
    yellow: "#FFE700"
}

export const CONTRAST : { [id: string] : string } = {
    "#FCF1DB" : COLOURS.purple,
    "#FF2000" : COLOURS.purple,
    "#88009D" : COLOURS.red,
    "#00C1F5" : COLOURS.yellow,
    "#FFE700" : COLOURS.purple
}

export const ROUNDS : q.QuestionRound[] = [
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

export var QUESTIONS : Array<q.SliderQuestion | q.MCQuestion | q.QuickFireQuestion> = [
    {
        round:1,
        type: q.QuestionType.Slider,
        params: si.QueryParameters.Valence,
        question : "What brew style are you after?",
        minValue : 0,
        maxValue : 100,
        minTextValue : "Light",
        maxTextValue : "Dark",
        answer : 0
    },
    {
        round:1,
        type: q.QuestionType.Slider,
        params: si.QueryParameters.Valence,
        question : "How bitter would you like your brew?",
        minValue : 0,
        maxValue : 100,
        minTextValue : "0 IBU",
        maxTextValue : "100 IBU",
        answer : 0
    },
    {
        round:1,
        type: q.QuestionType.Slider,
        params: si.QueryParameters.Valence,
        question : "What mouthfeel would you like?",
        minValue : 0,
        maxValue : 100,
        minTextValue : "Light",
        maxTextValue : "Heavy",
        answer : 0
    },
    {
        round:1,
        type: q.QuestionType.Slider,
        params: si.QueryParameters.Valence,
        question : "How long would you like to boil for?",
        minValue : 0,
        maxValue : 100,
        minTextValue : "0 min",
        maxTextValue : "120 min",
        answer : 0
    },
    {
        round:1,
        type: q.QuestionType.Slider,
        params: si.QueryParameters.Valence,
        question : "How strong are the beer goggles on this one?",
        minValue : 0,
        maxValue : 100,
        minTextValue : "Weak",
        maxTextValue : "Strong",
        answer : 0
    },
    {
        round: 2,
        type: q.QuestionType.MultiChoice,
        params: si.QueryParameters.Valence,
        question : "Choose your brewer",
        options : [
            {
                value : "dino",
                asset : ""
            },
            {
                value : "dragon",
                asset : ""
            },
            {
                value : "unicorn",
                asset : ""
            },
            {
                value : "snake",
                asset : ""
            },
            {
                value : "person",
                asset : ""
            },
        ],
        answer : ""
    },
    {
        round: 2,
        type: q.QuestionType.MultiChoice,
        params: si.QueryParameters.Valence,
        question : "Where is this best enjoyed?",
        options : [
            {
                value : "scene1",
                asset : ""
            },
            {
                value : "scene2",
                asset : ""
            },
            {
                value : "scene3",
                asset : ""
            },
            {
                value : "scene4",
                asset : ""
            }
        ],
        answer : ""
    },
    {
        round: 2,
        type: q.QuestionType.MultiChoice,
        params: si.QueryParameters.Valence,
        question : "Choose your drinking buddy",
        options : [
            {
                value : "drinking-buddy-1",
                asset : ""
            },
            {
                value : "drinking-buddy-2",
                asset : ""
            }
        ],
        answer : ""
    },
    {
        round: 2,
        type: q.QuestionType.MultiChoice,
        params: si.QueryParameters.Valence,
        question : "Perfect pairing?",
        options : [
            {
                value : "pairing-sushi",
                asset : ""
            },
            {
                value : "pairing-pizza",
                asset : ""
            },
            {
                value : "pairing-avo",
                asset : ""
            }
        ],
        answer : ""
    },
    {
        round: 2,
        type: q.QuestionType.MultiChoice,
        params: si.QueryParameters.Valence,
        question : "Choose your vessel",
        options : [
            {
                value : "vessel-bottle",
                asset : ""
            },
            {
                value : "vessel-can",
                asset : ""
            },
            {
                value : "vessel-glass",
                asset : ""
            },
            {
                value : "vessel-tumbler",
                asset : ""
            }
        ],
        answer : ""
    },
    {
        round: 3,
        type: q.QuestionType.QuickFire,
        params: si.QueryParameters.Valence,
        question: "I’ll have the usual?",
        answer: false
    },
    {
        round: 3,
        type: q.QuestionType.QuickFire,
        params: si.QueryParameters.Valence,
        question: "Beer in a can over a bottle?",
        answer: false
    },
    {
        round: 3,
        type: q.QuestionType.QuickFire,
        params: si.QueryParameters.Valence,
        question: "Ketchup should be kept in the fridge?",
        answer: false
    },
    {
        round: 3,
        type: q.QuestionType.QuickFire,
        params: si.QueryParameters.Valence,
        question: "Hazys over Lagers?",
        answer: false
    },
    {
        round: 3,
        type: q.QuestionType.QuickFire,
        params: si.QueryParameters.Valence,
        question: "Every Die Hard movie is good?",
        answer: false,
    },
    {
        round: 3,
        type: q.QuestionType.QuickFire,
        params: si.QueryParameters.Valence,
        question: "German beer over American beer?",
        answer: false
    },
    {
        round: 3,
        type: q.QuestionType.QuickFire,
        params: si.QueryParameters.Valence,
        question: "You wash your legs in the shower?",
        answer: false
    },
    {
        round: 3,
        type: q.QuestionType.QuickFire,
        params: si.QueryParameters.Valence,
        question: "Six pack over single serve?",
        answer: false
    },
    {
        round: 3,
        type: q.QuestionType.QuickFire,
        params: si.QueryParameters.Valence,
        question: "There was enough room for both Jack and Rose on the door?",
        answer: false
    },
    {
        round: 3,
        type: q.QuestionType.QuickFire,
        params: si.QueryParameters.Valence,
        question: "Brew bars over micro pub?",
        answer: false
    },
    {
        round: 3,
        type: q.QuestionType.QuickFire,
        params: si.QueryParameters.Valence,
        question: "The Karate Kid is the bad guy in the Karate Kid?",
        answer: false
    }
]