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

    // this is horrible, fix it
    private currentQuestion : any = undefined;

    // SLIDER VARIABLES
    private sliderArrowEl = el("#slider-thumb");
    private sliderTopFruitEl = el(".fruit-top img");
    private sliderBottomFruitEl = el(".fruit-bottom img");
    private sliderWidth = 0;
    private sliderValue = 0;
    private sliderPreviousValue = 0;

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
        el("#sliderInput").addEventListener("input",this.sliderChange.bind(this));
        // el("#sliderInput").addEventListener("change", this.sliderInput)
    }

    private setCurrentPage() {
        console.log(this.currentPage);

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
        // sets background colour based on page
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

        this.currentQuestion = q;

    }

    private sliderChange(e : any) {
        if (!this.currentPage.question) return;

        // get the width and the value of the slider 
        this.sliderWidth = e.srcElement.clientWidth;
        this.sliderValue = e.srcElement.value;

        // get the next position of the arrow
        // move the triangle to match the position of the slider thumb
        this.sliderArrowEl.style.left = (((this.sliderValue - this.currentQuestion.minValue) / (this.currentQuestion.maxValue - this.currentQuestion.minValue) * (this.sliderWidth)) - this.sliderArrowEl.getBoundingClientRect().width/2).toString() + "px"

        this.sliderFruitScaleChange()
    }

    private sliderFruitScaleChange() {
        console.log(this.sliderPreviousValue, this.sliderValue);

        if (this.sliderValue < ((this.currentQuestion.maxValue - this.currentQuestion.minValue) / 2) ) {
            // bottom fruit
            this.sliderBottomFruitEl.style.width = px(this.sliderBottomFruitEl.getBoundingClientRect().width + (this.sliderPreviousValue < this.sliderValue ? -2 : 2));
            this.sliderBottomFruitEl.style.top = px(parseInt(getComputedStyle(this.sliderBottomFruitEl).top.replace(/[^\d-]/g, "")) + (this.sliderPreviousValue < this.sliderValue ? 1 : -1))
        } else {
            // top fruit
            this.sliderTopFruitEl.style.width = px(this.sliderTopFruitEl.getBoundingClientRect().width + (this.sliderPreviousValue < this.sliderValue ? 2 : -2))
            this.sliderTopFruitEl.style.bottom = px(parseInt(getComputedStyle(this.sliderTopFruitEl).bottom.replace(/[^\d-]/g, "")) + (this.sliderPreviousValue < this.sliderValue ? -1 : 1))
        }

        this.sliderPreviousValue = this.sliderValue;  
    }

    private scaleFruit(el: HTMLElement, increment : number) {
        el.style.width = (el.getBoundingClientRect().width + increment).toString() + "px";
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

function px (n : number) {
    return n.toString() + "px";
}
