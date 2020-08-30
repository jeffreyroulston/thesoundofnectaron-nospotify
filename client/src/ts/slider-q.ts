import UI from "./ui";
import * as f from "./helpers";
import gsap, {TweenMax} from "gsap"
import {sliderQuestions, SliderQuestion } from "./data";
import { easeBounceIn, easeBounceInOut } from "d3";

export default class Slider {
    private ui : UI;
    private id : string;
    private el : HTMLElement;

    private questionIdx : number = 0;
    private questions : SliderQuestion[] = sliderQuestions;
    private delay = 0.7;
    private time = 0.3;

    // shared elements
    private sliderEl : HTMLInputElement;
    private sliderThumbEl : HTMLElement;
    private sliderWidthEl : number = 0;
    private questionElement: HTMLElement;
    private minValueLabel : HTMLElement;
    private maxValueLabel : HTMLElement;

    // from question
    private minValue : number = 0;
    private maxValue : number = 100;

    // starts in the middle
    private sliderValue : number = 50;
    private previousValue : number = 50;
    private midValue = 50;

    // these change per question
    private imgs : HTMLElement[] = [];
    private imgEl : HTMLElement = f.el(".slider-q1");
    private count : number = 0;

    // q2 (scale)
    private topFruitDefaultBottomValue : number = 0;
    private bottomFruitDefaultTopValue : number = 0;
    private fruitDefaultWidth : number = 200;

    private initiated = false;

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

