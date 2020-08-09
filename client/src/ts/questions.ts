import {QueryParameters} from "./spotify-interface";
export type QueryParameter = {value: number, include: boolean};

export enum QuestionType {
    Slider,
    MultiChoice,
    QuickFire
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