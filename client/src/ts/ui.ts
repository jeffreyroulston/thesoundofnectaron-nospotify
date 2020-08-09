import * as si from "./spotify-interface";
import {Question, QuestionType, QueryParameter, SliderQuestion} from "./questions";
import {TweenLite, TweenMax} from "gsap"

var qDefault = function() { return { value: 0, include: false } };

enum PageType {
    Login,
    RoundName,
    Question
}

class Slider {
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

    constructor(elementName: string) {
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
            // top fruit
            console.log(this.prevValue, this.value, "top fruit");
            this.scaleTopFruit();
        } else if (this.value < this.mid) {
            console.log(this.prevValue, this.value, "bottom fruit");
            this.scaleBottomFruit();
        } else {
            //mid point
            if (this.prevValue > this.mid) {
                // going down so top fruit
                console.log(this.prevValue, this.value, "top fruit");
                this.scaleTopFruit();
            } else {
                // bottom fruit
                console.log(this.prevValue, this.value, "bottom fruit");
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
}

export default class UI {
    private currentPage : PageType = PageType.Login;
    private currentRound : number = 0;
    private currentQuestionIdx : number = 0;

    private slider = new Slider("#slider-q")
    private questions : SliderQuestion[] = [
        {
            round:1,
            type: QuestionType.Slider,
            params: si.QueryParameters.Valence,
            question : "How bitter would you like your brew?",
            minValue : 0,
            maxValue : 100,
            answer : 0
        },
        {
            round: 1,
            type: QuestionType.Slider,
            params: si.QueryParameters.Valence,
            question : "How tangy would you like your brew?",
            minValue : 0,
            maxValue : 100,
            answer : 0
        }
    ]

    private colours = {
        beige : "#FCF1DB",
        red : "#FF2000"
    }

    private recommendations: si.Track[] | undefined = [];
    private queryParameters: {[key: string]: QueryParameter }  = {
        "acousticness" : qDefault(),
        "danceability" : qDefault(),
        "energy" : qDefault(),
        "instrumentalness" : qDefault(),
        "liveness" : qDefault(),
        "loudness" : qDefault(),
        "speechiness" : qDefault(),
        "valence" : qDefault(),
        "tempo" : qDefault()
    }
    
    // PUBLIC VARIABLES
    public OnLoginPressed = () => {};
    public OnQuestionAnswered: {(totalQuestions: number, questionNumber: number, question: Question): void}[] = [];

    constructor() {
        this.init();
    }
    
    private init() {
        // set button bindings
        el("#startBtn").addEventListener("click", this.Login.bind(this));
        el(".next").addEventListener("click", this.next.bind(this));
        
        // this.showLogin();
        this.showRoundName();
    }

    private setBG(color : string) {
        // sets background colour based on page
        el("body").style.backgroundColor = color;
    }

    private showLogin() {
        this.setBG(this.colours.beige);
        el("#login").style.display = "block";

        // bleed in the sound of
        TweenMax.from(".theSoundOf path", 0.75, {opacity:0, y:-50, scale:0, transformOrigin: "bottom", stagger: {each: 0.1, from:"random"}, delay:1});

        // bleed in nectaron
        TweenMax.from(".nectaron path, .nectaron polygon, .nectaron rect", 0.75, {opacity:0, y:50, scale:0, transformOrigin: "top", stagger: {each: 0.05, from:"random"}, delay:1});

        // show subheading and button
        TweenMax.from("#login .subheading, #login .btn", 0.5, {opacity:0, y:5, delay: 3.2});
        // pulse button?
        // TweenMax.to("#login .btn", 0.75, {scale:1.02, repeat:-1, delay:2.85, ease:"linear", yoyo:true, yoyoEase:"linear"})
    }

    private showRoundName() {
        this.currentPage = PageType.RoundName;
        this.currentRound++;

        this.setBG(this.colours.red);
        el("#round-name").style.display = "block";

        // bleed in round
        TweenMax.from(".round path", 0.75, {opacity:0, y:-50, scale:0, transformOrigin: "bottom", stagger: {each: 0.1, from:"random"}});

        // swing in numbers
        TweenMax.from("#round-name .numbers li:first-child", 0.5, {opacity:0, y:50, delay:0.4});
        TweenMax.from("#round-name .numbers li:nth-child(" + (this.currentRound+1).toString() + ")", 0.5, {opacity:0, scale:0.5, y:-50, rotate:-120, delay:0.5});

        // show the round name
        TweenMax.from(".round-name-text li:nth-child(" + this.currentRound.toString() + ")", 0.5, {opacity:0, x:-50, delay:1});

        // show the description box
        TweenMax.from("#round-name .description, #round-name .btn", 0.6, {opacity:0, y:20, delay:1.1});
    }

    private showQuestion() {
        var q = this.questions[this.currentQuestionIdx];
        this.setBG(this.colours.beige);

        switch(q.type) {
            case QuestionType.Slider:
                this.slider.set(q);

                // show question
                this.slider.show();
                break;
        }
    }

    private next() {
        // hide current page
        // show next page
        switch (this.currentPage) {
            case PageType.Login:
                //hide button
                TweenMax.to("#login .subheading, #login .btn", 0.3, {opacity:0});
                
                // bleed out logo
                TweenMax.to("#login .bleed path, #login .bleed polygon, #login .bleed rect", 0.5, {opacity:0, y:50, scale:0, transformOrigin: "bottom", stagger: {each: 0.005, from:"random"}, delay:0.2});
                
                //hide login
                TweenMax.to("#login", 0, {alpha:0, delay: 1, onComplete: this.showRoundName.bind(this)});
                break;
            
            case PageType.RoundName:
                //hide button
                TweenMax.to("#round-name", 0.3, {opacity:0});
                TweenMax.to("#login", 0, {alpha:0, delay: 0.5, onComplete: this.showQuestion.bind(this)});

                break;
            
            case PageType.Question:
                break;
        }
    }

    // private setCurrentPage() {
    //     console.log(this.currentPage);

    //     // hide current page
    //     if (this.previousPage) {
    //         // el(this.previousPage.pageElement).classList.toggle("active");
    //         el(this.previousPage.pageElement).style.display = "none";
    //     }

    //     // show the next page
    //     // el(this.currentPage.pageElement).classList.toggle("active");
    //     el(this.currentPage.pageElement).style.display = "block";

    //     // set question bits
    //     if (this.currentPage.pageType == PageType.Question) {
    //         this.setQuestion();
    //     }

    //     this.setBG();

    // }

    // private getNextPage() {
    //     this.currentPageIdx++;
    //     this.currentPage = this.pages[this.currentPageIdx];
    //     this.previousPage = this.pages[this.currentPageIdx-1];
    //     this.setCurrentPage();
    // }


    // private setQuestion() {
    //     if (!this.currentPage.question) return;
    //     var q = this.currentPage.question;
    //     var e = this.currentPage.pageElement;

    //     // set question copy
    //     el(e + " .question p").innerHTML = q.question;

    //     switch (q.type) {
    //         case QuestionType.Slider:
    //             // set slider parameters
    //             q = <SliderQuestion>q;
    //             var slider = <HTMLInputElement>document.querySelector("#sliderInput");
    //             slider.min = q.minValue.toString();
    //             slider.max = q.maxValue.toString();
    //             break;

    //         case QuestionType.MultiChoice:
    //             break;

    //         case QuestionType.QuickFire:
    //             break;
    //     }

    //     this.currentQuestion = q;

    // }

    // private sliderChange(e : any) {
    //     if (!this.currentPage.question) return;

    //     // get the width and the value of the slider 
    //     this.sliderWidth = e.srcElement.clientWidth;
    //     this.sliderValue = e.srcElement.value;

    //     // get the next position of the arrow
    //     // move the triangle to match the position of the slider thumb
    //     this.sliderArrowEl.style.left = (((this.sliderValue - this.currentQuestion.minValue) / (this.currentQuestion.maxValue - this.currentQuestion.minValue) * (this.sliderWidth)) - this.sliderArrowEl.getBoundingClientRect().width/2).toString() + "px"

    //     this.sliderFruitScaleChange()
    // }

    // private sliderFruitScaleChange() {
    //     console.log(this.sliderPreviousValue, this.sliderValue);

    //     if (this.sliderValue < ((this.currentQuestion.maxValue - this.currentQuestion.minValue) / 2) ) {
    //         // bottom fruit
    //         this.sliderBottomFruitEl.style.width = px(this.sliderBottomFruitEl.getBoundingClientRect().width + (this.sliderPreviousValue < this.sliderValue ? -2 : 2));
    //         this.sliderBottomFruitEl.style.top = px(parseInt(getComputedStyle(this.sliderBottomFruitEl).top.replace(/[^\d-]/g, "")) + (this.sliderPreviousValue < this.sliderValue ? 1 : -1))
    //     } else {
    //         // top fruit
    //         this.sliderTopFruitEl.style.width = px(this.sliderTopFruitEl.getBoundingClientRect().width + (this.sliderPreviousValue < this.sliderValue ? 2 : -2))
    //         this.sliderTopFruitEl.style.bottom = px(parseInt(getComputedStyle(this.sliderTopFruitEl).bottom.replace(/[^\d-]/g, "")) + (this.sliderPreviousValue < this.sliderValue ? -1 : 1))
    //     }

    //     this.sliderPreviousValue = this.sliderValue;  
    // }

    // private scaleFruit(el: HTMLElement, increment : number) {
    //     el.style.width = (el.getBoundingClientRect().width + increment).toString() + "px";
    // }

    // CALLBACK FROM APP
    public loginSuccessful() {
        console.log("login successful");
        this.next();
    }

    public OnUserData(type: si.DataType, data: si.Data): void {

        switch(type) {
            case si.DataType.UserProfile:
                const profile: si.UserProfile = (data as si.UserProfile);
                if (profile.images != null && profile.DisplayName != null) {
                    this.ShowUserData(profile.images[0], profile.DisplayName);
                }

                break;

            case si.DataType.Recommendations:
                this.recommendations = (data as si.Track[]);
                break;

            case si.DataType.TopArtists:
                // this.artists = (data as si.Artist[]);
                break;
        }
    }


    public Login() {
        this.OnLoginPressed();
    }
    
    public ShowUserData(imageURL: string, displayName: string): void {
    }
    
    // here we will activate and populate one of three different html question templates depending on question type
    // once the answer is chosen, we use that callback to pass the selection back up
    // public showQuestion(question: Question): void {
    // }

    // private showCurrentQuestion() {
    // }

}

export function el(e: string) : HTMLElement{
    return <HTMLElement>document.querySelector(e);
}

function querySelector(query: string, el : HTMLElement | null = null) {
    return el ? el.querySelector<HTMLInputElement>(query) : document.querySelector<HTMLInputElement>(query);
}

function px (n : number) : string{
    return n.toString() + "px";
}

function pxToInt(s : string) : number {
    return parseInt(s.replace(/[^\d-]/g, ""));
}

function rand(min:number, max:number) {

}