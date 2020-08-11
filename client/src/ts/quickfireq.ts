import UI from "./ui";
import {QuickFireQuestion} from "./questions";
import {el, px, pxToInt} from "./helpers";
import {TweenMax} from "gsap"

export default class QuickFireQ {
    private ui : UI;
    private el : string;
    private questionElement: HTMLElement;
    private timerTensColumn : HTMLElement;
    private timerOnesColumn : HTMLElement;

    private timerCount : number = 20;
    private timerStarted : boolean = false;

    constructor(ui : UI, elementName: string) {
        this.ui = ui;
        this.el = elementName;
        this.questionElement = el(this.el + " .question");
        this.timerTensColumn = el("#tensCol");
        this.timerOnesColumn = el("#onesCol");

        var answer = document.querySelectorAll("#answer-wrapper li");
        for (var i=0; i<answer.length; i++) {
            answer[i].addEventListener("click", this.answerRetrieved.bind(this))
        }
    }

    set(q : QuickFireQuestion) {
        this.questionElement.innerHTML = q.question;

        // show element
        el(this.el).style.display = "block";
    }

    show() {
        // start timer
        if (!this.timerStarted) {
            this.updateTimerElement();
            setTimeout(this.updateTimer.bind(this), 1000);
            this.timerStarted = true;
            TweenMax.fromTo(this.el + " .question", 0.3, {alpha:0, x:-20, delay:0.5}, {alpha:1, x:0, delay:0.2});
        }
    }

    updateTimer() {
        this.timerCount--;

        if (this.timerCount < 0) {
            console.log("end");
        } else {
            this.updateTimerElement();;
            setTimeout(this.updateTimer.bind(this), 1000);
        }
    }

    updateTimerElement() {
        var t = this.timerCount.toString();
        if (this.timerCount > 9) {
            this.timerTensColumn.innerHTML = t[0];
            this.timerOnesColumn.innerHTML = t[1];

        } else {
            this.timerTensColumn.innerHTML = "";
            this.timerOnesColumn.innerHTML = t;
        }
    }

    answerRetrieved(e: any) {
        var value = e.srcElement.data == "true";
        this.ui.answerRetrieved(value);
    }
}
