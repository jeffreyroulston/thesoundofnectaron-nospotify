import * as si from "./spotify-interface";
import * as q from "./questions";
import * as data from "./data";
import Slider from "./slider";
import MCQ from "./mcq";
import {el} from "./helpers";
import {TweenMax} from "gsap"
// import Graphics from "./graphics";
// import * as THREE from 'three';

var qDefault = function() { return { value: 0, include: false } };

enum PageType {
    Login,
    RoundName,
    Question
}

export default class UI {
    private slider : Slider;
    private mcq : MCQ;

    private currentPage : PageType = PageType.Login;
    private currentRoundIdx : number = 0;
    private currentQuestionIdx : number = -1;

    private recommendations: si.Track[] | undefined = [];
    private queryParameters: {[key: string]: q.QueryParameter }  = {
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
    public OnQuestionAnswered: {(totalQuestions: number, questionNumber: number, question: q.Question): void}[] = [];

    constructor() {
        this.slider= new Slider(this, "#slider-q");
        this.mcq = new MCQ(this, "#mc-q");

        // set button bindings
        el("#startBtn").addEventListener("click", this.Login.bind(this));
        el(".next").addEventListener("click", this.next.bind(this));
        
        //  this.showLogin();
        this.showRoundName();
        // this.showQuestion();
    }

    private setBG(color : string) {
        // sets background colour based on page
        var e = el("#color-wipe");
        var origins = ["top", "bottom", "right"];
        var origin = origins[Math.floor(Math.random() * origins.length)];

        // console.log(origin);
        
        el("body").style.backgroundColor = color;
        if (origin == "top" || origin == "bottom") {
            TweenMax.to(e, 0.5, {height: 0, transformOrigin:origin, ease:"linear", onComplete: function() {
                e.style.backgroundColor = color;
                e.style.height = "100vh";
            }})
        } else {
            TweenMax.to(e, 0.5, {width: 0, transformOrigin:origin, ease:"linear", onComplete: function() {
                e.style.backgroundColor = color;
                e.style.width = "100%";
            }})
        }
        
    }

    private showLogin() {
        this.setBG(data.COLOURS.beige);
        el("#login").style.display = "block";

        // bleed in the sound of
        TweenMax.from(".theSoundOf path", 0.75, {alpha:0, y:-50, scale:0, transformOrigin: "bottom", stagger: {each: 0.1, from:"random"}, delay:1});

        // bleed in nectaron
        TweenMax.from(".nectaron path, .nectaron polygon, .nectaron rect", 0.75, {alpha:0, y:50, scale:0, transformOrigin: "top", stagger: {each: 0.05, from:"random"}, delay:1});

        // show subheading and button
        TweenMax.from("#login .subheading, #login .btn", 0.5, {alpha:0, y:5, delay: 3.2});
    }

    private showRoundName() {
        this.currentPage = PageType.RoundName;
        this.currentRoundIdx++;
        var currentRound = data.ROUNDS[this.currentRoundIdx-1];

        // set the things
        this.setBG(currentRound.color);
        el("#round-name .description").innerHTML = currentRound.text;
        el("#round-name").style.display = "block";

        // bleed in round
        TweenMax.fromTo(".round path", 0.75, {alpha:0, y:-50, scale:0, transformOrigin: "bottom"}, {alpha:1, y:0, scale:1, stagger: {each: 0.1, from:"random"}});

        // swing in numbers
        TweenMax.fromTo("#round-name .numbers li:first-child", 0.5, {alpha:0, y:50}, {alpha:1, y:0, delay:0.4});
        TweenMax.fromTo("#round-name .numbers li:nth-child(" + (this.currentRoundIdx+1).toString() + ")", 0.5, {alpha:0, scale:0.5, y:-50, rotate:-120}, {alpha:1, scale:1, y:0, rotate:0, delay:0.5});

        // show the round name
        TweenMax.fromTo(".round-name-text li:nth-child(" + this.currentRoundIdx.toString() + ")", 0.75, {display:"block", alpha:0, x:-50}, {alpha:1, x:0, delay:1});

        // show the description box
        TweenMax.fromTo("#round-name .description, #round-name .btn", 0.6, {alpha:0, y:20}, {alpha:1, y:0, delay:1.1});
    }

    private showQuestion() { 
        console.log(this.currentQuestionIdx);
        this.currentQuestionIdx++;
        this.currentPage = PageType.Question;
        var currentQuestion = data.QUESTIONS[this.currentQuestionIdx];
        this.setBG(data.COLOURS.beige);

        switch(currentQuestion.type) {
            case q.QuestionType.Slider:
                this.slider.set(<q.SliderQuestion>currentQuestion);
                this.slider.show();
                break;
            case q.QuestionType.MultiChoice:
                this.mcq.set(<q.MCQuestion>currentQuestion);
                this.mcq.show()
        }
    }

    private next() {
        // hide current page
        // show next page
        switch (this.currentPage) {
            case PageType.Login:
                //hide button
                TweenMax.to("#login .subheading, #login .btn", 0.3, {alpha:0});
                
                // bleed out logo
                TweenMax.to("#login .bleed path, #login .bleed polygon, #login .bleed rect", 0.5, {alpha:0, y:50, scale:0, transformOrigin: "bottom", stagger: {each: 0.005, from:"random"}, delay:0.2});
                
                //hide login
                TweenMax.to("#login", 0, {display: "none", delay: 1, onComplete: this.showRoundName.bind(this)});
                break;
            
            case PageType.RoundName:
                //hide button
                TweenMax.to("#round-name .description, #round-name .btn, #round-name .numbers li", 0.5, {alpha:0, y:20});

                TweenMax.to(".round-name-text li", 0.5, {alpha:0, x:-50});

                // bleed out round
                TweenMax.to(".round path", 0.5, {alpha:0, y:-50, scale:0, transformOrigin: "bottom", stagger: {each: 0.1, from:"random"}, onComplete: this.showQuestion.bind(this)});
                break;
            
            case PageType.Question:
                var currentQuestion = data.QUESTIONS[this.currentQuestionIdx];
                if (this.currentQuestionIdx < data.QUESTIONS.length-1) {
                    // get next question
                    var nextQuestion = data.QUESTIONS[this.currentQuestionIdx+1];
                    // check if it's the same or a new round
                    if (currentQuestion.round < nextQuestion.round) {
                        this.showRoundName();
                    } else {
                        this.showQuestion();
                    }
                } else {
                    // the end!
                    console.log("the end has been reached");
                }
                break;
        }
    }

    public answerRetrieved(a : any) {
        data.QUESTIONS[this.currentQuestionIdx].answer = a;
        console.log(data.QUESTIONS[this.currentQuestionIdx]);
        this.next();
    }

    // CALLBACK FROM APP
    public loginSuccessful() {
        console.log("login successful");
        this.next();
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
    
}
