import * as si from "./spotify-interface";
import * as data from "./data";
import Slider from "./slider-q";
import MCQ from "./mc-q";
import QuickFireQ from "./quickfire-q";
import {el} from "./helpers";
import {TweenMax, TimelineMax} from "gsap"
import App from "./app";
import * as anim from "./animator"

import * as d3 from "d3";

// import Graphics from "./graphics";
// import * as THREE from 'three';

var qDefault = function() { return { value: 0, include: false } };

enum PageType {
    Login,
    RoundName,
    Question,
    EndFrame
}

export default class UI {
    private app : App;

    private slider : Slider;
    private mcq : MCQ;
    private qfq : QuickFireQ;

    private logoLetters : HTMLElement[] = [];
    private currentPage : PageType = PageType.Login;

    private currentRoundIdx : number = 0;

    // private recommendations: si.Track[] | undefined = [];
    // private queryParameters: {[key: string]: si.QueryParameter }  = {
    //     "acousticness" : qDefault(),
    //     "danceability" : qDefault(),
    //     "energy" : qDefault(),
    //     "instrumentalness" : qDefault(),
    //     "liveness" : qDefault(),
    //     "loudness" : qDefault(),
    //     "speechiness" : qDefault(),
    //     "valence" : qDefault(),
    //     "tempo" : qDefault()
    // }
    
    // PUBLIC VARIABLES
    public OnLoginPressed = () => {};
    // public OnQuestionAnswered: {(totalQuestions: number, questionNumber: number, question: q.Question): void}[] = [];

    constructor(app : App) {
        // pass in the app to use for spotify interface
        this.app = app;

        // create the questions classes
        this.slider= new Slider(this, "#slider-q");
        this.mcq = new MCQ(this, "#mc-q");
        this.qfq = new QuickFireQ(this, "#quickfire-q");

        // check if it's fucking internet explorer
        // if (!Modernizr.svg) {
        //     console.log("it's internet fucking explorer")
        //   }

        // set button bindings
        // el("#startBtn").addEventListener("click", this.next.bind(this));
        el(".next-btn").addEventListener("click", this.next.bind(this));
        
        // set bindings to animation
        anim.landingPageOut.eventCallback("onComplete", this.showRoundName.bind(this))
        anim.roundPageOut.eventCallback("onComplete", this.showQuestion.bind(this))

        // kick it off
        this.showLanding();
    }

