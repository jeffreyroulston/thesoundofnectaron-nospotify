import {Question, QuestionType} from "./questions";
import App from "./app";

export default class UI {
    private app : App;
    private totalQuestions = 3;
    private currentQuestion = 0;

    constructor(app: App) {
        this.app = app;
        this.init();
    }

    private init() {

        var forms = this.getElements("form");
        console.log(forms);
        // for (var i=0; i<forms.length; i++) {
        //     forms[i].addEventListener("submit", this.onFormSubmit.bind(this))
        // }

        // // show the first question
        // show("#q" + this.currentQuestion.toString());

        // this.getDisplayData();
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

    private getElements(e: string) {
        return document.querySelectorAll(e);
    }

    private getElement(e: string) {
        return document.querySelector(e);
    }
}
