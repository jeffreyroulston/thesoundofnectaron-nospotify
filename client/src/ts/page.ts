// import {QueryParameters} from "./spotify-interface";
// import {Question, SliderQuestion, MCQuestion, QuickFireQuestion} from "./questions";

// var colours = {
//     beige : "#FCF1DB",
//     red : "#FF2000"
// }

// export enum PageType {
//     Login,
//     RoundName,
//     Question
// }

// export class Page {
//     pageType : PageType

//     constructor() {}
// }


// export interface Page {
//     assets : string[];
//     pageType : PageType,
//     question : Question | undefined,
//     pageElement : string,
//     bgColour : string,
// }

// export var allPages : Page[] = [
//     {
//         assets : [],
//         pageType : PageType.Login,
//         question : undefined,
//         pageElement : "#login",
//         bgColour : colours.beige,
        
//     },
//     {
//         assets : [],
//         pageType : PageType.RoundName,
//         question : undefined,
//         pageElement : "#roundName",
//         bgColour : colours.red,
        
//     },
//     {
//         assets : [],
//         pageType : PageType.Question,
//         question : createSliderQuestion(
//             QueryParameters.Valence,
//             "How bitter would you like your brew?",
//             0,
//             100
//         ),
//         pageElement : "#slider-q",
//         bgColour : colours.beige,
        
//     }
// ]
