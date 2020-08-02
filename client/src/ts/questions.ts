import {QueryParameters} from "./spotify-interface";

export type QueryParameter = {value: number, include: boolean};

export enum QuestionType {
    // as there are three different question types, we can do a sort of template for question types
    Slider,
    MultiChoice,
    QuickFire
}

export interface Question {
    type: QuestionType;
    params: QueryParameters;
    question : string;

    // include non spotify query related parameters
}

export interface SliderQuestion extends Question {
    minValue : number;
    maxValue : number;
    answer : number;
}

export interface MCQuestion extends Question {
    options : MCAnswer [];
    answer: MCAnswer;
}

export interface QuickFireQuestion extends Question {
    answer : boolean;
}

export interface MCAnswer {
    value : string,
    asset : string
}

export function createSliderQuestion(params: QueryParameters, question : string, minValue : number, maxValue : number) {
    var q : SliderQuestion = {
        type : QuestionType.Slider,
        params : params,
        question : question,
        minValue : minValue,
        maxValue : maxValue,
        answer : 0
    }

    return q;
}