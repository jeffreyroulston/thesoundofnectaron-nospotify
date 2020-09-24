import * as f from "./helpers";
import ROUND from "./rounds";
import {mcqQuestions, MCQuestion} from "./data";
import {TweenMax} from "gsap"

export default class MCQ {
    // the element
    private el : HTMLElement = f.elByID("mc-q");
    
    // index things....
    private questionIdx : number = 0;
    private currentQuestion : MCQuestion | undefined;
    private time = 0.3;

    // elements
    private questionElement: HTMLElement = f.find(this.el, ".question");
    private optionEl : HTMLElement = f.find(this.el, ".mc-options");
    private optionEls : HTMLElement[] = f.findAll(this.optionEl, "li");
    private canGraphicEls : HTMLElement[] = [];

    // do this
    private interactable = true;

    // for looping animations
    private loopingAnimations : TweenMax[] = [];

    // called from ui
    public initiated = false;
    public isComplete = false;

    // bound to ui
    public roundComplete = (e: HTMLElement)=> {};

    constructor() {
        // add graphic elements
        mcqQuestions.forEach((q)=> {
            this.canGraphicEls.push(f.find(this.el, "#"+q.id));
        })

        // bind interactions
        this.optionEls.forEach((e)=> {
            e.addEventListener("mouseover", ()=> {
                TweenMax.to(e, 0.1, {scale:1.1, zIndex:50})
            });

            e.addEventListener("mouseleave", ()=> {
                TweenMax.to(e, 0.1, {scale:1, zIndex:1})
            });

            e.addEventListener("click", this.optionSelected.bind(this));
        })

        window.onresize = this.onResize.bind(this)
        this.onResize();
    }

    onResize() {
        if (this.isComplete) return;
        
        // size the list options
        if (this.currentQuestion) {
            // resize options box
            var w = this.optionEl.getBoundingClientRect().width;
            this.optionEl.style.height = f.px(w/this.currentQuestion.options.length);

            // resize options
            var w2 = f.px((w-20)/this.currentQuestion.options.length);
            this.optionEls.forEach((e)=> {
                e.style.width = w2;
            })
        }
    }

    private getImgPath(idx: number) {
        var prefix = "url(./assets/round2/q" + (this.questionIdx+1).toString() + "/"
        var name = this.currentQuestion?.options[idx] + ".png)";
        // console.log(prefix + name)
;        return prefix + name;
    }

    private getCanPath(s : string) {
        // expected format = "url(./assets/round2/qz/x_y.png)"
        return s.replace(".png", "_can.png");
    }

    public set() {
        // called from the ui and internally to set the question
        this.currentQuestion = mcqQuestions[this.questionIdx];

        // set the question copy
        this.questionElement.innerHTML = this.currentQuestion.question;

        // set the things
        for (var i=0; i<this.currentQuestion.options.length; i++) {
            this.optionEls[i].style.backgroundImage = this.getImgPath(i);
            this.optionEls[i].setAttribute("data", this.currentQuestion?.options[i]);
        }

        // show it
        this.show();
    }

    show() {
        if (!this.currentQuestion) return;
        var d = 0;

        if (!this.initiated) {
            d = 1;
            this.initiated = true;

            // bring in the can
            TweenMax.fromTo(f.find(this.el, "#can"), this.time*2, {x:window.innerWidth, alpha:0}, {alpha: 1, x: 0, delay:d})
        }

        this.interactable = true;
        this.el.style.display = "block";
        this.onResize();

        // show the question
        TweenMax.fromTo([this.questionElement, this.optionEl], this.time, {
            alpha:0, x:-20
        }, {
            alpha:1, x:0, delay: d
        });

        // set all the options as display block
        for (var i=0; i<this.currentQuestion.options.length; i++) {
            this.optionEls[i].style.display = "inline-block"
        }

        // var options = [];

        // show the options
        // console.log("options length", this.currentQuestion.options.length)
        for (var i=0; i<this.currentQuestion.options.length; i++) {
            // options.push(this.optionEls[i])
            TweenMax.fromTo(this.optionEls[i], this.time, {alpha:0}, {alpha:1, delay: d + (0.1*i)});
            // TweenMax.fromTo(this.optionEls[i], this.time, {
            //     y:50, alpha:0
            // }, {
            //     y:0, alpha:1, delay : d + this.time + (0.1*i), ease: "linear"
            // })

            // // bounce them
            // this.loopingAnimations.push(TweenMax.to(this.optionEls[i], this.time, {
            //     y:50, repeat:-1, yoyo:true, delay: d + (this.time*2) + (0.1*i), ease: "linear"
            // }))

            // // bounce them
            this.loopingAnimations.push(TweenMax.fromTo(this.optionEls[i], 0.3, {
                y:-20
            }, {
                y:20, repeat:-1, yoyo:true, delay: d + (0.1*i), ease: "linear"
            }))
        }

        // f.shuffle(options);

        // for (var i=0; i<options.length; i++) {
        //     TweenMax.fromTo(options[i], this.time, {alpha:0}, {alpha:1, delay: d + (0.1*i)});
        //     // TweenMax.fromTo(this.optionEls[i], this.time, {
        //     //     y:50, alpha:0
        //     // }, {
        //     //     y:0, alpha:1, delay : d + this.time + (0.1*i), ease: "linear"
        //     // })

        //     // // bounce them
        //     this.loopingAnimations.push(TweenMax.fromTo(options[i], this.time, {
        //         y:-10
        //     }, {
        //         y:10, repeat:-1, yoyo:true, delay: d + (0.1*i), ease: "linear"
        //     }))
        // }


        // resize
        this.onResize();
    }


    hide() {
        this.loopingAnimations.forEach((anim)=> {
            anim.kill();
        })

        this.loopingAnimations = [];

        TweenMax.to([this.questionElement, this.optionEl], this.time, {
            alpha:0, x:20, onComplete : ()=> {
                this.getNextQuestion();
            }
        })
    }

    private optionSelected(e: any) {
        if (!this.interactable) return;

        // get the answer
        var bg = e.srcElement.style.backgroundImage;
        var answer = e.srcElement.getAttribute("data");
        mcqQuestions[this.questionIdx].answer = answer;

        // set the thing
        this.canGraphicEls[this.questionIdx].style.backgroundImage = this.getCanPath(bg);

        // peel it on
        TweenMax.to(this.canGraphicEls[this.questionIdx], this.time, {alpha:1})

        // no double clicks here
        this.interactable = false;

        // get the next one
        this.hide();
    }

    private getNextQuestion() {
        // hide option elements
        this.optionEls.forEach((e)=> {
            e.style.display = "none";
        })

        if (this.questionIdx < mcqQuestions.length-1) {
            this.questionIdx++;
            this.set();
        } else {

            if (window.innerWidth > 1024) {
                // question set completed
                TweenMax.to(f.find(this.el, ".text-column"), 0, {width: "0"});
                TweenMax.to(f.find(this.el, ".content-column"), this.time*2, {left: "-25%"});
            } else {
                TweenMax.to(f.find(this.el, ".content-column"), this.time*2, {scale: 1.5});
            }

            // do something sparkly here
            setTimeout(this.finished.bind(this), 1000);
        }
    }

    private finished() {
        this.roundComplete(this.el);
    }
}
