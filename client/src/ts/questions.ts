// this can all be subject to change

export enum QuestionType {
    // as there are three different question types, we can do a sort of template for question types
}

export interface Question {
    type: QuestionType;
    params: QuestionParams;
}

export interface QuestionParams {

}

export interface SliderQuestion extends QuestionParams {

}