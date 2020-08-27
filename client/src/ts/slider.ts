import UI from "./ui";
import * as f from "./helpers";
import {SliderQuestion} from "./data";
import {TweenMax} from "gsap"

export default class Slider {
    private ui : UI;
    private id : string;
    private el : HTMLElement;

    // private sliderEl : HTMLInputElement;
    // private sliderThumb : HTMLElement;
    // private topFruitElement : HTMLElement;
    // private bottomFruitElement : HTMLElement;
    // private questionElement: HTMLElement;
    // private minValueLabel : HTMLElement;
    // private maxValueLabel : HTMLElement;

    // private fruitDefaultWidth : number;
    // private topFruitDefaultBottomValue : number;
    // private bottomFruitDefaultTopValue : number;

    // private min : number = 0;
    // private max : number = 0;
    // private mid : number = 0;
    // private value : number = 0;
    // private prevValue : number = 0
    // private sliderWidth : number = 0;

    // private initialised : boolean = false;

    constructor(ui : UI, id: string) {
        this.ui = ui;
        this.id = id;
        this.el = f.el(this.id);

        // this.sliderEl = <HTMLInputElement>el(this.el + " .slider-input");
        // this.sliderThumb = el(this.el + " .slider-thumb");
        // this.topFruitElement = el(this.el+ " .fruit-top img");
        // this.bottomFruitElement = el(this.el + " .fruit-bottom img");
        // this.questionElement = el(this.el + " .question");
        // this.minValueLabel = el("#min-value-label");
        // this.maxValueLabel = el("#max-value-label");

        // // console.log(this.el, this.sliderEl, this.sliderThumb, this.topFruitElement, this.bottomFruitElement, this.questionElement);

        // // this.fruitDefaultWidth = this.topFruitElement.getBoundingClientRect().width;
        // this.fruitDefaultWidth = 200;
        // this.topFruitDefaultBottomValue = pxToInt(getComputedStyle(this.topFruitElement).bottom);
        // this.bottomFruitDefaultTopValue = pxToInt(getComputedStyle(this.bottomFruitElement).top);

        // // console.log(this.fruitDefaultWidth, this.topFruitDefaultBottomValue, this.bottomFruitDefaultTopValue);

        // // set bindings
        // this.sliderEl.addEventListener("input",this.sliderChange.bind(this));
        // this.sliderEl.addEventListener("change", this.sliderValueSet.bind(this));
    }

    set(q : SliderQuestion) {
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
    }

    show() {
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
    }

    sliderChange(e: any){
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

    }

    scaleTopFruit() {
        // this.topFruitElement.style.width = px(3*(this.value - this.mid) + this.fruitDefaultWidth);
        // this.topFruitElement.style.bottom = px(this.topFruitDefaultBottomValue - 0.5 * (this.value - this.mid));
        // this.prevValue = this.value;
    }

    scaleBottomFruit() {
        // this.bottomFruitElement.style.width = px(3*(this.mid - this.value) + this.fruitDefaultWidth);
        // this.bottomFruitElement.style.top = px(this.bottomFruitDefaultTopValue - 0.5 * (this.mid - this.value));
        // this.prevValue = this.value;
    }

    sliderValueSet(e: any) {
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
    }

    answerRetrieved() {
        // el(this.el).style.display = "none";
        // this.ui.answerRetrieved(this.value);
    }
}
