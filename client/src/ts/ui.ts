import * as si from "./spotify-interface";
import {Question, QuestionType, QueryParameter, SliderQuestion} from "./questions";
// import Page from "./page";
import {Page, PageType, allPages} from "./page";
import {TweenLite} from "gsap"

var qDefault = function() { return { value: 0, include: false } };


export default class UI {
    // PRIVATE VARIABLES
    private pages = allPages;
    private currentPage = this.pages[0];
    private previousPage : Page | undefined = undefined;
    private currentPageIdx = 0;
    private recommendations: si.Track[] | undefined = [];
    private queryParameters: {[key: string]: QueryParameter }  = {
        "acousticness" : qDefault(),
        "danceability" : qDefault(),
        "energy" : qDefault(),
        "instrumentalness" : qDefault(),
        "liveness" : qDefault(),
        "loudness" : qDefault(),
        "speechiness" : qDefault(),
        "valence" : qDefault(),
        "tempo" : qDefault()
    }
    
    // PUBLIC VARIABLES
    public OnLoginPressed = () => {};
    public OnQuestionAnswered: {(totalQuestions: number, questionNumber: number, question: Question): void}[] = [];

    constructor() {
        this.init();
    }
    
    private init() {
        this.setCurrentPage();

        // set button bindings
        el("#startBtn").addEventListener("click", this.Login.bind(this));
        el(".next").addEventListener("click", this.getNextPage.bind(this));
    }

    private setCurrentPage() {
        // console.log(this.currentPage);

        // hide current page
        if (this.previousPage) {
            // el(this.previousPage.pageElement).classList.toggle("active");
            el(this.previousPage.pageElement).style.display = "none";
        }

        // show the next page
        // el(this.currentPage.pageElement).classList.toggle("active");
        el(this.currentPage.pageElement).style.display = "block";

        // set question bits
        if (this.currentPage.pageType == PageType.Question) {
            this.setQuestion();
        }

        this.setBG();

    }

    private getNextPage() {
        this.currentPageIdx++;
        this.currentPage = this.pages[this.currentPageIdx];
        this.previousPage = this.pages[this.currentPageIdx-1];
        this.setCurrentPage();
    }

    private setBG() {
        el("body").style.backgroundColor = this.currentPage.bgColour;
    }

    private setQuestion() {
        if (!this.currentPage.question) return;
        var q = this.currentPage.question;
        var e = this.currentPage.pageElement;

        // set question copy
        el(e + " .question p").innerHTML = q.question;

        switch (q.type) {
            case QuestionType.Slider:
                // set slider parameters
                q = <SliderQuestion>q;
                var slider = <HTMLInputElement>document.querySelector("#sliderInput");
                slider.min = q.minValue.toString();
                slider.max = q.maxValue.toString();
                break;

            case QuestionType.MultiChoice:
                break;

            case QuestionType.QuickFire:
                break;
        }

    }

    // CALLBACK FROM APP
    public loginSuccessful() {
        console.log("login successful");
        this.getNextPage();
    }

    public OnUserData(type: si.DataType, data: si.Data): void {

        switch(type) {
            case si.DataType.UserProfile:
                const profile: si.UserProfile = (data as si.UserProfile);
                if (profile.images != null && profile.DisplayName != null) {
                    this.ShowUserData(profile.images[0], profile.DisplayName);
                }

                break;

            case si.DataType.Recommendations:
                this.recommendations = (data as si.Track[]);
                break;

            case si.DataType.TopArtists:
                // this.artists = (data as si.Artist[]);
                break;
        }
    }


    public Login() {
        this.OnLoginPressed();
    }
    
    public ShowUserData(imageURL: string, displayName: string): void {
    }
    
    // here we will activate and populate one of three different html question templates depending on question type
    // once the answer is chosen, we use that callback to pass the selection back up
    public showQuestion(question: Question): void {
    }

    private showCurrentQuestion() {
    }

}

function el(e: string) {
    return <HTMLElement>document.querySelector(e);
}

function querySelector(query: string, el : HTMLElement | null = null) {
    return el ? el.querySelector<HTMLInputElement>(query) : document.querySelector<HTMLInputElement>(query);
}
