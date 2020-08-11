import UI from "./ui";
import {el, px, pxToInt} from "./helpers";
import {MCQuestion, MCAnswer} from "./questions";
import {TweenMax} from "gsap"

export default class MCQ {
    private ui : UI;
    private el : string;
    private questionElement: HTMLElement;
    private options : MCAnswer[] = [];

    constructor(ui : UI, elementName: string) {
        this.ui = ui;
        this.el = elementName;
        this.questionElement = el(this.el + " .question");

        var options = document.querySelectorAll(this.el + " .mc-options li");
        for (var i=0; i<options.length; i++) {
            options[i].addEventListener("click", this.answerRetrieved.bind(this));
        }
    }

    set(q : MCQuestion) {
        this.questionElement.innerHTML = q.question;
        this.options = q.options;

        // show element
        el(this.el).style.display = "block";
    }

    show() {
        // start animating in elements
        TweenMax.fromTo(this.el + " .question", 0.3, {alpha:0, x:-20, delay:0.5}, {alpha:1, x:0, delay:0.2});
        for (var i=0; i<this.options.length; i++) {
            TweenMax.fromTo(
                this.el + " #mc-" + this.options[i].value, 0.5,
                {
                    display:"none",
                    alpha:0,
                    scale:0,
                    rotate:200
                },
                {
                    display:"inline-block",
                    alpha:1,
                    scale:1,
                    rotate:0,
                    ease:"bounce",
                    // stagger:{
                    //     each: 0.25,
                    //     from: "random"
                    // }
                    delay:i*0.1 + 0.5
                }
            );
        }
    }

    answerRetrieved(e: any) {
        var value = e.srcElement.id.replace("mc-",);
        for (var i=0; i<this.options.length; i++) {
            TweenMax.to(
                this.el + " #mc-" + this.options[i].value, 0.5,
                {
                    display:"none",
                    alpha:0,
                    scale:0,
                    delay:i*0.1
                },
            );
        }
        TweenMax.to(this.el + " .question", 0.3, {alpha:0, x:-20, delay:0.2, onComplete: ()=>{
            el(this.el).style.display = "none";
            this.ui.answerRetrieved(value);
        }});
    }
}
