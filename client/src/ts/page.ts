import {QueryParameters} from "./spotify-interface";
import {SliderQuestion, MCQuestion, QuickFireQuestion, createSliderQuestion} from "./questions";

var colours = {
    default : "#FCF1DB",
    red : "#FF2000"
}

export enum PageType {
    Login,
    RoundName,
    Question
}

export interface Page {
    assets : string[];
    pageType : PageType,
    question : SliderQuestion | MCQuestion | QuickFireQuestion | undefined,
    pageElement : string,
    bgColour : string,
}


export var allPages : Page[] = [
    {
        assets : [],
        pageType : PageType.Login,
        question : undefined,
        pageElement : "#login",
        bgColour : colours.default,
        
    },
    {
        assets : [],
        pageType : PageType.RoundName,
        question : undefined,
        pageElement : "#roundName",
        bgColour : colours.red,
        
    },
    {
        assets : [],
        pageType : PageType.Question,
        question : createSliderQuestion(
            QueryParameters.Valence,
            "How bitter would you like your brew?",
            0,
            100
        ),
        pageElement : "#slider-q", // move into question parameter
        bgColour : colours.default,
        
    }
]
