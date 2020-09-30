import * as f from "./helpers";
import UI from "./ui";
import ROUND from "./rounds";
import {TweenMax} from "gsap"
import {COLORS, sliderQuestions, SliderQuestion } from "./data";

import { Draggable } from "gsap/dist/Draggable";
import gsap from "gsap";
import { version } from "d3";
import Fire from "./fire";
import App from "./app";
gsap.registerPlugin(Draggable);

export default class Slider {
    // the element
    private el : HTMLElement = f.elByID("slider-q");

    // index things....
    private questionIdx : number = 0;
    private questions : SliderQuestion[] = sliderQuestions;
    private delay = 0.7;
    private time = 0.3;

    // shared elements
    private questionElement: HTMLElement = f.find(this.el, ".question");
    private minValueLabel : HTMLElement = f.find(this.el, "#min-value-label");
    private maxValueLabel : HTMLElement = f.find(this.el, "#max-value-label");
    private sliderContainerEl : HTMLElement = f.find(this.el, ".slide-container");
    private sliderThumbEl : HTMLElement = f.find(this.el, " .slider-thumb");
    private sliderLineEl : HTMLElement = f.find(this.el, ".slider-line")

    // from question
    // private sliderWidth : number = 0;
    // private minValue : number = 0;
    private maxValue : number = 100;

    // starts in the middle
    private sliderValue : number = 0;
    private previousValue : number = 0;
    private midValue = 50;

    // these change per question
    private imgs : HTMLElement[] = [];
    private imgEl : HTMLElement = f.find(this.el, ".slider-q1");
    private count : number = 0;

    // for looping animations
    private loopingAnimations : TweenMax[] = [];

    // slider
    private draggableOffset : number = 0;
    private draggableCurrentPos : number = 0;
    private draggableWidth : number = 0;
    private draggableMax : number = 0;
    private draggableMin : number = 0;
    private sliderColor1 = f.convertHexToRgb("88009D");
    private sliderColor2 = f.convertHexToRgb("FF1900");

    // called from ui
    public initiated = false;
    public isComplete = false;

    //q1 (color slider)
    private colorWipeEl :HTMLElement = f.elByID("color-wipe");
    private color1 = f.convertHexToRgb("FCF1DB");
    private color2 = f.convertHexToRgb("281333");
    private imgs2 : HTMLElement[] = [];
    private moon : HTMLElement = f.find(this.el, ".moon-center");

    // q2 (scale)
    private sweetFruitOffset : number = 0;
    private fruitDefaultHeight : number = 0;

    // q4 (bunsen)
    private busenFillEl : HTMLElement = f.find(this.el, ".bunsen-fill");
    private bunsencolor1 = f.convertHexToRgb("88009D");
    private bunsencolor2 = f.convertHexToRgb("FF1900");
    private fire : Fire | undefined;
    private fireOn : boolean = false;

    // bound to ui
    public roundComplete = (e: HTMLElement)=> {};

    // internal call backs
    private showCurrentQuestion: () => void;
    private callbackCurrentQuestion : (n : number) => void;

    constructor() {
        this.showCurrentQuestion = this.showQ1.bind(this);
        this.callbackCurrentQuestion = this.callbackQ1.bind(this)

        window.addEventListener("resize", this.onResize.bind(this));

        Draggable.create(".slider-thumb", {
            type:"x", edgeResistance:1, bounds:".slide-container", inertia:false, onDragStart : this.sliderInit.bind(this), onDrag : this.sliderChange.bind(this), onDragEnd : this.sliderValueSet.bind(this)
        });
    }

    private sliderInit(e: any) {
        if (this.sliderValue < 50) {
            // is 0
            this.draggableOffset = e.x;
        } else {
            // is 50
            this.draggableOffset = e.x - 0.5*this.draggableWidth;
        }
    }

    private sliderResize() {
        this.draggableWidth = this.sliderLineEl.getBoundingClientRect().width;
        this.draggableMax = this.draggableWidth;
        this.draggableMin = 0;
    }

