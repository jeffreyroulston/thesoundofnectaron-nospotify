import UI from "./ui";
import * as f from "./helpers";
import gsap, {TweenMax} from "gsap"
import {COLOURS, sliderQuestions, SliderQuestion } from "./data";
import { DrawSVGPlugin } from "gsap/dist/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/dist/MorphSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin, MorphSVGPlugin);

export default class Slider {
    private ui : UI;
    public el : HTMLElement = f.elByID("slider-q");

    private questionIdx : number = 0;
    private questions : SliderQuestion[] = sliderQuestions;
    private delay = 0.7;
    private time = 0.3;

    // shared elements
    private sliderEl : HTMLInputElement = <HTMLInputElement>f.find(this.el, ".slider-input");
    private sliderThumbEl : HTMLElement = f.find(this.el, " .slider-thumb");
    private questionElement: HTMLElement = f.find(this.el, ".question");
    private minValueLabel : HTMLElement = f.find(this.el, "#min-value-label");
    private maxValueLabel : HTMLElement = f.find(this.el, "#max-value-label");

    // other bits
    private sliderLineEl : HTMLElement = f.find(this.el, ".slider-line")

    // from question
    private sliderWidthEl : number = 0;
    private minValue : number = 0;
    private maxValue : number = 100;

    // starts in the middle
    private sliderValue : number = 50;
    private previousValue : number = 50;
    private midValue = 50;

    // these change per question
    private imgs : HTMLElement[] = [];
    private imgEl : HTMLElement = f.find(this.el, ".slider-q1");
    private count : number = 0;

    //q1 (color slider)
    private colorWipeEl :HTMLElement = f.elByID("color-wipe");
    private colour1 = f.convertHexToRgb("FCF1DB");
    private colour2 = f.convertHexToRgb("281333");
    private imgs2 : HTMLElement[] = [];
    private moon : HTMLElement = f.find(this.el, ".moon-center");

    // q2 (scale)
    private topFruitDefaultBottomValue : number = 0;
    private bottomFruitDefaultTopValue : number = 0;
    private fruitDefaultWidth : number = 300;

    // for looping animations
    private loopingAnimations : TweenMax[] = [];

    // private fruitDefaultWidth : number;
    // private topFruitDefaultBottomValue : number;
    // private bottomFruitDefaultTopValue : number;

    // private min : number = 0;
    // private max : number = 0;
    // private mid : number = 0;
    // private value : number = 0;
    // private prevValue : number = 0

    // private initialised : boolean = false;

    private showCurrentQuestion: () => void;
    private callbackCurrentQuestion : (e:any) => void;

    // called from ui
    public initiated = false;
    public isComplete = false;

    constructor(ui : UI) {
        this.ui = ui;

        this.showCurrentQuestion = this.showQ1.bind(this);
        this.callbackCurrentQuestion = this.callbackQ1.bind(this)

        // Initialising for question one
        // var lines = f.elList(".sun-rays .cls-2.line");
        // var stars = f.elList(".sun-rays .cls-2.star");
        // f.shuffle(lines);
        // f.shuffle(stars);

        // for(var i=0; i<lines.length; i++) {
        //     let line = lines[i];
        //     let star = stars[i]
        //     let idx = i;

        //     setTimeout(()=> {
        //         line.classList.toggle("animate");
        //         star.classList.toggle("animate");
        //     }, 1000 * idx)
        // }

        // for(var i=0; i<lines.length; i++) {
        //     lines[i].style.transitionDelay = (1000*i).toString() +"ms";
        //     stars[i].style.transitionDelay = (1000*i).toString() +"ms";

        //     lines[i].classList.toggle("animate");
        //     stars[i].classList.toggle("animate");
        // }


        // INITALISING FOR QUESTION TWO
        // this.topFruitElement = f.find(this.el, " .fruit-top img");
        // this.bottomFruitElement = f.find(this.el, " .fruit-bottom img");
        // this.questionElement = el(this.el + " .question");

        // // console.log(this.el, this.sliderEl, this.sliderThumb, this.topFruitElement, this.bottomFruitElement, this.questionElement);

        // // this.fruitDefaultWidth = this.topFruitElement.getBoundingClientRect().width;
        // this.fruitDefaultWidth = 200;
        // this.topFruitDefaultBottomValue = pxToInt(getComputedStyle(this.topFruitElement).bottom);
        // this.bottomFruitDefaultTopValue = pxToInt(getComputedStyle(this.bottomFruitElement).top);

        // // console.log(this.fruitDefaultWidth, this.topFruitDefaultBottomValue, this.bottomFruitDefaultTopValue);

        // // set bindings
        this.sliderEl.addEventListener("input",this.sliderChange.bind(this));
        this.sliderEl.addEventListener("change", this.sliderValueSet.bind(this));
    }

