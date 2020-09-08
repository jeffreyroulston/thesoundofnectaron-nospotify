import * as f from "./helpers";
import * as data from "./data";
import UI from "./ui";
import Slider from "./slider-q";
import MCQ from "./mc-q";
import QuickFireQ from "./quickfire-q";
import {TweenMax} from "gsap"

import { DrawSVGPlugin } from "gsap/dist/DrawSVGPlugin";
import { easeCircleInOut} from "d3";
import gsap from "gsap";
gsap.registerPlugin(DrawSVGPlugin);

export default class Rounds {
    private UI : UI;

    // QUESTIONS GROUPS
    private slider : Slider;
    private mcq : MCQ;
    private qfq : QuickFireQ;

    private questionGroups : any[] = [];
    private currentQuestionGroup: Slider | MCQ | QuickFireQ;

    // ELEMENTS
    private roundPageEl: HTMLElement = f.elByID("round-name");
    private descriptionEl : HTMLElement = f.find(this.roundPageEl, ".description");

    // PAGES
    private currentRoundIdx : number = -1;

    //ANIMATION
    private loopingAnimations: TweenMax[] = [];

    constructor(ui : UI) {
        this.UI = ui;

        f.el("body").style.backgroundColor = data.COLOURS.orange;

        // initialise questions
        this.slider= new Slider();
        this.mcq = new MCQ();
        this.qfq = new QuickFireQ();

        // set the question order
        this.questionGroups = [this.slider, this.mcq, this.qfq];
        // this.questionGroups = [this.mcq, this.slider, this.mcq];
        // this.questionGroups = [this.qfq, this.slider, this.mcq];

        // set initial question
        this.currentQuestionGroup = this.slider;

        this.ShowRound();

        // bind round page button
        // f.find(this.roundPageEl, ".next-btn").addEventListener("click", this.next.bind(this))

    }

    private ShowRound() {
        // // increment the current round
        this.currentRoundIdx++;
        var currentRound = data.ROUNDS[this.currentRoundIdx];

        // VARIABLES
        var d = 0.7; // set delay time
        var btn = f.find(this.roundPageEl, ".next-btn");
        var fruit = f.find(this.roundPageEl, ".fruit-whole");

        // this is 0
        var roundNumberZero = f.find(this.roundPageEl, ".numbers li:first-child");

        // this is the round number (1, 2, 3)
        var nextRoundNumber = f.find(this.roundPageEl, ".numbers li:nth-child(" + (this.currentRoundIdx +2).toString() + ")");

        // this is the name of the round
        var nextRoundName = f.find(this.roundPageEl, ".round-name-text li:nth-child(" + (this.currentRoundIdx +1).toString() + ")");

        // // do the background
        this.UI.SetBgColor(currentRound.color);

        // elements to hide
        this.UI.SetVisibleElements([this.roundPageEl]);

        // make the frame text white
        this.UI.ToggleFrameColours(data.COLOURS.beige);

        // set wave colour
        this.UI.ToggleWaveColor(currentRound.waveColor);

        // waves
        this.UI.ShowWaves(d);

        // set round copy
        this.descriptionEl.innerHTML = "<p>" + currentRound.text + "</p>";

        // set the arrow colour
        // f.find(this.roundPageEl, ".arrow-line").style.stroke = data.CONTRAST[currentRound.color];
        // f.find(this.roundPageEl, ".arrow-head").style.fill = data.CONTRAST[currentRound.color];

        // if round 3, change the colour of zero to purple
        if (this.currentRoundIdx == 2) {
            f.find(this.roundPageEl, ".numbers li:first-child-path").style.stroke = data.COLOURS.purple;
        }

        // show elements
        this.roundPageEl.style.display = "block";

        // set hidden inline elements to visible
        TweenMax.fromTo([roundNumberZero, nextRoundNumber, nextRoundName], 0, {
            display: "none"
        }, {
            display: "inline-block"
        })

        // show round number "0"
        TweenMax.fromTo(f.find(roundNumberZero, "path"), 2, {
            drawSVG : "0"
        }, {
            drawSVG : "100%", ease: easeCircleInOut, delay: d
        });

        // show variable round number (1,2,3)
        TweenMax.fromTo(f.find(nextRoundNumber, "path"), 2, {
        drawSVG : "0"
        }, {
            drawSVG : "100%", ease: easeCircleInOut, delay: d
        });

        // float in 'round'
        var paths = f.findAll(this.roundPageEl, ".round path");
        for (var i=0; i<paths.length; i++) {
            let xVal = f.getRandom(-300, 300)
            let yVal = f.getRandom(-500, 0);
            let r = f.getRandom(-180, 180);

            TweenMax.fromTo(paths[i], 1, {
                alpha:0, scale:0, x:xVal, y: yVal, rotation: r
            }, {
                alpha:1, scale:1, x:0, y:0, rotation:0, delay:2*d + i*0.1
            })
        }

        // show the round name
        TweenMax.fromTo(nextRoundName, 0.5, {
            alpha:0, x:-50
        }, {
            alpha:1, x:0, delay:2*d+1
        });

        // show the description box
        if (window.innerWidth > 900) {
            TweenMax.fromTo(this.descriptionEl, 0.5, {
                alpha:0, y:-50, rotation:-17
            }, {
                alpha:1, y:0, rotation: -17, delay:2*d+1
            });

        } else {
            // show the description box
            TweenMax.fromTo(this.descriptionEl, 1, {
                alpha:0, y:50
            }, {
                alpha:1, y:0, delay:2*d+1
            });
        }

        // bring in the fruit
        TweenMax.fromTo(fruit, 1, {
            y:-window.innerHeight, rotate:90
        }, {
            y:0, rotate:0, delay:2*d+0.5
        })

        // bop the fruit
        // this.loopingAnimations.push(TweenMax.to(fruit, 1, {
        //     y:5, repeat:-1, ease: "linear", yoyo:true, delay:2*d+1.5
        // }))


        // show the arrow
        TweenMax.fromTo(btn, 0.5, {
            alpha:0, scale:0.9
        }, {
            alpha:1, scale: 1, ease: "linear", delay:2*d+2.5
        })

        // bounce the arrow
        // this.loopingAnimations.push(
        //     TweenMax.to(btn, 1, {
        //         scale:0.9, ease: "linear", delay:2*d+3, repeat:-1, yoyo:true
        //     })
        // )
    }

    // public RoundComplete(el: HTMLElement) {
    //     // Called from slider/MCQ/Quickfire
    //     this.elementsToHide.push(el);

    //     if (this.currentRoundIdx == this.questionGroups.length-1) {
    //         console.log("questions completed");
    //         this.showEndFrame();
    //     } else {
    //         this.next();
    //     }
    // }


}