    constructor(ui : UI, id: string) {
        this.ui = ui;
        this.id = id;
        this.el = f.el(this.id);

        // question copy
        this.questionElement = f.find(this.el, ".question");

        // labels
        this.minValueLabel = f.find(this.el, "#min-value-label");
        this.maxValueLabel = f.find(this.el, "#max-value-label");

        // slider arrow
        this.sliderEl = <HTMLInputElement>f.find(this.el, ".slider-input");
        this.sliderThumbEl = f.find(this.el, " .slider-thumb");

        this.showCurrentQuestion = this.showQ1.bind(this);
        this.callbackCurrentQuestion = this.callbackQ1.bind(this)

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

        } else {
            console.log("beemo");
        }
    }

    private show() {
        var delay = this.initiated ? 0 : 1;
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
        TweenMax.fromTo(" .slider-line", this.time, {
            scaleX:0, transformOrigin: "right"
        }, {
            scaleX:1, delay: delay
        });

        // show the labels
        TweenMax.fromTo([this.minValueLabel, this.maxValueLabel], this.time, {
            alpha: 0, y:-20
        }, {
            alpha: 1, y:0, delay: delay+ 0.1
        })

        // show the thumb
        TweenMax.fromTo(this.sliderThumbEl, this.time, {
            alpha:0, y:20
        }, {
            alpha:1, y:0, delay: delay + 0.2
        });

    }

    private showQ1() {
        console.log("show question one");
        
        // SUN AND CLOUDS
        this.count = 5;

        // add all the different states (sun, clouds) to imgs
        for (var i=1; i<this.count+1; i++) {
            this.imgs.push(f.el(".slider-q1 li:nth-child(" + i.toString() + ")"));
        }

        // show the block
        TweenMax.fromTo(".slider-q1 li:first-child", 0.5, {
            alpha:0, y:400, scale:1.5
        }, {
            alpha:1, y:0, scale:1, delay:this.delay+0.2
        })
    }

    private callbackQ1(e: any) {
        // get value from slider
        this.sliderValue = e.srcElement.value;
        var ratio = 25
        
        var v = this.sliderValue / ratio;
        var idx = Math.ceil(v);
        idx = idx < 1 ? 1 : idx; // always at least zero

        var max = idx * ratio;
        var multiplier = (max - this.sliderValue)/ratio;

        if (multiplier >= 0.5) {
            this.imgs[idx-1].style.opacity = "1";
        } else {
            this.imgs[idx-1].style.opacity = (multiplier*2).toString();
        }
        this.imgs[idx].style.opacity = ( 1- multiplier).toString();
        for (var i=idx+1; i<this.imgs.length; i++) {
            this.imgs[i].style.opacity = "0";
        }
    }

    private showQ2() {
        console.log("show question two");
        
        // PINEAPPLE AND HOPS
        this.imgs = f.elList(".slider-q2 li img");

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
            y:0, ease:"bounce"
        });

        TweenMax.fromTo(this.imgs[1], 0.8, {
            y:100
        }, {
            y:0, ease:"bounce"
        });

        this.loopingAnimations.push(TweenMax.to(this.imgs[0], 0.5, {
            y:-20, repeat:-1, yoyo:true, delay:0.8
        }))

        this.loopingAnimations.push(TweenMax.to(this.imgs[1], 0.5, {
            y:20, repeat:-1, yoyo:true, delay:0.8
        }))
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
        TweenMax.to(this.imgEl, 0, {perspective:800})

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
            this.loopingAnimations.push(TweenMax.fromTo(elements[x], 1.5, {
                y: window.innerHeight/2,
                rotationY:-10,
            }, {
                y: -window.innerHeight,
                x: f.getRandom(-300, 300),
                ease: "linear",
                repeat:-1,
                repeatDelay:0,
                delay:x*0.2,
                rotationY:10,
            }));
        }
    }

    private callbackQ3(e: any) {

        console.log("Callback");
        // get value from slider
        this.sliderValue = e.srcElement.value;

        var round= Math.round((this.sliderValue / this.maxValue)*10);
        var sharp = this.count - round;

        for (var i=0; i<this.count; i++) {
            this.imgs[i].className = i<sharp ? "sharp" : "round";
        }

        console.log("slider value: " + this.sliderValue.toString() + " sharp counter: " + sharp.toString() + " round counter: " + round.toString());
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

        for(var i=0; i<this.imgs.length; i++) {
            this.loopingAnimations.push(TweenMax.fromTo(this.imgs[i], 1, {
                rotate:5, transformOrigin: "50% 100%"
            }, {
                rotate:-10, transformOrigin: "50% 100%", repeat:-1, yoyo:true, delay: 0.08 * i
            }));
        }
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
        if (this.questionIdx < 1) {
            // lock in slider value to answer
            this.questions[this.questionIdx].answer = e.srcElement.value;;

            console.log(this.questions[this.questionIdx]);

            this.getNextQuestion();
        }
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

        if (this.questionIdx < this.questions.length-1) {
            console.log("current question: " + this.questionIdx.toString() + ", next question: " + (this.questionIdx+1).toString())
            this.questionIdx++;
            // transition out

            // reset values
            this.imgs = [];
            this.imgEl = f.find(this.el, ".slider-q" + (this.questionIdx+1).toString());
            this.count = 0;

            // stop all loopinng animations
            this.loopingAnimations.forEach((anim) => {
                anim.kill();
            })

            this.loopingAnimations = [];

            // resent bindings
            this.showCurrentQuestion = showFunctions[this.questionIdx];
            this.callbackCurrentQuestion = callbackFunctions[this.questionIdx];

            console.log(this.imgEl);
            console.log(this.showCurrentQuestion);
            console.log(this.callbackCurrentQuestion);

            // hide out the things
            TweenMax.to(".slider-q" + this.questionIdx.toString(), this.time, {
                alpha:0, scale:0.9, transformOrigin: "bottom", display: "none", onComplete : ()=> {
                    this.set();
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

            console.log(".slider-q" + this.questionIdx.toString())

        } else {
            console.log("current question: " + this.questionIdx.toString() + ", end of this section ")
        }
    }

    // set(q : SliderQuestion) {
        // this.min = q.minValue;
        // this.max = q.maxValue;

        // // set slider value to the middle
        // this.mid = (this.max - this.min)/2;
        // this.value = this.mid;
        // this.prevValue = this.mid;
        // this.sliderThumb.style.left = "calc(50% - 9px)";

        // // reset fruit {
        // this.topFruitElement.style.width = px(this.fruitDefaultWidth);
        // this.bottomFruitElement.style.width = px(this.fruitDefaultWidth);
        // this.bottomFruitElement.style.top = px(this.bottomFruitDefaultTopValue);
        // this.topFruitElement.style.bottom = px(this.topFruitDefaultBottomValue);


        // // apply to slider element
        // this.sliderEl.min = this.min.toString();
        // this.sliderEl.max = this.max.toString();
        // this.sliderEl.value = this.mid.toString();

        // // add copy
        // this.questionElement.innerHTML = q.question;
        // this.minValueLabel.innerHTML = q.minTextValue;
        // this.maxValueLabel.innerHTML = q.maxTextValue;

        // // show element
        // el(this.el).style.display = "block";
    // }

    // show() {
        // var d = this.initialised ? 0.2 : 0.4;
        // this.initialised = true;

        // TweenMax.fromTo(this.el + " .question", 0.3, {
        //     alpha:0, x:-20
        // }, {
        //     alpha:1, x:0, delay: d
        // });

        // TweenMax.fromTo(this.el + " .slide-container", 0.3, {
        //     scaleX:0, transformOrigin: "right"
        // }, {
        //     scaleX:1, delay: d
        // });
        
        // TweenMax.fromTo(this.topFruitElement, 0.3, {
        //     alpha:0
        // }, {
        //     alpha:1, delay: d
        // });

        // TweenMax.fromTo(this.bottomFruitElement, 0.3, {
        //     alpha:0
        // }, {
        //     alpha:1, delay: d
        // });

        // TweenMax.fromTo(this.topFruitElement, 0.8, {
        //     y:-50
        // }, {
        //     y:0, ease:"bounce", delay : d
        // });

        // TweenMax.fromTo(this.bottomFruitElement, 0.8, {
        //     y:50
        // }, {
        //     y:0, ease:"bounce", delay : d
        // });

        // TweenMax.fromTo([this.minValueLabel, this.maxValueLabel], 0.2, {
        //     alpha: 0, y:-20
        // }, {
        //     alpha: 1, y:0, delay: d + 0.2
        // })

        // TweenMax.fromTo(this.el + " .slider-thumb", 0.2, {
        //     alpha:0, y:20
        // }, {
        //     alpha:1, y:0, delay: d + 0.2
        // });
    // }

    // sliderChange(e: any){
        // // get the width and the value of the slider 
        // this.sliderWidth = e.srcElement.clientWidth;
        // this.value= e.srcElement.value;

        // // get the next position of the arrow
        // // move the triangle to match the position of the slider thumb
        // this.sliderThumb.style.left = px(((this.value - this.min) / (this.max - this.min) * (this.sliderWidth)) - this.sliderThumb.getBoundingClientRect().width/2);

        // // scale fruit
        // if (this.value > this.mid) {
        //     this.scaleTopFruit();
        // } else if (this.value < this.mid) {
        //     this.scaleBottomFruit();
        // } else {
        //     //mid point
        //     if (this.prevValue > this.mid) {
        //         this.scaleTopFruit();
        //     } else {
        //         this.scaleBottomFruit();
        //     }
        // }

    // }

    // scaleTopFruit() {
        // this.topFruitElement.style.width = px(3*(this.value - this.mid) + this.fruitDefaultWidth);
        // this.topFruitElement.style.bottom = px(this.topFruitDefaultBottomValue - 0.5 * (this.value - this.mid));
        // this.prevValue = this.value;
    // }

    // scaleBottomFruit() {
        // this.bottomFruitElement.style.width = px(3*(this.mid - this.value) + this.fruitDefaultWidth);
        // this.bottomFruitElement.style.top = px(this.bottomFruitDefaultTopValue - 0.5 * (this.mid - this.value));
        // this.prevValue = this.value;
    // }

    // sliderValueSet(e: any) {
        // this.value= e.srcElement.value;
        // var d = 0.1;

        // TweenMax.to(this.el + " .slider-thumb", 0.1, {
        //     alpha:0, y:20
        // });

        // TweenMax.to([this.minValueLabel, this.maxValueLabel], 0.1, {
        //     alpha:0, y:-20
        // });

        // TweenMax.to(this.topFruitElement, 0.2, {
        //     alpha: 0, y:-50, delay:d
        // });

        // TweenMax.to(this.bottomFruitElement, 0.2, {
        //     alpha:0, y:50, delay:d
        // });

        // TweenMax.to(this.el + " .slide-container", 0.2, {
        //     scaleX:0, transformOrigin: "right", delay:d
        // });

        // TweenMax.to(this.el + " .question", 0.2, {
        //     alpha:0, x:-20, delay:d, onComplete: this.answerRetrieved.bind(this)
        // });
    // }

    // answerRetrieved() {
        // el(this.el).style.display = "none";
        // this.ui.answerRetrieved(this.value);
    // }
}