    public set() {
        // called from the ui and internally to set the question
        if (this.questionIdx < this.questions.length) {
            var q = sliderQuestions[this.questionIdx];

            // set the question copy
            this.questionElement.innerHTML = q.question;
    
            // set question labels
            this.minValueLabel.innerHTML = q.minTextValue.toString();
            this.maxValueLabel.innerHTML = q.maxTextValue.toString();

            // set value to default
            this.sliderValue = 50;
            this.sliderEl.value = "50";
            this.sliderReset();

            // show it
            this.show();
            this.showCurrentQuestion();

        } else {}
    }

    private show() {
        var delay = this.initiated ? 0 : this.delay;
        this.initiated = true;
        this.el.style.display = "block";
        
        // show the element with images
        this.imgEl.style.display = "block";

        // show the question
        TweenMax.fromTo(this.questionElement, this.time, {
            alpha:0, x:-20
        }, {
            alpha:1, x:0, delay: delay
        });

        // show the line
        TweenMax.fromTo(this.sliderLineEl, this.time, {
            scaleX:0, transformOrigin: "right"
        }, {
            scaleX:1, delay: delay
        });

        // show the labels
        TweenMax.fromTo([this.minValueLabel, this.maxValueLabel], this.time, {
            alpha: 0, y:-20
        }, {
            alpha: 1, y:0, delay: delay
        })

        // show the thumb
        TweenMax.fromTo(this.sliderThumbEl, this.time, {
            alpha:0, y:20
        }, {
            alpha:1, y:0, delay: delay
        });

    }

    private showQ1() {
        // // SUN AND CLOUDS
        this.count = 5;
        var sunRays = f.find(this.el, ".sun-rays");
        var rays = f.findAll(sunRays, ".line");
        var stars = f.findAll(sunRays, "polygon.star");

        this.imgs = rays;
        this.imgs2 = stars;
        f.shuffle(rays);

        // make it full width
        f.find(this.el, ".col-wrapper").classList.toggle("full-width");
        
        // bring in the colour wipe (this is the container for the colour change)
        TweenMax.fromTo(this.colorWipeEl, 0.2, {
            display:"none", alpha:0
        }, {
            display:"block", alpha:1, delay: this.delay
        })
        this.colorWipeEl.style.backgroundColor = f.rgb(this.colour1);


        // fade it in
        TweenMax.fromTo(sunRays, this.time, {
            alpha:0
        }, {
            alpha:1, delay:this.delay, ease:"linear"
        })

        // change the sun ray colours
        for (var i=0; i<rays.length; i++) {
            this.loopingAnimations.push(
                TweenMax.fromTo(rays[i], 1, {
                fill: COLOURS.white
                }, {
                    fill: COLOURS.yellow, repeat:-1, yoyo:true, ease: "linear", delay: i*0.1
                })
            )
        }

        // stars be twinkling
        for (var i=0; i<stars.length; i++) {
            this.loopingAnimations.push(
                TweenMax.fromTo(stars[i], 0.1, {
                fill: COLOURS.white
                }, {
                    fill: COLOURS.purple, repeat:-1, yoyo:true, ease: "linear", delay: i*0.1
                })
            )
        }

        // make the image pulse
        this.loopingAnimations.push(
            TweenMax.to(sunRays, 2, {
                scale:0.95, repeat:-1, yoyo:true, ease: "linear"
            })
        )
    }

    private callbackQ1(e: any) {
        // get value from slider
        this.sliderValue = e.srcElement.value;

        var colour = f.rgb(f.findColorBetween(this.colour1, this.colour2, this.sliderValue));
        console.log(colour);
        this.colorWipeEl.style.backgroundColor = colour;

        // turn it round proportional to the thing
        var ratio = this.sliderValue/this.maxValue;
        var rotation = 360 * ratio;

        TweenMax.to(this.imgEl, 0, {
            rotation: rotation
        })

        // rays
        var lineOpacity = (1-ratio) - ratio;
        lineOpacity = lineOpacity < 0 ? 0 : lineOpacity;
        this.imgs.forEach((line)=> {
            line.style.opacity = (lineOpacity).toString();
        })

        // stars
        var starOpacity = (ratio - (1-ratio));
        starOpacity = starOpacity < 0 ? 0 : starOpacity;
        this.imgs2.forEach((star)=> {
            star.style.opacity = starOpacity.toString();
        })

        this.moon.style.opacity = ratio.toString();
    }

