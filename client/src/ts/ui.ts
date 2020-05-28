import {Question, QuestionType} from "./questions";
import App from "./app";
// import {TweenLite} from "gsap"

export default class UI {
    private app : App;
    private totalQuestions = 3;
    private currentQuestion = 1;

    constructor(app: App) {
        this.app = app;
        this.init();
    }

    private init() {
        // bind start button
        var startBtn = this.getElement("startBtn");
        startBtn?.addEventListener("click", this.login.bind(this))

        // bind forms
        var forms = this.getElements("form");
        for (var i=0; i<forms.length; i++) {
            forms[i].addEventListener("submit", this.onFormSubmit.bind(this))
        }
    }

    public login() {
        this.app.login();
    }

    public showLoggedIn(): void {
        console.log("show logged in");
        this.hide("login");
        this.show("loggedIn");
        // const loginElement = document.getElementById("login");
        // if (loginElement != null) {
        //     loginElement.style.display = "none";
        // }

        // const loggedInElement = document.getElementById("loggedin");
        // if (loggedInElement != null) {
        //     loggedInElement.style.display = "block";
        // }

        // // show the first question
        this.showCurrentQuestion();
    }

    
    public ShowUserData(imageURL: string, displayName: string): void {

    }
    
    // here we will activate and populate one of three different html question templates depending on question type
    // once the answer is chosen, we use that callback to pass the selection back up
    public showQuestion(question: Question, callback: (type: QuestionType, selection: number) => void): void {

    }

    private showCurrentQuestion() {
        this.show("q" + this.currentQuestion.toString());
    }

    private onFormSubmit(e : any) {
        console.log("form submitted", e);
    }

    private getElements(e: string) {
        return document.querySelectorAll(e);
    }

    private getElement(e: string) : HTMLElement | null {
        return document.getElementById(e);
    }

    private show(e: string, d: number = 0) {
        // var t = TweenLite.fromTo(e, 0.25, {y: 10}, {y: 0, alpha:1, display: "block", delay: d});
        var el = this.getElement(e);
        console.log("show", e, el);

        if (el) {
            el.style.display = "block";
        }
    }

    private hide(e: string) {
        var el = this.getElement(e);
        console.log("hide", e, el);
        if (el) {
            el.style.display = "none";
        }
    }
}
