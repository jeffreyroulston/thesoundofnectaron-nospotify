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
    private descriptionEl : HTMLElement = el("#round-name .description p");

    private lastVisibleEl : HTMLElement;
    private nextBgColor : string = "";

    private questionGroups : any[] = [];
    private currentQuestionGroup: Slider | MCQ | QuickFireQ;

    private loopingAnimations: TweenMax[] = [];

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
    // public OnLoginPressed = () => {};
    // public OnQuestionAnswered: {(totalQuestions: number, questionNumber: number, question: q.Question): void}[] = [];

    constructor(app : App) {
        // pass in the app to use for spotify interface
        this.app = app;

        // create the questions classes
        this.slider= new Slider(this, "#slider-q");
        this.mcq = new MCQ(this, "#mc-q");
        this.qfq = new QuickFireQ(this, "#quickfire-q");

        // get the logo letters
        var polygons = elList(".logo-letters .letter polygon");
        var paths = elList(".logo-letters .letter path");
        var lines = elList(".logo-letters .letter lines");
        var rect = elList(".logo-letters .letter rect");
        polygons.forEach((p1=> {
            this.logoLetters.push(p1)
        }))
       paths.forEach((p2=> {
            this.logoLetters.push(p2)
        }))
        lines.forEach((l=> {
            this.logoLetters.push(l)
        }))
        rect.forEach((r=> {
            this.logoLetters.push(r)
        }))

        console.log("logo letters");
        console.log(this.logoLetters)

        // set the order (lol)
        this.questionGroups = [this.slider, this.mcq, this.qfq];
        // this.questionGroups = [this.mcq, this.slider, this.mcq];

        // set initial question
        this.currentQuestionGroup = this.slider;

        // set the page to be hidden in graphics callback
        this.lastVisibleEl = this.landingPageEl;

        // check if it's fucking internet explorer
        // if (!Modernizr.svg) {
        //     console.log("it's internet fucking explorer")
        //   }

        // set button bindings
        el("#start-btn").addEventListener("click", this.login.bind(this));
        
        var btns = elList(".next-btn:not(#start-btn)");
        btns.forEach(e => {
            e.addEventListener("click", this.next.bind(this))
        })

        // kick it off
        // this.showLanding();
        // this.showRoundName();
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

    public showLanding() {
        this.landingPageEl.style.display = "block";
        anim.landingPageIn.play();
        // anim.fruitsIn.play();

        // // reset the cookie
        document.cookie = "landingShown"
        console.log(document.cookie);

        var d = 2;
        var t1 = 0.3;
        var t2 = 1;
        var distance = 50;

        // show the fruits 
        TweenMax.from("#landing .fruit-top", t1, {
            alpha: 0, delay:d
        })

        TweenMax.from("#landing .fruit-bottom", t1, {
            alpha: 0, delay:d+0.2
        })

        TweenMax.from("#landing .pineapple-top", t1, {
            alpha: 0, delay:d+0.4
        })
        TweenMax.from("#landing .fruit-bottom-2", t1, {
            alpha: 0, delay:d+0.6
        })

        TweenMax.from("#landing .fruit-whole", t1, {
            alpha: 0, delay:d+0.8
        })

        TweenMax.from("#landing .pineapple-burner", t1, {
            alpha: 0, delay:d+1
        })

        this.loopingAnimations.push(TweenMax.fromTo("#landing .fruit-top", t2, {
            rotate:-30
        },{
            y:-50, scale:1.3, rotate:30, repeat:-1, yoyo:true, ease:"linear"
        }))

        this.loopingAnimations.push(TweenMax.fromTo("#landing .fruit-bottom", t2, {
            rotate:30
        },{
            y:50, scale:1.3, rotate:-30, repeat:-1, yoyo:true, ease:"linear"
        }))

        this.loopingAnimations.push(TweenMax.fromTo("#landing .pineapple-top", t2, {
            x:-50
        },{
            x:10, scale:1.3, repeat:-1, yoyo:true, ease:"linear"
        }))

        this.loopingAnimations.push(TweenMax.fromTo("#landing .fruit-bottom-2", t2, {
            x:50
        },{
            x:10, scale:1.3, repeat:-1, yoyo:true, ease:"linear"
        }))

        this.loopingAnimations.push(TweenMax.fromTo("#landing .fruit-whole", t2*2, {
            rotate:0
        },{
            rotate:360, repeat:-1, ease:"linear"
        }))

        this.loopingAnimations.push(TweenMax.fromTo("#landing .fruit-whole", t2, {
            scale:1
        },{
           scale:1.3, repeat:-1, yoyo:true
        }))

        this.loopingAnimations.push(TweenMax.fromTo("#landing .pineapple-burner", 0.1, {
            rotate:-1
        },{
            rotate:0, transformOrigin: "bottom", repeat:-1, ease:"linear", yoyo:true
        }))
    }

    public showRoundName() {
        window.onbeforeunload = ()=> {
            document.cookie = "showLanding"
        }

        // set delay time
        var d = 0.7;

        // // set current page to be a round
        this.currentPage = PageType.RoundName;

        // // increment the current round
        this.currentRoundIdx++;
        var currentRound = data.ROUNDS[this.currentRoundIdx];

        // // do the background
        this.setBG(currentRound.color);

        // set round copy
        this.descriptionEl.innerHTML = currentRound.text;

        // set the arrow colour
        find(this.roundPageEl, ".arrow-line").style.stroke = data.CONTRAST[currentRound.color];
        find(this.roundPageEl, ".arrow-head").style.fill = data.CONTRAST[currentRound.color];

        // if round 3, change the colour of zero
        if (this.currentRoundIdx == 2) {
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
        this.currentPage = PageType.Question;
        this.setBG(data.COLOURS.beige);
        
        this.currentQuestionGroup = this.questionGroups[this.currentRoundIdx];
        this.currentQuestionGroup.set();
    }

    private login() {
        this.app.Login();
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
                this.showQuestion();
                break;
            
            case PageType.Question:
                // show the round name
                this.showRoundName();
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

        if (this.currentPage == PageType.Question) {
            // hide the round number elements
            TweenMax.to(".round-name-text li, .numbers li", 0, {
                display: "none"
            })
        }

        // set completed callback
        console.log("heeeeeeere");
        console.log(this.currentQuestionGroup.isComplete);
        if (this.currentQuestionGroup.isComplete) this.currentQuestionGroup.completed();

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

    public roundComplete(el: HTMLElement) {
        this.lastVisibleEl = el;
        if (this.currentRoundIdx == this.questionGroups.length-1) {
            this.questionsCompleted();
        } else {
            this.next();
        }
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


    // public Login() {
    //     this.OnLoginPressed();
    // }
    
    public ShowUserData(imageURL: string, displayName: string): void {
    }
    
}