    private showQ2() {
        console.log("show question two");
        
        // PINEAPPLE AND HOPS
        this.imgs = f.elList(".slider-q2 li img");

        // get the width
        this.fruitDefaultWidth = this.imgs[0].getBoundingClientRect().width;

        // Make it not full width
        f.el(".col-wrapper").classList.toggle("full-width");

        this.topFruitDefaultBottomValue = f.pxToInt(getComputedStyle(this.imgs[0]).bottom);
        this.bottomFruitDefaultTopValue = f.pxToInt(getComputedStyle(this.imgs[1]).top);

        TweenMax.fromTo(this.imgs, 0.3, {
            alpha:0
        }, {
            alpha:1
        });

        TweenMax.fromTo(this.imgs[0], 0.8, {
            y:-100
        }, {
            y:0
        });

        TweenMax.fromTo(this.imgs[1], 0.8, {
            y:100
        }, {
            y:0
        });

        // this.loopingAnimations.push(TweenMax.to(this.imgs[0], 0.5, {
        //     y:-20, repeat:-1, yoyo:true, delay:0.8
        // }))

        // this.loopingAnimations.push(TweenMax.to(this.imgs[1], 0.5, {
        //     y:20, repeat:-1, yoyo:true, delay:0.8
        // }))
    }

    private callbackQ2(e: any) {
        this.sliderValue = e.srcElement.value;

        // // scale fruit
        if (this.sliderValue > this.midValue) {
            this.scaleTopFruit();
        } else if (this.sliderValue  < this.midValue) {
            this.scaleBottomFruit();
        } else {
            //mid point
            if (this.previousValue > this.midValue) {
                this.scaleTopFruit();
            } else {
                this.scaleBottomFruit();
            }
        }
    }

    scaleTopFruit() {

        this.imgs[0].style.width = f.px(3*(this.sliderValue - this.midValue) + this.fruitDefaultWidth);
        this.imgs[0].style.bottom = f.px(this.topFruitDefaultBottomValue - 0.5 * (this.sliderValue - this.midValue));
        this.previousValue = this.sliderValue;
    }

    scaleBottomFruit() {
        this.imgs[1].style.width = f.px(3*(this.midValue - this.sliderValue) + this.fruitDefaultWidth);
        this.imgs[1].style.top = f.px(this.bottomFruitDefaultTopValue - 0.5 * (this.midValue - this.sliderValue));
        this.previousValue = this.sliderValue;
    }

    private showQ3() {
        console.log("show question three");
        
        // GLOVES AND DART
        var container = <HTMLUListElement>this.imgEl;
        container.style.display = "block";
        this.count = 10;
        this.imgs = [];

        // make it full width
        f.el(".col-wrapper").classList.toggle("full-width");

        // set perspective?
        // TweenMax.to(this.imgEl, 0, {perspective:800})

        // create children and add to images
        for (var i=1; i<this.count+1; i++) {
            let el = document.createElement("li");
            let htmlEl = <HTMLElement>el;
            
            // store item to images list
            this.imgs.push(htmlEl)

            // add list item to EL element
            container.appendChild(el)

            htmlEl.className = i<=(this.count/2) ? "sharp" : "round";
            TweenMax.to(htmlEl, 0, {transformStyle:"preserve-3d"})
        }

        // position them within the box
        this.q3Resize();

        // animate things out in a random order
        var elements = this.imgs;
        f.shuffle(elements);

        for(var x=0; x<elements.length; x++) {
            this.loopingAnimations.push(TweenMax.fromTo(elements[x], 3.5, {
                y: window.innerHeight/2,
                rotationY:-10,
            }, {
                y: -window.innerHeight*1.5,
                x: f.getRandom(-300, 300),
                ease: "linear",
                repeat:-1,
                repeatDelay:0,
                delay:x*0.3,
            }));
        }
    }

    private callbackQ3(e: any) {
        // get value from slider
        this.sliderValue = e.srcElement.value;

        var round= Math.round((this.sliderValue / this.maxValue)*10);
        var sharp = this.count - round;

        for (var i=0; i<this.count; i++) {
            this.imgs[i].className = i<sharp ? "sharp" : "round";
        }

        // console.log("slider value: " + this.sliderValue.toString() + " sharp counter: " + sharp.toString() + " round counter: " + round.toString());
    }

    private q3Resize() {
        var width = this.imgEl.getBoundingClientRect().width;
        for (var i=0; i<this.count; i++) {
            this.imgs[i].style.left = f.px(width/this.count * i)
        }
    }

    private showQ4() {
        // make it not full width
        f.el(".col-wrapper").classList.toggle("full-width");
    }
    private callbackQ4(e: any) {}

    private showQ5() {
        console.log("show question five");
        
        // HANDS
        this.count = 5;
        this.sliderValue = 0;
        this.sliderEl.value = "0";
        this.sliderReset();

        // set perspective?
        TweenMax.to(this.imgEl, 0, {perspective:800})

        // show the block
        TweenMax.fromTo(".slider-q5 li:first-child", 0.5, {
            alpha:0,rotationX:90,
        }, {
            alpha:1, rotationX:0, transformOrigin: "bottom", 
        })

         // add all the different states of hands to imgs
         for (var i=1; i<this.count+1; i++) {
            this.imgs.push(f.el(".slider-q5 li:nth-child(" + i.toString() + ")"));
        }

        // for(var i=0; i<this.imgs.length; i++) {
        //     this.loopingAnimations.push(TweenMax.fromTo(this.imgs[i], 1.5, {
        //         rotate:5, transformOrigin: "50% 100%"
        //     }, {
        //         rotate:-10, transformOrigin: "50% 100%", repeat:-1, yoyo:true, delay: 0.06 * i
        //     }));
        // }
    }

