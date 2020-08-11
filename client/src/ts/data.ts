import * as q from "./questions";
import * as si from "./spotify-interface";

export const COLOURS = {
    beige : "#FCF1DB",
    red : "#FF2000",
    purple : "#88009D",
    blue : "#00C1F5"
}

export const ROUNDS : q.QuestionRound[] = [
    {
        round: 1,
        color: COLOURS.red,
        text : "All about the science of brewing. It's the details and the process - the part the brewers will really sing their teeth into. What's the brew style? What flavours are you heroing? Is it light or dark? These slider centric questions will be accompanied by 5 hero images that change based on the answer - all in the style of Nectaron 'visual collision,' half fruit - half something else." 
    },
    {
        round : 2,
        color: COLOURS.purple,
        text: "Now we've covered the basics, it's time to get experimental. Section Two is where we see mastery and mystery come into play. This section is all about imbuing their brew with personality. These questions will come to life visually through an 8 bit style. This will resonate with brewers as it borros from the nostalgia of retro gaming - something that brewers love."
    },
    {
        round: 3,
        color: COLOURS.blue,
        text: "Some text"
    }
]

export var QUESTIONS : Array<q.SliderQuestion | q.MCQuestion> = [
    {
        round:1,
        type: q.QuestionType.Slider,
        params: si.QueryParameters.Valence,
        question : "How bitter would you like your brew?",
        minValue : 0,
        maxValue : 100,
        answer : 0
    },
    // {
    //     round: 1,
    //     type: q.QuestionType.Slider,
    //     params: si.QueryParameters.Valence,
    //     question : "How tangy would you like your brew?",
    //     minValue : 0,
    //     maxValue : 100,
    //     answer : 0
    // },
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
            }
        ],
        answer : ""
    }
]