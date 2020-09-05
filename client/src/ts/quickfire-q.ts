import UI from "./ui";
import {QuickFireQuestion, qfQuestions, COLOURS} from "./data";
import * as f from "./helpers";
import {TweenMax} from "gsap"
import { Color } from "three";

export default class QuickFireQ {
    private ui : UI;
    private id : string;
    private el : HTMLElement;

    private questionIdx : number = 0;
    private questions : QuickFireQuestion[] = qfQuestions;
    private questionsUnanswered : QuickFireQuestion[] = [];
    private questionsAsked : QuickFireQuestion[] = [];
    private delay = 0.7;
    private time = 0.3;

    private questionEl: HTMLElement;
    private timerEl : HTMLElement;
    private timerTensColumn : HTMLElement;
    private timerOnesColumn : HTMLElement;

    private timerCount : number = 30;
    private timerStarted : boolean = false;
    private active : boolean = false;

    // called from ui
    public initiated = false;
    public isComplete = false;

    constructor(ui : UI, id: string) {
        this.ui = ui;
        this.id = id;
        this.el = f.el(this.id);

        // get the timer
        this.timerEl = f.find(this.el, "#timer");
        this.timerTensColumn = f.find(this.timerEl, "#tensCol");
        this.timerOnesColumn = f.find(this.timerEl, "#onesCol");

        // get the question element
        this.questionEl = f.find(this.el, " .question");

        // copy the questions so we can pluck them out as we go
        for(var i=0; i<this.questions.length; i++) {
            this.questionsUnanswered.push(this.questions[i]);
        }

        // set the timer
        this.updateTimerElements();

        // get next question
        this.getNextQuestion();

        var answer = document.querySelectorAll("#answer-wrapper li");
        for (var i=0; i<answer.length; i++) {
            answer[i].addEventListener("click", this.answerRetrieved.bind(this))
        }
    }

    set() {
        if (!this.active) this.active = true;
        // if (!this.timerStarted) {
        //     this.timerEl.innerHTML = this.timerCount.toString();
        //     this.timerStarted = true;
        // }

        // set the question text
        this.questionEl.innerHTML = this.questionsAsked[this.questionsAsked.length-1].question

        // animate it in
        if (!this.initiated) this.show();
    }

    // set(q : QuickFireQuestion) {
    //     // this.questionElement.innerHTML = q.question;

    //     // // show element
    //     // el(this.el).style.display = "block";
    // }

    show() {
        var delay = this.initiated ? 0 : this.delay;
        this.initiated = true;
        this.el.style.display = "block";

        TweenMax.fromTo(this.questionEl, this.time, {
            alpha:0, x:-20
        }, {
            alpha:1, x:0, delay:delay
        });

        TweenMax.fromTo("#answer-wrapper li", this.time, {
            alpha:0, y:50
        }, {
            alpha:1, y:0, stagger:0.1, delay: delay
        });
        
        TweenMax.fromTo(this.timerEl, this.time, {
            alpha:0, x:200
        }, {
            alpha:1, x:0, delay: delay, onComplete: ()=> {
            setTimeout(this.updateTimer.bind(this), 1000)
        }})
    }

    getNextQuestion() {
        console.log(this.questionsUnanswered.length);
        var idx = f.getRandomInt(0, this.questionsUnanswered.length-1);
        console.log(idx);
        // do an edge case here

        this.questionsAsked.push(this.questionsUnanswered[idx]);
        this.questionsUnanswered.splice(idx, 1);

        console.log(this.questionsAsked);
        console.log(this.questionsUnanswered);
        if (this.initiated) this.set();
    }

    hide() {
        // TweenMax.to(this.el, this., {opacity:0, scale:0.7, onComplete: ()=> {
        //     el("#questions").style.display = "none";
        // }});
    }

    updateTimer() {
        this.timerCount--;

        if (this.timerCount >= 0 && this.timerCount > 9) {
            this.updateTimerElements();
            setTimeout(this.updateTimer.bind(this), 1000);
        } else {
            this.active = false;
            // this.ui.roundComplete(this.el);
        }
    }

    updateTimerElements() {
        var t = this.timerCount.toString();

        if (this.timerCount < 10) {
            this.timerEl.className = "ones";
        } else if (this.timerCount < 20) {
            this.timerEl.className = "tens";
        }

        if (this.timerCount < 11) {
            this.timerTensColumn.style.color = COLOURS.red;
            this.timerOnesColumn.style.color = COLOURS.red;
        } else if (this.timerCount < 21) {
            this.timerTensColumn.style.color = COLOURS.yellow;
            this.timerOnesColumn.style.color = COLOURS.yellow;
        }

        if (this.timerCount > 9) {
            this.timerTensColumn.innerHTML = t[0];
            this.timerOnesColumn.innerHTML = t[1];

        } else {
            this.timerTensColumn.innerHTML = "";
            this.
            timerOnesColumn.innerHTML = t;
        }
    }

    answerRetrieved(e: any) {
        if (!this.active) return;
        var value = e.srcElement.data == "true";
        this.questionsAsked[this.questionsAsked.length-1].answered = true;
        this.questionsAsked[this.questionsAsked.length-1].answer = value;
        this.getNextQuestion();
    }

    completed(){

    }
}
