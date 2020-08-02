import {QueryParameters} from "./spotify-interface";
import {Question, QuestionType, QueryParameter, createSliderQuestion} from "./questions";

var colours = {
    default : "#FCF1DB",
    red : "#FF200"
}

export enum PageType {
    Login,
    RoundName,
    Question
}

export interface Page {
    assets : string[];
    pageType : PageType,
    question : Question | undefined,
    bgColour : string,
}


export var allPages : Page[] = [
    {
        assets : [],
        pageType : PageType.Login,
        question : undefined,
        bgColour : colours.default,
        
    },
    {
        assets : [],
        pageType : PageType.RoundName,
        question : undefined,
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
        bgColour : colours.default,
        
    }
]
