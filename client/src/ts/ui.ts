import * as si from "./spotify-interface";
import {Question, QuestionType, QueryParameter} from "./questions";
import {TweenLite} from "gsap"

var qDefault = function() { return { value: 0, include: false } };


export default class UI {
    private totalQuestions = 3;
    private currentQuestion = 1;

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
      
    private answerMap : { [q: string]: any} = {
        "q1" : {
            type: QuestionType.MultiChoice,
            feature : "energy",
            values : {
            "Lager" : 2,
            "APA" : 6,
            "IPA" : 13,
            "Stout" : 30
            }
        },
        "q2" : {
            type: QuestionType.Slider,
            feature : "valence",
        },
        "q3" : {
            type : QuestionType.Slider,
            feature : "loudness",
        }
    }

    public OnLoginPressed = () => {};
    public OnQuestionAnswered: {(totalQuestions: number, questionNumber: number, question: Question): void}[] = [];

    constructor() {
        this.init();
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

    private init() {
        // bind start button
        var startBtn = this.querySelector("#startBtn");
        startBtn?.addEventListener("click", this.Login.bind(this))

        // bind forms
        var forms = this.getElements("form");
        for (var i=0; i<forms.length; i++) {
            forms[i].addEventListener("submit", this.onFormSubmit.bind(this), true)
        }
    }

    public Login() {
        this.OnLoginPressed();
    }

    public showLoggedIn(): void {
        // hide login screen
        this.hide("#login");
        this.show("#main");

        // // show the first question
        this.showCurrentQuestion();
    }

    
    public ShowUserData(imageURL: string, displayName: string): void {

    }
    
    // here we will activate and populate one of three different html question templates depending on question type
    // once the answer is chosen, we use that callback to pass the selection back up
    public showQuestion(question: Question): void {

    }

    private showCurrentQuestion() {
        // hide previous question and show current question
        if (this.currentQuestion > 1) {
            this.hide("#q" + (this.currentQuestion - 1).toString());
        }
        this.show("#q" + this.currentQuestion.toString());
    }

    private onFormSubmit(e : any) {
        e.preventDefault();
        var map = this.answerMap[e.target.id];
        var value = 0;

        // switch based on map
        switch(map.type) {
            case QuestionType.MultiChoice:
                value = map.values[e.submitter.value];
                break;

            case QuestionType.Slider:
                var slider = this.querySelector("input[type=range]", e.target);
                value = slider? parseInt(slider.value) : 0;
                break;
            default:
        }

        this.queryParameters[map.feature].value += value;
        this.queryParameters[map.feature].include = true;
        console.log(this.queryParameters);

        if (this.currentQuestion < this.totalQuestions) {
            // show next question
            this.currentQuestion++;
            this.showCurrentQuestion();
        } else {
            // get recommendations
            //this.app.GetRecommendations();
        }
    }

    private getElements(e: string) {
        return document.querySelectorAll(e);
    }

    private querySelector(query: string, el : HTMLElement | null = null) {
        return el ? el.querySelector<HTMLInputElement>(query) : document.querySelector<HTMLInputElement>(query);
    }

    private show(e: string, d: number = 0) {
        var t = TweenLite.fromTo(e, 0.25, {y: 10}, {y: 0, alpha:1, display: "block", delay: d});
        var el = this.querySelector(e);
        if (el) el.style.display = "block";
    }

    private hide(e: string) {
        var el = this.querySelector(e);
        console.log("hide", e, el);
        if (el) el.style.display = "none";
    }
}