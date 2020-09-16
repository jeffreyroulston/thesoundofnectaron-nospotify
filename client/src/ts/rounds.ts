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
    private roundNumberListEls : HTMLElement[] = f.findAll(this.roundPageEl, ".numbers li")
    private roundNameListEls : HTMLElement[] = f.findAll(this.roundPageEl, ".round-name-text li")
    private roundNumberPaths : HTMLElement[] = f.findAll(this.roundPageEl, ".number")
    private btnEl : HTMLElement = f.find(this.roundPageEl, ".next-btn");
    private fruitEl : HTMLElement = f.find(this.roundPageEl, ".fruit-whole");

    // PAGES
    private currentRoundIdx : number = 0;

    // ANIMATION
    private loopingAnimations: TweenMax[] = [];

    // CALLBACK
    public CreatePlaylist = () => {};

    constructor(ui : UI) {
        this.UI = ui;

        f.el("body").style.backgroundColor = data.COLOURS.orange;

        // initialise questions
        this.slider= new Slider();
        this.mcq = new MCQ();
        this.qfq = new QuickFireQ();

        // set the question order
        this.questionGroups = [this.slider, this.mcq, this.qfq];
        // this.questionGroups = [this.mcq, this.slider, this.qfq];
        // this.questionGroups = [this.qfq, this.slider, this.mcq];

        // set callbacks
        this.questionGroups.forEach((q)=> {
            q.roundComplete = this.roundComplete.bind(this);
        })

        // set initial question
        this.currentQuestionGroup = this.slider;

        // bind round page button
        this.btnEl.addEventListener("click", this.next.bind(this));

        // on resize
        // window.addEventListener('resize', this.onResize.bind(this));
        // this.onResize();

        // set it off
        this.showRound(0);
    }

    private showRound(d : number) {
        var currentRound = data.ROUNDS[this.currentRoundIdx];

        //do the background
        this.UI.SetBgColor(currentRound.color);

        // make the frame text white
        this.UI.ToggleFrameColours(data.COLOURS.beige, true);

        // set wave colour
        this.UI.ToggleWaveColor(currentRound.waveColor);

        // waves
        this.UI.ShowWaves(d);

        // set round copy
        f.find(this.descriptionEl, "p").innerHTML= currentRound.text;

        // set the arrow colour
        f.find(this.btnEl, ".next-btn-round").style.fill = currentRound.btnColor;

        // if round 3, change the colour of zero to purple
        if (this.currentRoundIdx == 3) {
            this.roundNumberPaths[0].style.stroke = data.COLOURS.purple;
        }

        // show elements
        this.roundPageEl.style.display = "block";
        this.roundPageEl.style.opacity = "1";

        // set hidden inline elements to visible
        var liElements = [this.roundNumberListEls[0], this.roundNumberListEls[this.currentRoundIdx+1], this.roundNameListEls[this.currentRoundIdx]];
        TweenMax.fromTo(liElements, 0, {
            display: "none"
        }, {
            display: "inline-block"
        })

        // show round numbers
        var roundNumbers = [this.roundNumberPaths[0], this.roundNumberPaths[this.currentRoundIdx+1]]
        TweenMax.fromTo(roundNumbers, 2, {
            display: "none", drawSVG : "0"
        }, {
            display: "block", drawSVG : "100%", ease: easeCircleInOut, delay: d
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
        TweenMax.fromTo(this.roundNameListEls[this.currentRoundIdx], 0.5, {
            alpha:0, x:-50
        }, {
            alpha:1, x:0, delay:2*d+1
        });

        if (this.UI.isMobileSize) {
            // show the description box
            TweenMax.fromTo(f.find(this.roundPageEl, ".description-wrapper"), 1, {
                alpha:0, y:50
            }, {
                alpha:1, y:0, delay:2*d+1
            });

            // show the little logo
            TweenMax.fromTo(this.UI.smallLogoEl, 0.5, {opacity:0, y:-100}, {opacity:1, y:0, display: "block"})

        } else {
            // show the description box
            TweenMax.fromTo(f.find(this.roundPageEl, ".description-wrapper"), 0.5, {
                alpha:0, y:-50
            }, {
                alpha:1, y:0, delay:2*d+1
            });
        }

        // bring in the fruit
        TweenMax.fromTo(this.fruitEl, 1, {
            y:-window.innerHeight, rotate:90
        }, {
            y:0, rotate:0, delay:2*d+0.5
        })

        // bop the fruit
        // this.loopingAnimations.push(TweenMax.to(fruit, 1, {
        //     y:5, repeat:-1, ease: "linear", yoyo:true, delay:2*d+1.5
        // }))


        // show the arrow
        TweenMax.fromTo(this.btnEl, 0.5, {
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

    private next() {
        this.loopingAnimations.forEach((anim)=> {
            anim.kill();
        })

        var q = this.questionGroups[this.currentRoundIdx];
        this.UI.SetVisibleElements([this.roundPageEl]);
        this.UI.ShowQuestion();
        q.set();
    }

    public roundComplete(el: HTMLElement) {
        // Called from slider/MCQ/Quickfire
        this.UI.SetVisibleElements([el]);

        // hide elements
        this.roundNumberListEls.forEach((n1)=> {
            n1.style.display = "none"
        });

        this.roundNameListEls.forEach((n2)=> {
            n2.style.display = "none"
        });


        if (this.currentRoundIdx <2) {
            this.currentRoundIdx++;
            this.UI.TransitionOut();
            this.showRound(0.7);
        } else {
            // all done
            this.CreatePlaylist();
        }
        // this.UI.TransitionOut();
        // this.CreatePlaylist();
    }

    public onResize() {
    }

    public changeToMobile() {
        console.log("change to mobile");
        // TweenMax.to(this.descriptionEl, 0.2, {rotation: 0});
    }

    public changeToDesktop() {
        console.log("change to desktop");
        // TweenMax.to(this.descriptionEl, 0.2, {rotation: -17});
    }


}