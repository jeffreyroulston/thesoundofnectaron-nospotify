import {QueryParameters} from "./spotify-interface";
import {el} from "./ui";

export type QueryParameter = {value: number, include: boolean};

export enum QuestionType {
    // as there are three different question types, we can do a sort of template for question types
    Slider,
    MultiChoice,
    QuickFire
}

export interface MCAnswer {
    value : string,
    asset : string
}

// export class Question {
//     public questionType: QuestionType;
//     public params : QueryParameters;
//     public question : string;
//     public el : string = "";

//     constructor(qt : QuestionType, p : QueryParameters, q : string) {
//         this.questionType = qt;
//         this.params = p;
//         this.question = q;
//     }

//     show() {}
// }

// export class SliderQuestion extends Question {
//     private min : number = 0;
//     private max : number = 0;
//     public answer : number = 0;
//     public el : string = "#slider-q";

//     constructor(p : QueryParameters, q : string, min : number, max: number) {
//         super(QuestionType.Slider, p, q);
//         this.min = min;
//         this.max = max;

//         // set initial values
//         var initial = (this.max - this.min)/2;;
//         this.sliderValue = initial;
//         this.sliderPreviousValue = initial;
//     }

//     public init() {
//         // set slider values
//         this.sliderEl.min = this.min.toString();
//         this.sliderEl.max = this.max.toString();
//     }

//     reset() {}

//     sliderChange(e : any) {
//         // get the width and the value of the slider 
//         this.sliderWidth = e.srcElement.clientWidth;
//         this.sliderValue = e.srcElement.value;

//         // get the next position of the arrow
//         // move the triangle to match the position of the slider thumb
//         this.sliderThumb.style.left = (((this.sliderValue - this.min) / (this.max - this.min) * (this.sliderWidth)) - this.sliderThumb.getBoundingClientRect().width/2).toString() + "px"

//         // change scale of the fruit

//     }
// }

// export class MCQuestion extends Question {
//     public options : MCAnswer [] = [];
//     public answer : MCAnswer = {value : "", asset : "string"}
// }

// export class QuickFireQuestion extends Question {
//     public answer : boolean = false;
// }

export interface Question {
    round : number;
    type: QuestionType;
    params: QueryParameters;
    question : string;
}

export interface SliderQuestion extends Question {
    minValue : number;
    maxValue : number;
    answer : number;
}

// export interface MCQuestion extends Question {
//     options : MCAnswer [];
//     answer: MCAnswer;
// }

// export interface QuickFireQuestion extends Question {
//     answer : boolean;
// }

// export interface MCAnswer {
//     value : string,
//     asset : string
// }

// export function createSliderQuestion(params: QueryParameters, question : string, minValue : number, maxValue : number) {
//     var q : SliderQuestion = {
//         type : QuestionType.Slider,
//         params : params,
//         question : question,
//         minValue : minValue,
//         maxValue : maxValue,
//         answer : 0
//     }

//     return q;
// }