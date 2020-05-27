import {Question, QuestionType} from "./questions";

export default class UI {
    constructor() {

    }

    public showLoggedIn(): void {
        const loginElement = document.getElementById("login");
        if (loginElement != null) {
            loginElement.style.display = "none";
        }

        const loggedInElement = document.getElementById("loggedin");
        if (loggedInElement != null) {
            loggedInElement.style.display = "block";
        }

        const questionElement = document.getElementById("q1");
        if (questionElement !== null) {
            questionElement.style.display = "block";
        }
    }

    
    public ShowUserData(imageURL: string, displayName: string): void {

    }
    
    // here we will activate and populate one of three different html question templates depending on question type
    // once the answer is chosen, we use that callback to pass the selection back up
    public showQuestion(question: Question, callback: (type: QuestionType, selection: number) => void): void {

    }
}