    private sliderChange(e: any) {
        if (e.x == undefined) {
            console.log(e.touches[0].pageX)
            this.draggableCurrentPos = e.touches[0].pageX
        } else {
            this.draggableCurrentPos = e.x;
        }

        // chamge the slider thumb colour
        var value = Math.round((this.draggableCurrentPos - this.draggableOffset)/this.draggableMax * 100);
        if (value >= 0 && value <= 100) {
            this.sliderValue = value;

            var color = f.rgb(f.findColorBetween(this.sliderColor1, this.sliderColor2, this.sliderValue));
            this.sliderThumbEl.style.borderBottomColor = color;
            this.callbackCurrentQuestion(this.sliderValue);
        }

        // this.callbackCurrentQuestion(Math.round((this.draggableCurrentPos - this.draggableOffset)/this.draggableMax * 100))
    }

    private setSliderValue(n : number) {
        this.sliderValue = n;

        // slider colour
        var color = f.rgb(f.findColorBetween(this.sliderColor1, this.sliderColor2, this.sliderValue));
        this.sliderThumbEl.style.borderBottomColor = color;

        // slider position
        var v = n/100 * this.draggableWidth;
        TweenMax.to(this.sliderThumbEl, 0, {x:v});
    }

    private sliderValueSet(e:any) {
        // play sound
        App.audio.playSelectedSound();

        var q = sliderQuestions[this.questionIdx];
        var v = (q.max - q.min)/100 * this.sliderValue + q.min;
        sliderQuestions[this.questionIdx].answer = f.roundTo(v, 2);
        this.getNextQuestion();
    }

    private toggleFullWidth() {
        f.find(this.el, ".col-wrapper.text-column").classList.toggle("full-width");
        this.el.classList.toggle("wide");
    }

    private orangeLeft() {
        this.sliderContainerEl.className = this.sliderContainerEl.className.replace(" orange-right", "");
        this.sliderContainerEl.classList.toggle("orange-left");
        this.sliderColor1 = f.convertHexToRgb("FF1900");
        this.sliderColor2 = f.convertHexToRgb("88009D");
    }

    private orangeRight() {
        this.sliderContainerEl.className = this.sliderContainerEl.className.replace(" orange-left", "");
        this.sliderContainerEl.classList.toggle("orange-right");
        this.sliderColor1 = f.convertHexToRgb("88009D");
        this.sliderColor2 = f.convertHexToRgb("FF1900");
    }

