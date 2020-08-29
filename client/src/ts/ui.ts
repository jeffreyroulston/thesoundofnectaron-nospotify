import * as si from "./spotify-interface";
import * as data from "./data";
import Slider from "./slider-q";
import MCQ from "./mc-q";
import QuickFireQ from "./quickfire-q";
import {el, elList, getRandom} from "./helpers";
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

    private graphicsEl = el("#canvas-container");
    private sharedEl = el("#shared");
    // private colorWipeEl = el("#color-wipe");
    private landingPageEl = el("#landing");
    private roundPageEl = el("#round-name");
    private logoLetters : HTMLElement[] = elList(".loto-letters letter");

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
        // this.showLanding();
        this.showRoundName();
    }

    private setBG(color : string) {
        // // // sets background colour based on page
        // var origins = ["bottom", "right"];
        // // var origin = origins[Math.floor(Math.random() * origins.length)];
        // var origin = "bottom";

        // // set the background colour
        // el("body").style.backgroundColor = color;

        // // set logo colours - set it to the contrast of the background colour
        // this.logoLetters.forEach(el => {
        //     el.style.fill = data.CONTRAST[color];
        // });
        
        // // to do - why doesn't top and left work?
        // // origin determines direction
        // if (origin == "top" || origin == "bottom") {
        //     TweenMax.to(this.colorWipeEl, 5, {height: 0, transformOrigin:origin, ease:"linear", onComplete: function() {
        //         this.colorWipeEl.style.backgroundColor = color;
        //         this.colorWipeEl.style.height = "100vh";
        //     }})
        // } else {
        //     TweenMax.to(this.colorWipeEl, 5, {width: 0, transformOrigin:origin, ease:"linear", onComplete: function() {
        //         this.colorWipeEl.style.backgroundColor = color;
        //         this.colorWipeEl.style.width = "100%";
        //     }})
        // }

        // these are the border elements that stay on top
        this.sharedEl.style.zIndex = "201";
        // put the pixel graphics on top of the others
        this.graphicsEl.style.zIndex = "200";
        this.app.switchGraphics(data.COLOURS_THREE[color]);
    }

    private showLanding() {
        this.landingPageEl.style.display = "block";
        anim.landingPageIn.play();
        // anim.fruitsIn.play();
    }

    private showRoundName() {
        // // set current page to be a round
        this.currentPage = PageType.RoundName;

        // // increment the current round
        this.currentRoundIdx++;
        var currentRound = data.ROUNDS[this.currentRoundIdx];

        // show the round page
        this.roundPageEl.style.display = "block";

        // el("body").style.color = currentRound.color;

        // // reset the cookie
        // document.cookie = "showLanding"
        // console.log(document.cookie);

        // // if round 3, change the colour of zero
        // if (this.currentRoundIdx == 3) {
        //     el("#round-name .numbers li:first-child path").style.stroke = data.COLOURS.purple;
        // }

        // // change the colour of the button
        // el("#round-name .btn .orange-2").style.stroke = currentRound.btnTextColor;
        // el("#round-name .btn .purple").style.fill = currentRound.btnPaddingColor;
        // var elems = document.querySelectorAll("#round-name .btn .orange");
        // for (var i=0; i<elems.length; i++) {
        //     let e = <HTMLElement>elems[i];
        //     e.style.fill = currentRound.btnTextColor;
        // }
       
        // // do the background
        this.setBG(currentRound.color);

        // show elements
        var nextRoundNumber = "#round-name .numbers li:nth-child(" + (this.currentRoundIdx +2).toString() + ")";
        var nextRoundName = ".round-name-text li:nth-child(" + (this.currentRoundIdx +1).toString() + ")"

        var roundPageHiddenBlocks = "#round-name";
        var roundPageHiddenInline = "#round-name .numbers li:first-child" + ", " + nextRoundNumber + ", " + nextRoundName;

        TweenMax.fromTo(roundPageHiddenBlocks, 0, {
            display: "none"
        }, {
            display: "block"
        })

        TweenMax.fromTo(roundPageHiddenInline, 0, {
            display: "none"
        }, {
            display: "inline-block"
        })

        // // // play animation
        anim.roundPageIn.play();

        // // bring in round number
        // TweenMax.fromTo(nextRoundNumber, 0.5, {
        //     alpha:0, y:-50, rotate:-120
        // }, {
        //     alpha:1, y:0, rotate:0, delay:1
        // });

        var d = 0.7;

        TweenMax.fromTo("#round-name .numbers li:first-child path", 2, {
            drawSVG : "0"
        }, {
            drawSVG : "100%", ease: easeCircleInOut, delay: d
        });

        TweenMax.fromTo(nextRoundNumber + " path", 2, {
           drawSVG : "0"
        }, {
            drawSVG : "100%", ease: easeCircleInOut, delay: d
        });

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

        // show the round name
        TweenMax.fromTo(nextRoundName, 0.75, {
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
                // stop the animations
                anim.landingPageIn.pause();
                anim.fruitsIn.pause();

                // show the round name
                this.showRoundName();

                // hide landing page after 300ms (graphics transition = 300ms)
                // setTimeout(()=> {
                //     this.landingPageEl.style.display = "none";
                // }, 300);
                break;
            
            case PageType.RoundName:
                // anim.roundPageOut.restart();
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
        // set the body colour
        var currentRound = data.ROUNDS[this.currentRoundIdx];
        el("body").style.backgroundColor = currentRound.color;

        this.landingPageEl.style.display = "none";

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
