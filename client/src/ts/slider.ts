import UI from "./ui";
import {el, px, pxToInt} from "./helpers";
import {SliderQuestion} from "./questions";
import {TweenMax} from "gsap"

export default class Slider {
    private ui : UI;
    private el : string;
    private sliderEl : HTMLInputElement;
    private sliderThumb : HTMLElement;
    private topFruitElement : HTMLElement;
    private bottomFruitElement : HTMLElement;
    private questionElement: HTMLElement;

    private fruitDefaultWidth : number;
    private topFruitDefaultBottomValue : number;
    private bottomFruitDefaultTopValue : number;

    private min : number = 0;
    private max : number = 0;
    private mid : number = 0;
    private value : number = 0;
    private prevValue : number = 0
    private sliderWidth : number = 0;

    constructor(ui : UI, elementName: string) {
        this.ui = ui;
        this.el = elementName;
        this.sliderEl = <HTMLInputElement>el(this.el + " .slider-input");
        this.sliderThumb = el(this.el + " .slider-thumb");
        this.topFruitElement = el(this.el+ " .fruit-top img");
        this.bottomFruitElement = el(this.el + " .fruit-bottom img");
        this.questionElement = el(this.el + " .question");

        // this.fruitDefaultWidth = this.topFruitElement.getBoundingClientRect().width;
        this.fruitDefaultWidth = 200;
        this.topFruitDefaultBottomValue = pxToInt(getComputedStyle(this.topFruitElement).bottom);
        this.bottomFruitDefaultTopValue = pxToInt(getComputedStyle(this.bottomFruitElement).top);

        console.log(this.fruitDefaultWidth, this.topFruitDefaultBottomValue, this.bottomFruitDefaultTopValue);

        // set bindings
        this.sliderEl.addEventListener("input",this.sliderChange.bind(this));
        this.sliderEl.addEventListener("change", this.sliderValueSet.bind(this));
    }

    set(q : SliderQuestion) {
        this.min = q.minValue;
        this.max = q.maxValue;

        // set slider value to the middle
        this.mid = (this.max - this.min)/2;
        this.value = this.mid;
        this.prevValue = this.mid;

        // apply to slider element
        this.sliderEl.min = this.min.toString();
        this.sliderEl.max = this.max.toString();
        this.sliderEl.value = this.mid.toString();

        // add copy
        this.questionElement.innerHTML = q.question;

        // show element
        el(this.el).style.display = "block";
    }

    show() {

        TweenMax.from(this.el + " .question", 0.3, {alpha:0, x:-20, delay:0.5});
        TweenMax.from(this.el + " .slide-container", 0.2, {scaleX:0, transformOrigin: "left", delay: 0.8});
        TweenMax.from(this.el + " .slider-thumb", 0.5, {alpha:0, scale:1.5, y:20, delay:1});
    }

    sliderChange(e: any){
        // get the width and the value of the slider 
        this.sliderWidth = e.srcElement.clientWidth;
        this.value= e.srcElement.value;

        // get the next position of the arrow
        // move the triangle to match the position of the slider thumb
        this.sliderThumb.style.left = (((this.value - this.min) / (this.max - this.min) * (this.sliderWidth)) - this.sliderThumb.getBoundingClientRect().width/2).toString() + "px"

        // scale fruit
        if (this.value > this.mid) {
            this.scaleTopFruit();
        } else if (this.value < this.mid) {
            this.scaleBottomFruit();
        } else {
            //mid point
            if (this.prevValue > this.mid) {
                this.scaleTopFruit();
            } else {
                this.scaleBottomFruit();
            }
        }

    }

    scaleTopFruit() {
        this.topFruitElement.style.width = px(3*(this.value - this.mid) + this.fruitDefaultWidth);

        this.topFruitElement.style.bottom = px(this.topFruitDefaultBottomValue - 0.5 * (this.value - this.mid))

        this.prevValue = this.value;
    }

    scaleBottomFruit() {
        this.bottomFruitElement.style.width = px(3*(this.mid - this.value) + this.fruitDefaultWidth);

        this.bottomFruitElement.style.top = px(this.bottomFruitDefaultTopValue - 0.5 * (this.mid - this.value))

        this.prevValue = this.value;
    }

    sliderValueSet(e: any) {
        this.value= e.srcElement.value;
        this.ui.answerRetrieved(this.value);
    }
}