    private callbackQ5(e: any) {
        // get value from slider
        this.sliderValue = e.srcElement.value;
        var ratio = 25;
        
        var v = this.sliderValue / ratio;
        var idx = Math.ceil(v);
        idx = idx < 1 ? 1 : idx; // always at least zero

        var max = idx * ratio;
        var multiplier = (max - this.sliderValue)/ratio;
        
        this.imgs[idx-1].style.opacity = "1";
        this.imgs[idx].style.opacity = ( 1- multiplier).toString();
        for (var i=idx+1; i<this.imgs.length; i++) {
            this.imgs[i].style.opacity = "0";
        }
    }

    sliderChange(e: any){
        this.sliderValue = e.srcElement.value;
         this.sliderWidthEl = e.srcElement.clientWidth;

        // // get the next position of the arrow
        // move the triangle to match the position of the slider thumb
        this.sliderThumbEl.style.left = f.px(((this.sliderValue - this.minValue) / (this.maxValue - this.minValue) * (this.sliderWidthEl)) - this.sliderThumbEl.getBoundingClientRect().width/2);

        this.callbackCurrentQuestion(e);
    }

    sliderReset(){
        this.sliderWidthEl = this.sliderEl.clientWidth;

        // // get the next position of the arrow
        // move the triangle to match the position of the slider thumb
        this.sliderThumbEl.style.left = f.px(((this.sliderValue - this.minValue) / (this.maxValue - this.minValue) * (this.sliderWidthEl)) - this.sliderThumbEl.getBoundingClientRect().width/2);
    }

    sliderValueSet(e:any) {
        // if (this.questionIdx < 1) {
            // lock in slider value to answer
            this.questions[this.questionIdx].answer = e.srcElement.value;;
            console.log(this.questions[this.questionIdx]);
            this.getNextQuestion();
        // }
    }

    getNextQuestion() {
        var showFunctions = [
            this.showQ1.bind(this),
            this.showQ2.bind(this),
            this.showQ3.bind(this),
            this.showQ4.bind(this),
            this.showQ5.bind(this)
        ];

        var callbackFunctions = [
            this.callbackQ1.bind(this),
            this.callbackQ2.bind(this),
            this.callbackQ3.bind(this),
            this.callbackQ4.bind(this),
            this.callbackQ5.bind(this)
        ];

        // stop all loopinng animations
        this.loopingAnimations.forEach((anim) => {
            anim.kill();
        })

        if (this.questionIdx < this.questions.length-1) {
            console.log("current question: " + this.questionIdx.toString() + ", next question: " + (this.questionIdx+1).toString())
            this.questionIdx++;
            // transition out

            // reset values
            this.imgs = [];
            this.imgEl = f.find(this.el, ".slider-q" + (this.questionIdx+1).toString());
            this.count = 0;
            this.loopingAnimations = [];

            // resent bindings
            this.showCurrentQuestion = showFunctions[this.questionIdx];
            this.callbackCurrentQuestion = callbackFunctions[this.questionIdx];

            // hide out the things
            this.hide();

        } else {
            console.log("current question: " + this.questionIdx.toString() + ", end of this section ");
            this.isComplete = true;
            this.hide();
            this.ui.roundComplete(this.el);
        }
    }

    hide() {
        // hide out the things
        TweenMax.to(".slider-q" + this.questionIdx.toString(), this.time, {
            alpha:0, scale: 1.1, display: "none", onComplete : ()=> {
                if (!this.isComplete) this.set();
            }
        });

        // show the question
        TweenMax.to(this.questionElement, this.time, {
            alpha:0, x:-20
        });

        // hide the line
        TweenMax.to(" .slider-line", this.time, {
            scaleX:0, transformOrigin: "right"
        });;

        // hide the labels
        TweenMax.to([this.minValueLabel, this.maxValueLabel], this.time, {
            alpha: 0, y:-20
        })

        // hide the thumb
        TweenMax.to(this.sliderThumbEl, this.time, {
            alpha:0, y:20
        });

        // for question 1
        if (this.colorWipeEl.style.display == "block") {
            TweenMax.to(this.colorWipeEl, this.time, {
                width: 0, transformOrigin:"left", display:"none"
            })
        }
    }

    completed() {
        console.log("completed");
        this.el.style.display = "none";
    }
}
