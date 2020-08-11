import {QueryParameters} from "./spotify-interface";
export type QueryParameter = {value: number, include: boolean};

export enum QuestionType {
    Slider,
    MultiChoice,
    QuickFire
}

export interface QuestionRound {
    round : number;
    color: string;
    numberColor: string,
    text : string;
}

export interface MCAnswer {
    value : string,
    asset : string
}

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

export interface MCQuestion extends Question {
    options : MCAnswer[];
    answer : string;
}

export interface QuickFireQuestion extends Question {
    answer : boolean
}