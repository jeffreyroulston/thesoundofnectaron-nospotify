import UI from "./ui";
import {el, px, pxToInt} from "./helpers";
import {MCQuestion, MCAnswer} from "./questions";
import {TweenMax} from "gsap"

export default class MCQ {
    private ui : UI;
    private el : string;

    private questionElement: HTMLElement;

    constructor(ui : UI, elementName: string) {
        this.ui = ui;
        this.el = elementName;

        this.questionElement = el(this.el + " .question");
    }

    set(q : MCQuestion) {
        this.questionElement.innerHTML = q.question;
        for (var i=0; i<q.options.length; i++) {
            TweenMax.fromTo(
                this.el + " ." + q.options[i].value, 0.3,
                {
                    display:"none",
                    alpha:0,
                    scale:0,
                },
                {
                    display:"block",
                    alpha:1,
                    scale:1,
                    ease:"bounce",
                    stagger:{
                        each: 0.1,
                        from: "random"
                    }
                }
            );
        }
    }

    show() {
    }

    answerRetrieved() {
    }
}
