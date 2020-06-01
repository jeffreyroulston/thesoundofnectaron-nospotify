// this can all be subject to change

export type QueryParameter = {value: number, include: boolean};

export enum QuestionType {
    // as there are three different question types, we can do a sort of template for question types
    Slider,
    MultiChoice
}

export interface Question {
    type: QuestionType;
    params: QuestionParams;
    parameter: string;
    answer: QueryParameter | undefined;
}

export interface QuestionParams {

}

export interface SliderQuestionParams extends QuestionParams {

}

export interface MultiChoiceQuestionParams extends QuestionParams {

}