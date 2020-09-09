import * as f from "./helpers";
import ROUND from "./rounds";
import {mcqQuestions, MCQuestion} from "./data";
import {TweenMax} from "gsap"

export default class MCQ {
    // the element
    private el : HTMLElement = f.elByID("mc-q");
    
    // index things....
    private questionIdx : number = 0;
    private questions : MCQuestion[] = mcqQuestions;
    private currentQuestion : MCQuestion | undefined;
    private delay = 0.7;
    private time = 0.3;

    // elements
    private questionElement: HTMLElement = f.find(this.el, ".question");
    private optionEl : HTMLElement = f.find(this.el, ".mc-options");
    private listEls : HTMLElement[] = f.findAll(this.optionEl, "li");
    private canEl : HTMLElement = f.find(this.el, "#can");
    private canGraphicEls : HTMLElement[] = f.findAll(this.canEl, "li");
    private imgs : HTMLElement[] = [];

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
        window.onresize = this.onResize.bind(this)
        // this.onResize();

        // var options = document.querySelectorAll(this.el + " .mc-options li");
        // for (var i=0; i<options.length; i++) {
        //     options[i].addEventListener("click", this.answerRetrieved.bind(this));

        this.listEls.forEach((e)=> {
            e.addEventListener("mouseover", ()=> {
                TweenMax.to(e, 0.1, {scale:1.3})
            });

            e.addEventListener("mouseleave", ()=> {
                TweenMax.to(e, 0.1, {scale:1})
            });

            e.addEventListener("click", this.optionSelected.bind(this));
        })

