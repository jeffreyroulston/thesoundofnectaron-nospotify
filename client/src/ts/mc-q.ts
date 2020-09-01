import UI from "./ui";
import * as f from "./helpers";
import {mcqQuestions, MCQuestion} from "./data";
import {TweenMax} from "gsap"
import { AnimationMixer } from "three";

export default class MCQ {
    private ui : UI;
    private id : string;
    private el : HTMLElement;

    private questionIdx : number = 0;
    private questions : MCQuestion[] = mcqQuestions;
    private delay = 0.7;
    private time = 0.3;

    private questionElement: HTMLElement;
    private bgEl : HTMLElement = f.el("#icon-bg");
    private imgEl : HTMLUListElement = <HTMLUListElement>f.el(".mc-options");
    private imgs : HTMLElement[] = [];
    
    private initiated : boolean = false;
    private completed = false;

    // do this
    private interactable = true;

    // for looping animations
    private loopingAnimations : TweenMax[] = [];

    constructor(ui : UI, id: string) {
        this.ui = ui;
        this.id = id;
        this.el = f.el(this.id);

        // question copy
        this.questionElement = f.find(this.el, ".question");

        // this.ui = ui;
        // this.el = elementName;
        // this.questionElement = el(this.el + " .question");

        // var options = document.querySelectorAll(this.el + " .mc-options li");
        // for (var i=0; i<options.length; i++) {
        //     options[i].addEventListener("click", this.answerRetrieved.bind(this));
        // }
    }

    getNextQuestion() {
        if (this.questionIdx < mcqQuestions.length) {
            this.questionIdx++;
            this.set();
        } else {

        }
    }

    set() {
        // called from the ui and internally to set the question
        if (this.questionIdx < this.questions.length) {
            var q = mcqQuestions[this.questionIdx];

            // set the question copy
            this.questionElement.innerHTML = q.question;

            // private imgEl = f.el(".mc-options");
            // private imgs : HTMLElement[] = [];
            var currentChildrenCount = this.imgs.length;

            // create enough elements to house the options
            for (var i=0; i<q.options; i++) {
                if (i > this.imgs.length) {
                    let el = document.createElement("li");
                    el.addEventListener("mouseover", ()=> {
                        console.log("mouse enter")
                        // console.log(el.style.backgroundImage.replace(".png", "_grey.png"));
                        // this.bgEl.style.backgroundImage = el.style.backgroundImage.replace(".png", "_grey.png");
                        TweenMax.to(el, 0.2, {
                            scale:1.3
                        })
                    });
                    el.addEventListener("mouseleave", ()=> {
                        console.log("mouse leave");
                        TweenMax.to(el, 0.2, {
                            scale:1
                        })
                    });
                    // add a check to make sure it's visible
                    el.addEventListener("click", ()=> {
                        this.answerSelected(el);
                    })
                    this.imgEl.appendChild(el);
                    this.imgs.push(el)
                }
            }

            // set images
            for (var x=0; x<this.imgs.length; x++) {
                var data = "./assets/round3/" + (this.questionIdx+1).toString() + "_" + x.toString() + ".png";
                let src = "url(" + data + ")";

                this.imgs[x].style.backgroundImage = src;
                this.imgs[x].setAttribute("data", data);

                let d = this.initiated? 0.2*x : this.delay + 0.2*x 

                TweenMax.to(this.imgs[x], 0, {
                    y:0
                });

                TweenMax.fromTo(this.imgs[x], 0.2, {
                    alpha:0, delay:d
                }, {
                    alpha:1, delay:d
                });

                // this.loopingAnimations.push(
                //     // add to list of tweens to kill
                //     TweenMax.to(this.imgs[x], 0.5, {
                //         y:-50, repeat:-1, yoyo:true, delay:d
                //     })
                // )
            }


            console.log(q.options, this.imgs);
            this.show();

            // create children and add to images
            // for (var i=1; i<this.count+1; i++) {
            //     let el = document.createElement("li");
            //     let htmlEl = <HTMLElement>el;
                
            //     // store item to images list
            //     this.imgs.push(htmlEl)

            //     // add list item to EL element
            //     container.appendChild(el)

            //     htmlEl.className = i<=(this.count/2) ? "sharp" : "round";
            //     TweenMax.to(htmlEl, 0, {transformStyle:"preserve-3d"})
            // }

            // show it
            // this.show();
            // this.showCurrentQuestion();

        } else {
            console.log("beemo");
        }
    }

    show() {
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
    }

    hide() {
        TweenMax.to(this.questionElement, this.time, {
            alpha:0, x:-20, onComplete : ()=> {
                this.getNextQuestion();
            }
        })

        this.loopingAnimations.forEach((anim) => {
            anim.kill();
        })

        this.loopingAnimations = [];

        TweenMax.to(this.imgs, this.time, {
            alpha:0
        });
    }

    answerSelected(e:HTMLElement) {
        // this is the element that's been clicked
        console.log(e);
        mcqQuestions[this.questionIdx].answer = e.style.backgroundImage;
        this.hide();
    }

    // set(q : MCQuestion) {
        // this.questionElement.innerHTML = q.question;

        // // show element
        // el(this.el).style.display = "block";
    // }

    // show() {
        // var d = this.initialised ? 0.2 : 0.4;
        // this.initialised = true;

        // // start animating in elements
        // TweenMax.fromTo(this.el + " .question", 0.3, {
        //     alpha:0, x:-20
        // }, {
        //     alpha:1, x:0, delay: d
        // });
        
        // for (var i=0; i<this.options.length; i++) {
        //     TweenMax.fromTo(
        //         this.el + " #mc-" + this.options[i].value, 0.5,
        //         {
        //             display:"none",
        //             opacity:0,
        //             scale:0,
        //             rotate:200
        //         },
        //         {
        //             display:"inline-block",
        //             opacity:1,
        //             scale:1,
        //             rotate:0,
        //             ease:"bounce",
        //             // stagger:{
        //             //     each: 0.25,
        //             //     from: "random"
        //             // }
        //             delay:i*0.05 + d
        //         }
        //     );
        // }
    // }

    // answerRetrieved(e: any) {
    //     var value = e.srcElement.id.replace("mc-",);
    //     for (var i=0; i<this.options.length; i++) {
    //         TweenMax.to(
    //             this.el + " #mc-" + this.options[i].value, 0.2,
    //             {
    //                 display:"none",
    //                 alpha:0,
    //                 y:20,
    //                 delay:0.3
    //             },
    //         );
    //     }
    //     TweenMax.to(this.el + " .question", 0.3, {
    //         alpha:0, x:-20, delay:0.2, onComplete: ()=>{
    //         el(this.el).style.display = "none";
    //         this.ui.answerRetrieved(value);
    //     }});
    // }
}
