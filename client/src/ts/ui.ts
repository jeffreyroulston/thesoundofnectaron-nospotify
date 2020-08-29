import * as si from "./spotify-interface";
import * as data from "./data";
import Slider from "./slider-q";
import MCQ from "./mc-q";
import QuickFireQ from "./quickfire-q";
import {el, find, elList, getRandom} from "./helpers";
import {TweenMax, TimelineMax} from "gsap"
import App from "./app";
import * as anim from "./animator"

import * as d3 from "d3";

// import Graphics from "./graphics";
// import * as THREE from 'three';

import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/dist/DrawSVGPlugin";
import { forceY, easeCircleIn, easeCircleInOut } from "d3";
gsap.registerPlugin(DrawSVGPlugin);

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

    private currentPage : PageType = PageType.Login;
    private currentRoundIdx : number = -1;

    private graphicsEl: HTMLElement = el("#canvas-container");
    private sharedEl: HTMLElement = el("#shared");
    private landingPageEl: HTMLElement = el("#landing");
    private roundPageEl: HTMLElement = el("#round-name");
    private logoLetters: HTMLElement[] = elList(".loto-letters letter");

    private lastVisibleEl : HTMLElement;
    private nextBgColor : string = "";

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

        // set the page to be hidden in graphics callback
        this.lastVisibleEl = this.landingPageEl;

        // check if it's fucking internet explorer
        // if (!Modernizr.svg) {
        //     console.log("it's internet fucking explorer")
        //   }

        // set button bindings
        // el("#startBtn").addEventListener("click", this.next.bind(this));
        var btns = elList(".next-btn");
        btns.forEach(e => {
            e.addEventListener("click", this.next.bind(this))
        })

        // kick it off
        // this.showLanding();
        this.showRoundName();
    }

    private setBG(color : string) {
        // set the next background color to turn the body in the graphics callback
        this.nextBgColor = color;

        // // set logo colours - set it to the contrast of the background colour
        this.logoLetters.forEach(el => {
            el.style.fill = data.CONTRAST[color];
        });

        // these are the border elements that stay on top
        this.sharedEl.style.zIndex = "201";

        // put the pixel graphics on top of the others
        this.graphicsEl.style.zIndex = "200";

        // pixels!
        this.app.switchGraphics(data.COLOURS_THREE[color]);
    }

    private showLanding() {
        this.landingPageEl.style.display = "block";
        anim.landingPageIn.play();
        // anim.fruitsIn.play();
    }

    private showRoundName() {
        // set delay time
        var d = 0.7;

        // // set current page to be a round
        this.currentPage = PageType.RoundName;

        // // increment the current round
        this.currentRoundIdx++;
        var currentRound = data.ROUNDS[this.currentRoundIdx];

        // // reset the cookie
        // document.cookie = "showLanding"
        // console.log(document.cookie);

        // // do the background
        this.setBG(currentRound.color);

        // set the arrow colour
        find(this.roundPageEl, ".arrow-line").style.stroke = data.CONTRAST[currentRound.color];
        find(this.roundPageEl, ".arrow-head").style.fill = data.CONTRAST[currentRound.color];

        // if round 3, change the colour of zero
        if (this.currentRoundIdx == 3) {
            el("#round-name .numbers li:first-child path").style.stroke = data.COLOURS.purple;
        }

        // show elements
        this.roundPageEl.style.display = "block";

        // this is the round number (1, 2, 3)
        var nextRoundNumber = "#round-name .numbers li:nth-child(" + (this.currentRoundIdx +2).toString() + ")";

        // this is the name of the round
        var nextRoundName = ".round-name-text li:nth-child(" + (this.currentRoundIdx +1).toString() + ")"

        // hidden inline elements to prevent janky transition
        var roundPageHiddenInline = "#round-name .numbers li:first-child" + ", " + nextRoundNumber + ", " + nextRoundName;

        // set hidden inline elements to visible
        TweenMax.fromTo(roundPageHiddenInline, 0, {
            display: "none"
        }, {
            display: "inline-block"
        })

        // show round number "0"
        TweenMax.fromTo("#round-name .numbers li:first-child path", 2, {
            drawSVG : "0"
        }, {
            drawSVG : "100%", ease: easeCircleInOut, delay: d
        });

        // show variable round number (1,2,3)
        TweenMax.fromTo(nextRoundNumber + " path", 2, {
           drawSVG : "0"
        }, {
            drawSVG : "100%", ease: easeCircleInOut, delay: d
        });

        // float in 'round'
        var paths = document.querySelectorAll(".round path");
        console.log(paths);
        for (var i=0; i<paths.length; i++) {
            let xVal = getRandom(-300, 300)
            let yVal = getRandom(-300, 300);
            let r = getRandom(-180, 180);

            TweenMax.fromTo(paths[i], 0.8, {
                alpha:0, scale:0, x:xVal, y: yVal, rotation: r
            }, {
                alpha:1, scale:1, x:0, y:0, rotation:0, delay:2*d + i*0.1
            })
        }

        // bring in the fruit
        TweenMax.fromTo("#round-name .fruit-whole", 0.6, {
            scale:0.8, alpha:0, y:-500, rotation:-45
        }, {
            scale:1, alpha:1, y:0, rotation:0, delay:2*d+0.6
        })

        // show the round name
        TweenMax.fromTo(nextRoundName, 0.6, {
            display:"none", alpha:0, x:-50
        }, {
            display:"inline-block", alpha:1, x:0, delay:2*d+0.8
        });

        // show the description box
        TweenMax.fromTo("#round-name .description", 0.6, {
            alpha:0, y:20, rotation:-17
        }, {
            alpha:1, y:0, rotation:-17, delay:2*d+1
        });

        // show the arrow
        TweenMax.fromTo("#round-name .next-btn", 0.3, {
            alpha:0, x:-10
        }, {
            alpha:1, x:0, delay:2*d+1.2
        });

        // bounce the arrow
        // TweenMax.to("#round-name .next-btn", 0.3, {
        //     x:-10, repeat: -1, yoyo: true, delay:2*d+1.5
        // });


    }

    private showQuestion() { 
        // console.log(this.currentQuestionIdx);
        // this.currentQuestionIdx++;
        // this.currentPage = PageType.Question;
        // var currentQuestion = data.QUESTIONS[this.currentQuestionIdx];
        this.setBG(data.COLOURS.beige);
        console.log(this.currentRoundIdx);
        switch(this.currentRoundIdx) {
            case 0:
                this.slider.set();
                break;
            case 1:
                this.mcq.show();
                break;
            case 2:
                this.qfq.show();
                break;
            default:
                console.log("why are we here?", this.currentRoundIdx);
        }

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
        console.log("next");
        switch (this.currentPage) {
            case PageType.Login:
                // stop the animations
                anim.landingPageIn.pause();
                anim.fruitsIn.pause();

                // show the round name
                this.showRoundName();
                break;
            
            case PageType.RoundName:
                // set the page to be hidden in graphics callback
                this.lastVisibleEl = this.roundPageEl;

                console.log("test");
                this.showQuestion();
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

    // call back from graphics/app
    public bgTransitionComplete() {
        console.log("background transition complete");

        // set the body colour
        el("body").style.backgroundColor = this.nextBgColor;

        this.lastVisibleEl.style.display = "none";

        setTimeout(()=> {
            // moved shared element back so things can be interacted with
            this.sharedEl.style.zIndex = "100";
            
            // prepare to hide graphics element
            this.graphicsEl.style.zIndex = "0";

            // convert graphics element to transparent
            this.app.resetGraphics();
        }, 100)
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
