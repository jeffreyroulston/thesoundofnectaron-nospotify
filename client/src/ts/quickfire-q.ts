import UI from "./ui";
import {QuickFireQuestion, qfQuestions, COLORS} from "./data";
import * as f from "./helpers";
import {TweenMax} from "gsap"
import App from "./app";

export default class QuickFireQ {
    // the element
    private el : HTMLElement = f.elByID("quickfire-q");
    
    // index things....
    private questionIdx : number = 0;
    private questions : QuickFireQuestion[] = qfQuestions;
    private questionsUnanswered : QuickFireQuestion[] = [];
    private questionsAsked : QuickFireQuestion[] = [];
    private delay = 0.7;
    private time = 0.3;

    // elements
    private questionEl: HTMLElement = f.find(this.el, " .question");
    private timerEl : HTMLElement = f.find(this.el, "#timer");

    private timerCount : number = 1;
    private timerActive : boolean = true;
    private active : boolean = false;

    // called from ui
    public initiated = false;
    public isComplete = false;

    // bound to ui
    public roundComplete = (e: HTMLElement)=> {};

    constructor() {
        // copy the questions so we can pluck them out as we go
        for(var i=0; i<this.questions.length; i++) {
            this.questionsUnanswered.push(this.questions[i]);
        }

        // set the timer
        this.updateTimerElements();

        // get next question
        this.getNextQuestion();

        f.find(this.el, "#answer-wrapper li:first-child").addEventListener("click", this.yea.bind(this))
        f.find(this.el, "#answer-wrapper li:last-child").addEventListener("click", this.nah.bind(this))
    }

    set() {
        this.active = true;
        var delay = this.initiated ? 0 : this.delay;
        this.initiated = true;

        this.questionEl.innerHTML = this.questionsAsked[this.questionsAsked.length-1].question
        this.el.style.display = "block";

        TweenMax.fromTo(this.questionEl, 0.6, {
            alpha:0, x:-50
        }, {
            alpha:1, x:0, delay:delay
        });

        TweenMax.fromTo("#answer-wrapper li", 0.6, {
            alpha:0, y:50
        }, {
            alpha:1, y:0, stagger:0.1, delay: delay
        });
        
        TweenMax.fromTo(f.find(this.el, "#timer-wrapper"), 0.6, {
            alpha:0, x:200
        }, {
            alpha:1, x:0, delay: delay, onComplete: ()=> {
            setTimeout(this.updateTimer.bind(this), 1000)
        }})
    }

    getNextQuestion() {
        // edge case
        if (this.questionsUnanswered.length) {
            var idx = f.getRandomInt(0, this.questionsUnanswered.length-1);
            this.questionsAsked.push(this.questionsUnanswered[idx]);
            this.questionsUnanswered.splice(idx, 1);
            this.hideQuestion();
        } else {
            this.hideQuestion();
            this.timerActive = false;
            this.roundComplete(this.el);
        }
    }

    showQuestion() {
        this.active = true;
        this.questionEl.innerHTML = this.questionsAsked[this.questionsAsked.length-1].question

        TweenMax.fromTo(this.questionEl, 0.2, {
            alpha:0, x:-50
        }, {
            alpha:1, x:0
        });

        TweenMax.fromTo("#answer-wrapper li", 0.2, {
            alpha:0, y:50
        }, {
            alpha:1, y:0, stagger:0.05
        });
    }

    hideQuestion() {
        TweenMax.to(this.questionEl, 0.2, {
            alpha:0, x:50
        });

        TweenMax.to("#answer-wrapper li", 0.2, {
            alpha:0, y:50, stagger:0.05, onComplete : this.showQuestion.bind(this)
        });
    }

    updateTimer() {
        if (!this.timerActive) return;
        this.timerCount--;

        if (this.timerCount >= 0) {
            this.updateTimerElements();
            setTimeout(this.updateTimer.bind(this), 1000);
        } else {
            this.active = false;
            this.roundComplete(this.el);
        }
    }

    updateTimerElements() {
        var t = this.timerCount.toString();

        this.timerEl.innerHTML = t;

        if (this.timerCount < 6) {
            this.timerEl.style.color = COLORS.orange
        } else if (this.timerCount < 15) {
            this.timerEl.style.color = COLORS.yellow
        }
    }

    yea(e: any) {
        if (!this.active) return;
        App.audio.playSelectedSound();
        this.answerRetrieved(true);
    }

    nah(e: any) {
        if (!this.active) return;
        App.audio.playRejectedSound();
        this.answerRetrieved(false);
    }

    answerRetrieved(a : boolean) {
        // google analytics
        var message = this.questionsAsked[this.questionsAsked.length-1].question + " - " + a.toString();
        // console.log(message);
        gtag('event', 'answer retrieved', {'event_category' : 'quickfire', 'event_label' : message});

        this.questionsAsked[this.questionsAsked.length-1].answered = true;
        this.questionsAsked[this.questionsAsked.length-1].answer = a
        this.getNextQuestion();
    }
}
