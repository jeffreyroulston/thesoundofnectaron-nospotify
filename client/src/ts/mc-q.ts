import UI from "./ui";
import {el, px, pxToInt} from "./helpers";
import {MCQuestion} from "./data";
import {TweenMax} from "gsap"

export default class MCQ {
    private ui : UI;
    private el : string;
    // private questionElement: HTMLElement;
    // private initialised : boolean = false;

    constructor(ui : UI, elementName: string) {
        this.ui = ui;
        this.el = elementName;
        // this.questionElement = el(this.el + " .question");

        // var options = document.querySelectorAll(this.el + " .mc-options li");
        // for (var i=0; i<options.length; i++) {
        //     options[i].addEventListener("click", this.answerRetrieved.bind(this));
        // }
    }

    set(q : MCQuestion) {
        // this.questionElement.innerHTML = q.question;

        // // show element
        // el(this.el).style.display = "block";
    }

    show() {
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
    }

    answerRetrieved(e: any) {
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
    }
}