    private setBG(color : string) {
        // sets background colour based on page
        var e = el("#color-wipe");
        var origins = ["bottom", "right"];
        var origin = origins[Math.floor(Math.random() * origins.length)];

        // set logo colours - set it to the contrast of the background colour
        for(var i=0; i<this.logoLetters.length; i++) {
            this.logoLetters[i].style.fill = data.CONTRAST[color];
        }
        
        // set the background colour
        el("body").style.backgroundColor = color;

        // to do - why doesn't top and left work?
        // origin determines direction
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

    private showLanding() {
        anim.landingPageIn.play();
        // anim.fruitsIn.play();
    }

    private showRoundName() {
        // set current page to be a round
        this.currentPage = PageType.RoundName;

        // increment the current round
        this.currentRoundIdx++;
        var currentRound = data.ROUNDS[this.currentRoundIdx-1];

        // reset the cookie
        document.cookie = "showLanding"
        console.log(document.cookie);

        // if round 3, change the colour of zero
        if (this.currentRoundIdx == 3) {
            el("#round-name .numbers li:first-child path").style.stroke = data.COLOURS.purple;
        }

        // change the colour of the button
        el("#round-name .btn .orange-2").style.stroke = currentRound.btnTextColor;
        el("#round-name .btn .purple").style.fill = currentRound.btnPaddingColor;
        var elems = document.querySelectorAll("#round-name .btn .orange");
        for (var i=0; i<elems.length; i++) {
            let e = <HTMLElement>elems[i];
            e.style.fill = currentRound.btnTextColor;
        }
       
        // do the background
        this.setBG(currentRound.color);

        // play animation
        anim.roundPageIn.restart();

        // bring in round number
        TweenMax.fromTo("#round-name .numbers li:nth-child(" + (this.currentRoundIdx+1).toString() + ")", 0.5, {
            alpha:0, scale:0.5, y:-50, rotate:-120
        }, {
            alpha:1, scale:1, y:0, rotate:0, delay:0.5
        });

        // show the round name
        TweenMax.fromTo(".round-name-text li:nth-child(" + this.currentRoundIdx.toString() + ")", 0.75, {
            display:"block", alpha:0, x:-50
        }, {
            alpha:1, x:0, delay:0.8
        });
    }

    private showQuestion() { 
        // console.log(this.currentQuestionIdx);
        // this.currentQuestionIdx++;
        // this.currentPage = PageType.Question;
        // var currentQuestion = data.QUESTIONS[this.currentQuestionIdx];
        // this.setBG(data.COLOURS.beige);

        // switch(currentQuestion.type) {
        //     case q.QuestionType.Slider:
        //         this.slider.set(<q.SliderQuestion>currentQuestion);
        //         this.slider.show();
        //         break;
        //     case q.QuestionType.MultiChoice:
        //         this.mcq.set(<q.MCQuestion>currentQuestion);
        //         this.mcq.show();
        //         break;
        //     case q.QuestionType.QuickFire:
        //         this.qfq.set(<q.QuickFireQuestion>currentQuestion);
        //         this.qfq.show();
        //         break;
        // }
    }

    private next() {
        switch (this.currentPage) {
            case PageType.Login:
                anim.landingPageIn.pause();
                anim.fruitsIn.pause();

                anim.landingPageOut.play();
                break;
            
            case PageType.RoundName:
                anim.roundPageOut.restart();
                break;
            
            case PageType.Question:
                // var currentQuestion = data.QUESTIONS[this.currentQuestionIdx];
                // if (this.currentQuestionIdx < data.QUESTIONS.length-1) {
                //     // get next question
                //     var nextQuestion = data.QUESTIONS[this.currentQuestionIdx+1];
                //     // check if it's the same or a new round
                //     if (currentQuestion.round < nextQuestion.round) {
                //         this.showRoundName();
                //     } else {
                //         this.showQuestion();
                //     }
                // } else {
                //     // the end!
                //     console.log("the end has been reached");
                // }
                break;
        }
    }

    private showEndFrame() {
        this.currentPage = PageType.EndFrame;
        this.setBG(data.COLOURS.beige);
        anim.endFrameIn.play();
    }

    public answerRetrieved(a : any) {
        // data.QUESTIONS[this.currentQuestionIdx].answer = a;
        // console.log(data.QUESTIONS[this.currentQuestionIdx]);
        // this.next();
    }

    public questionsCompleted() {
        // called from quick fire question class
        // use the current question index to discount unanswered quickfire questions
        console.log("questions completed");
        this.showEndFrame();

    }

    // CALLBACK FROM APP
    public loginSuccessful() {
        this.next();
        // this.showRoundName();
    }

    public startRounds() {
        this.showRoundName();
    }

    public OnUserData(type: si.DataType, data: si.Data): void {

        // switch(type) {
        //     case si.DataType.UserProfile:
        //         const profile: si.UserProfile = (data as si.UserProfile);
        //         if (profile.images != null && profile.DisplayName != null) {
        //             this.ShowUserData(profile.images[0], profile.DisplayName);
        //         }

        //         break;

        //     case si.DataType.Recommendations:
        //         this.recommendations = (data as si.Track[]);
        //         break;

        //     case si.DataType.TopArtists:
        //         // this.artists = (data as si.Artist[]);
        //         break;
        // }
    }


    public Login() {
        this.OnLoginPressed();
    }
    
    public ShowUserData(imageURL: string, displayName: string): void {
    }
    
}