    private onResize(e: any) {
        console.log(this.questionIdx)

        // resize slider
        this.sliderResize();
        this.setSliderValue(this.sliderValue);

        switch(this.questionIdx) {
            case 0:
                break;
            case 1:
                // PINEAPPPLE/HOP SLIDER
                // pineapple reset
                this.imgs[0].style.removeProperty('height');
                this.imgs[0].style.removeProperty('top');

                //hop reset
                this.imgs[1].style.removeProperty('height');

                // recalculate
                this.fruitDefaultHeight = this.imgs[0].getBoundingClientRect().height;
                this.scaleFruit();
                break;
            case 2:
                break;
            case 3:
                // BUNSEN BURNER
                break;
            default:
                break;
        }
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

            // set slider value
            this.setSliderValue(q.startValue);

            // show it
            this.show();
            this.showCurrentQuestion();

        } else {}
    }

    private show() {
        var delay = this.initiated ? 0 : this.delay;
        this.initiated = true;
        this.el.style.display = "block";

        if (this.draggableWidth < 1) this.sliderResize();
        
        // show the element with images
        this.imgEl.style.display = "block";

        // show the question
        TweenMax.fromTo(this.questionElement, this.time, {
            alpha:0, x:-20
        }, {
            alpha:1, x:0, delay: delay
        });

        // hide the slider thumb
        TweenMax.to(this.sliderThumbEl, this.time, { alpha:0 });

        // show the line
        TweenMax.fromTo(this.sliderLineEl, this.time, {
            scaleX:0, transformOrigin: "right"
        }, {
            scaleX:1, delay: delay, onComplete : ()=> {
                this.sliderResize();
                this.setSliderValue(this.sliderValue);

                // show the thumb
                TweenMax.fromTo(this.sliderThumbEl, this.time, {
                    alpha:0, y:20
                }, {
                    alpha:1, y:0
                });
            }
        });

        // show the labels
        TweenMax.fromTo([this.minValueLabel, this.maxValueLabel], this.time, {
            alpha: 0, y:-20
        }, {
            alpha: 1, y:0, delay: delay
        })
    }

    private showQ1() {
        // SUN AND CLOUDS
        this.count = 5;
        var sunRays = f.find(this.el, ".sun-rays");
        var rays = f.findAll(sunRays, ".line");
        var stars = f.findAll(sunRays, "polygon.star");

        // set gradient
        this.orangeLeft();

        // hide the content column
        f.find(this.el, ".col-wrapper.content-column").style.display = "none"

        // set slider value
        this.setSliderValue(0)

        this.imgs = rays;
        this.imgs2 = stars;
        f.shuffle(rays);

        // make it full width
        this.toggleFullWidth();
        
        // bring in the color wipe (this is the container for the color change)
        TweenMax.fromTo(this.colorWipeEl, 0.2, {
            display:"none", alpha:0
        }, {
            display:"block", alpha:1, delay: this.delay
        })
        this.colorWipeEl.style.backgroundColor = f.rgb(this.color1);


        // fade it in
        TweenMax.fromTo(sunRays, this.time, {
            alpha:0
        }, {
            alpha:1, delay:this.delay, ease:"linear"
        })

        // change the sun ray colors
        for (var i=0; i<rays.length; i++) {
            this.loopingAnimations.push(
                TweenMax.fromTo(rays[i], 0.3, {
                    fill: COLORS.yellow,
                }, {
                    fill: COLORS.white,
                    repeat:-1, yoyo:true, ease: "linear", delay: i*0.05
                })
            )
        }

        // stars be twinkling
        for (var i=0; i<stars.length; i++) {
            this.loopingAnimations.push(
                TweenMax.fromTo(stars[i], 0.1, {
                fill: COLORS.white
                }, {
                    fill: COLORS.purple, repeat:-1, yoyo:true, ease: "linear", delay: i*0.1
                })
            )
        }

        // make the image pulse
        this.loopingAnimations.push(
            TweenMax.to(sunRays, 2, {
                scale:1.2, repeat:-1, yoyo:true, ease: "linear"
            })
        )
    }

    private callbackQ1(n : number) {
        // get the colors
        var color = f.rgb(f.findColorBetween(this.color1, this.color2, this.sliderValue));
        this.colorWipeEl.style.backgroundColor = color;

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

        // the background
        // console.log(this.sliderValue);
        // if (this.sliderValue >=50) {
        //     f.elByID("nectaron-slide").style.opacity = "0.01"
        // } else {
        //     f.elByID("nectaron-slide").style.opacity = "0.2"
        // }

        this.moon.style.opacity = ratio.toString();
    }

    private showQ2() {
        // PINEAPPLE AND HOPS
        var slider = f.find(this.el, ".slider-q2");
        this.imgs = f.findAll(slider, "li img");

        // set gradient
        this.orangeRight();

        // set slider value
        this.setSliderValue(50);

        // show the content column
        f.find(this.el, ".col-wrapper.content-column").style.display = "block"

        // get the height
        this.fruitDefaultHeight = this.imgs[0].getBoundingClientRect().height;

        // Make it not full width
        this.toggleFullWidth();

        TweenMax.fromTo(this.imgs, 0.3, {
            alpha:0
        }, {
            alpha:1
        });

        TweenMax.fromTo(f.find(slider, "li:first-child"), 0.8, {
            y:-100
        }, {
            y:0
        });

        TweenMax.fromTo(f.find(slider, "li:last-child"), 0.8, {
            y:100
        }, {
            y:0
        });

        this.loopingAnimations.push(TweenMax.to(this.imgs[0], 0.5, {
            y:-20, repeat:-1, yoyo:true, delay:0.8
        }))

        this.loopingAnimations.push(TweenMax.to(this.imgs[1], 0.5, {
            y:20, repeat:-1, yoyo:true, delay:0.8
        }))
    }

    private callbackQ2(n : number) {
        this.scaleFruit();
    }

    scaleFruit() {
        // scale fruit
        if (this.sliderValue > this.midValue) {
            this.scaleBitter();
        } else if (this.sliderValue  < this.midValue) {
            this.scaleSweet();
        } else {
            //mid point
            if (this.previousValue > this.midValue) {
                this.scaleBitter();
            } else {
                this.scaleSweet();
            }
        }
    }

    scaleBitter() {
        this.imgs[1].style.height = f.px(5* (this.sliderValue - this.midValue) + this.fruitDefaultHeight);
        this.previousValue = this.sliderValue;
    }

    scaleSweet() {
        this.imgs[0].style.height= f.px(5* (this.midValue - this.sliderValue) + this.fruitDefaultHeight);
        this.sweetFruitOffset = 0 - 5* (this.midValue - this.sliderValue);
        this.imgs[0].style.top = f.px(this.sweetFruitOffset);
        this.previousValue = this.sliderValue;
    }

    private showQ3() {
        // GLOVES AND DART
        var container = <HTMLUListElement>this.imgEl;
        container.style.display = "block";
        this.count = 10;
        this.imgs = [];

        // hide the content column
        f.find(this.el, ".col-wrapper.content-column").style.display = "none"

        // make it full width
        this.toggleFullWidth();

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

    private callbackQ3(n : number) {
        var round= Math.round((this.sliderValue / this.maxValue)*10);
        var sharp = this.count - round;

        for (var i=0; i<this.count; i++) {
            this.imgs[i].className = i<sharp ? "sharp" : "round";
        }
    }

    private q3Resize() {
        var width = this.imgEl.getBoundingClientRect().width;
        for (var i=0; i<this.count; i++) {
            this.imgs[i].style.left = f.px(width/this.count * i)
        }
    }

    private showQ4() {
        // BUNSEN BURNER
        this.fire = new Fire();
        this.fire.onInitResources(App.resourceManager);
        this.fireOn = true;

        const bgcontainer = document.getElementById('canvas-container-background');
        if (bgcontainer !== null) {
            bgcontainer.style.zIndex = '5';
            bgcontainer.append(this.fire.domElement);
            this.fire.domElement.id = "graphics-canvas";
        }

        this.fire.run();

        // set slider value
        // this.setSliderValue(50);
        this.fire?.setSpeed(50/50);

        // make it not full width
        this.toggleFullWidth();

        // show the content column
        f.find(this.el, ".col-wrapper.content-column").style.display = "block"

        var slider = f.find(this.el, ".slider-q4");

        // get the bubbles
        this.imgs = f.findAll(slider, "#bubbles li");
        
        // get the colors
        var color = f.rgb(f.findColorBetween(this.bunsencolor1, this.bunsencolor2, this.sliderValue));
        this.busenFillEl.style.fill = color;

        TweenMax.fromTo(slider, 0.5, {
            display:"none", alpha:0, x:window.innerWidth/2
        }, {
            display: "block", alpha:1, x:0
        })
    }

    private callbackQ4(n: number) {
        this.fire?.setSpeed(n/50);

        // get the colors
        var color = f.rgb(f.findColorBetween(this.bunsencolor1, this.bunsencolor2, this.sliderValue));
        this.busenFillEl.style.fill = color;
    }

    private showQ5() {
        // HANDS
        this.count = 5;

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

        for(var i=0; i<this.imgs.length; i++) {
            this.loopingAnimations.push(TweenMax.fromTo(this.imgs[i], 1.5, {
                rotate:5, transformOrigin: "50% 100%"
            }, {
                rotate:-10, transformOrigin: "50% 100%", repeat:-1, yoyo:true, delay: 0.06 * i
            }));
        }
    }

    private callbackQ5(n : number) {
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

        var blur = Math.ceil(this.sliderValue / 20);
        f.el("body").style.webkitFilter = "blur(" + blur.toString() + "px)";
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
            this.questionIdx++;
            this.imgs = [];
            this.imgEl = f.find(this.el, ".slider-q" + (this.questionIdx+1).toString());
            this.count = 0;
            this.loopingAnimations = [];

            // resent bindings
            this.showCurrentQuestion = showFunctions[this.questionIdx];
            this.callbackCurrentQuestion = callbackFunctions[this.questionIdx];

            // if there's fire
            if (this.fireOn && this.fire) {
                TweenMax.to(this.fire.domElement, 0.5, {
                    alpha: 0, display: "none", onComplete : ()=> {
                        this.fire?.destroy();
                        this.fire = undefined;
                        f.elByID("canvas-container-background").style.display = "none";
                    }
                });

                this.fireOn = false;
            }

            // hide out the things
            this.hide();

        } else {
            this.isComplete = true;
            this.hide();
            this.roundComplete(this.el);
        }
    }

    hide() {
        // hide out the things
        TweenMax.to(".slider-q" + this.questionIdx.toString(), this.time, {
            alpha:0, scale: 1.1, display: "none", onComplete : ()=> {
                f.el("body").style.webkitFilter = "blur(0px)";
                if (!this.isComplete) this.set();
            }
        });

        // hide the question
        TweenMax.to(this.questionElement, this.time, {
            alpha:0, x:-20
        });

        // hide the line
        TweenMax.to(this.sliderLineEl, this.time, {
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
}
