import * as si from "./spotify-interface";
import {Question, QuestionType, QueryParameter} from "./questions";
// import Page from "./page";
import {PageType, allPages} from "./page";
import {TweenLite} from "gsap"

var qDefault = function() { return { value: 0, include: false } };


export default class UI {
    // PRIVATE VARIABLES
    private pages = allPages;
    private currentPage = this.pages[0];
    // private container = el(".container");

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
        var startBtn = el("#startBtn");
        startBtn?.addEventListener("click", this.Login.bind(this))
    }

    private setCurrentPage() {
        console.log(this.currentPage);
        this.setBG();

    }

    private setBG() {
        el("body").style.backgroundColor = this.currentPage.bgColour;
    }

    // CALLBACK FROM APP
    public loginSuccessful() {
        console.log("login successful");
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