        this.onResize();
    }

    onResize() {
        // size the list options
        if (this.currentQuestion) {
            var w = this.optionEl.getBoundingClientRect().width;
            this.optionEl.style.height = f.px(w/this.currentQuestion.optionCount);
        }
    }

    private optionSelected(e: any) {
        // get the answer
        var answer = e.srcElement.style.backgroundImage;
        mcqQuestions[this.questionIdx].answer = answer;

        // set the thing
        this.canGraphicEls[this.questionIdx].style.backgroundImage = this.getCanPath(answer);
    }

    private getNextQuestion() {
        console.log("get next question:")
        if (this.questionIdx < mcqQuestions.length-1) {
            console.log("progress");
            this.questionIdx++;
            this.set();
        } else {
            console.log("stop");
            this.isComplete = true;
            setTimeout(()=> {
                this.loopingAnimations.forEach((anim)=> {
                    anim.pause();
                })
                    this.roundComplete(this.el);
                }, 2000)
        }
    }

    private getImgPath(idx: number) {
        var prefix = "url(./assets/round2/";
        var name = (this.questionIdx+1).toString() + "_" + idx.toString();
        var suffix = ".png)";
        return prefix + name + suffix
    }

    private getCanPath(s : string) {
        // expected format = "url(./assets/round2/x_y.png)"
        return s.replace(".png", "_can.png");
    }

    public set() {
        // called from the ui and internally to set the question
        if (this.questionIdx < this.questions.length) {
            var path = "./assets/round2/";
            this.currentQuestion = mcqQuestions[this.questionIdx];

            // set the question copy
            this.questionElement.innerHTML = this.currentQuestion.question;

            // set the things
            for (var i=0; i<this.currentQuestion.optionCount; i++) {
                this.listEls[i].style.backgroundImage = this.getImgPath(i);
            }

            // private imgEl = f.el(".mc-options");
            // private imgs : HTMLElement[] = [];
            // var currentChildrenCount = this.imgs.length;

            // // create enough elements to house the options
            // for (var i=0; i<q.options; i++) {
            //     if (i > this.imgs.length) {
            //         let el = document.createElement("li");
            //         el.addEventListener("mouseover", ()=> {
            //             console.log("mouse enter")
            //             // console.log(el.style.backgroundImage.replace(".png", "_grey.png"));
            //             // this.bgEl.style.backgroundImage = el.style.backgroundImage.replace(".png", "_grey.png");
            //             TweenMax.to(el, 0.2, {
            //                 scale:1.3
            //             })
            //         });
            //         el.addEventListener("mouseleave", ()=> {
            //             console.log("mouse leave");
            //             TweenMax.to(el, 0.2, {
            //                 scale:1
            //             })
            //         });
            //         // add a check to make sure it's visible
            //         el.addEventListener("click", ()=> {
            //             this.answerSelected(el);
            //         })
            //         this.imgEl.appendChild(el);
            //         this.imgs.push(el)
            //     }
            // }

            // set images
            // for (var x=0; x<this.imgs.length; x++) {
            //     var data = "./assets/round2/" + (this.questionIdx+1).toString() + "_" + x.toString();
            //     data = data + (this.questionIdx == 1 ? ".svg" : ".png");
            //     let src = "url(" + data + ")";

            //     this.imgs[x].style.backgroundImage = src;
            //     this.imgs[x].setAttribute("data", data);

                // TweenMax.to(this.imgs)

                // TweenMax.to(this.imgs[x], 0, {
                //     y:0
                // });

                // TweenMax.fromTo(this.imgs[x], 0.2, {
                //     alpha:0, delay:d
                // }, {
                //     alpha:1, delay:d
                // });

                // this.loopingAnimations.push(
                //     // add to list of tweens to kill
                //     TweenMax.to(this.imgs[x], 0.5, {
                //         y:-50, repeat:-1, yoyo:true, delay:d
                //     })
                // )
            // }

            // let d = this.initiated? 0 : this.delay

            // TweenMax.fromTo(this.imgs, this.time, {
            //     alpha:0, y:10
            // }, {
            //     alpha:1, y:0, delay:d, stagger: {
            //         each:0.1
            //     }
            // })


            // console.log(q.options, this.imgs);
            // this.show();

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
            this.show();
            // this.showCurrentQuestion();

        } else {
        }
    }

    show() {
        var delay = this.initiated ? 0 : 1;
        this.initiated = true;
        this.el.style.display = "block";
        this.onResize();
        
        // show the element with images
        // this.imgEl.style.display = "block";

        // show the question
        // TweenMax.fromTo(this.questionElement, this.time, {
        //     alpha:0, x:-20
        // }, {
        //     alpha:1, x:0, delay: delay
        // });
    }

    hide() {
        // TweenMax.to(this.questionElement, this.time, {
        //     alpha:0, x:-20, onComplete : ()=> {
        //         this.getNextQuestion();
        //     }
        // })

        // TweenMax.to(this.imgs, this.time, {
        //     alpha:0
        // });
    }

    answerSelected(e:HTMLElement) {
        // this is the element that's been clicked
        // console.log(e);
        // mcqQuestions[this.questionIdx].answer = e.style.backgroundImage;
        // switch (this.questionIdx) {
        //     case 0:
        //         // body
        //         f.el("#head1").style.backgroundImage = e.style.backgroundImage;

        //         // displace buddy
        //         TweenMax.to("#drinker2", 0, {
        //             x:200
        //         })

        //         // pop out drinker 1
        //         f.el("#drinker1").style.display = "block";
        //         TweenMax.from("#drinker1", 0.5, {
        //             y:1000
        //         })

        //         this.loopingAnimations.push(
        //             TweenMax.to("#drinker1", 0.5, {
        //                 y:-100, repeat:-1, yoyo: true, delay:0.5
        //             })
        //         )
                
        //         break;
        //     case 1:
        //         // location
        //         // change the copy to white
        //         var el = f.find(this.el, ".question-wrapper")
        //         el.classList.toggle("boxed");
                
        //         f.el("#scene-bg").style.backgroundImage = e.style.backgroundImage;
        //         TweenMax.fromTo("#scene-bg", 0.5, {
        //             height: 0
        //         }, {
        //             height: '100vh'
        //         })
        //         break;
        //     case 2:
        //         // buddy
        //         f.el("#head2").style.backgroundImage = e.style.backgroundImage;

        //         // displace drinker 1
        //         TweenMax.to("#drinker1", 0.5, {
        //             x:-200
        //         })

        //         // pop out buddy
        //         f.el("#drinker2").style.display = "block";
        //         TweenMax.from("#drinker2", 0.5, {
        //             y:1000
        //         });

        //         this.loopingAnimations.push(
        //             TweenMax.to("#drinker2", 0.5, {
        //                 y:-50, repeat:-1, yoyo: true, delay:0.5
        //             })
        //         )
        //         break;
        //     case 3:
        //         // pairing
        //         var count = 10;
        //         var container = f.el("#pairings")
        //         var elements : HTMLElement[] = [];

        //         for (var i=1; i<count+1; i++) {
        //             let el = document.createElement("li");
        //             elements.push(el);

        //             el.className = "pairing";
        //             el.style.backgroundImage = e.style.backgroundImage;
        //             el.style.left = f.px(i* (window.innerWidth/count));
        //             container.appendChild(el)
        //         }

        //         f.shuffle(elements);
        //         for (var x=0; x<elements.length; x++) {
        //             this.loopingAnimations.push(
        //                 TweenMax.fromTo(elements[x], f.getRandom(1, 3), {
        //                     y:window.innerHeight
        //                 }, {
        //                     y:-window.innerHeight, ease:"linear", delay:i*0.1, repeat:-1 
        //                 })
        //             )
        //         }

        //         // f.el("#food1").style.backgroundImage = e.style.backgroundImage;
        //         // // f.el("#food2").style.backgroundImage = e.style.backgroundImage;

        //         // // pop out buddy
        //         // f.el("#food1").style.display = "block";

        //         // TweenMax.from("#food1", 0.5, {
        //         //     y:1000
        //         // });

        //         // this.loopingAnimations.push(
        //         //     TweenMax.to("#food1", 0.5, {
        //         //         y:-window.innerHeight/2, rotate:360, repeat:-1, yoyo: true, delay:0.5
        //         //     })
        //         // )

        //         break;
        //     case 4:
        //         // vessel
        //         var count = 10;
        //         var container = f.el("#pairings")
        //         var elements : HTMLElement[] = [];

        //         for (var i=1; i<count+1; i++) {
        //             let el = document.createElement("li");
        //             elements.push(el);

        //             el.className = "pairing";
        //             el.style.backgroundImage = e.style.backgroundImage;
        //             el.style.left = f.px(i* (window.innerWidth/count));
        //             container.appendChild(el)
        //         }

        //         f.shuffle(elements);
        //         for (var x=0; x<elements.length; x++) {
        //             this.loopingAnimations.push(
        //                 TweenMax.fromTo(elements[x], f.getRandom(1, 3), {
        //                     y:window.innerHeight
        //                 }, {
        //                     y:-window.innerHeight, ease:"linear", delay:i*0.1, repeat:-1 
        //                 })
        //             )
                    
        //         }
        //         // f.el("#vessel1").style.backgroundImage = e.style.backgroundImage;
        //         // f.el("#vessel2").style.backgroundImage = e.style.backgroundImage;
        //         break;

        // }
        // this.hide();
    }

    completed() {
        // console.log("completed!!");
        // this.bgEl.style.display = "none";
        // this.el.style.display = "none";
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
