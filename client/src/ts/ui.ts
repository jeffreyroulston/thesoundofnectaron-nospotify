import * as si from "./spotify-interface";
import * as q from "./questions";
import Slider from "./slider";
import {el} from "./helpers";
import {TweenMax} from "gsap"
import Graphics from "./graphics";
import * as THREE from 'three';

var qDefault = function() { return { value: 0, include: false } };

export const COLOURS = {
    beige : "#FCF1DB",
    red : "#FF2000",
    purple : "#88009D",
    blue : "#00C1F5"
}

enum PageType {
    Login,
    RoundName,
    Question
}

export default class UI {
    private currentPage : PageType = PageType.Login;
    private currentRoundIdx : number = 0;
    private currentQuestionIdx : number = 0;

    private slider = new Slider(this, "#slider-q")

    private rounds : q.QuestionRound[] = [
        {
            round: 1,
            color: COLOURS.red,
            text : "All about the science of brewing. It's the details and the process - the part the brewers will really sing their teeth into. What's the brew style? What flavours are you heroing? Is it light or dark? These slider centric questions will be accompanied by 5 hero images that change based on the answer - all in the style of Nectaron 'visual collision,' half fruit - half something else." 
        },
        {
            round : 2,
            color: COLOURS.purple,
            text: "Now we've covered the basics, it's time to get experimental. Section Two is where we see mastery and mystery come into play. This section is all about imbuing their brew with personality. These questions will come to life visually through an 8 bit style. This will resonate with brewers as it borros from the nostalgia of retro gaming - something that brewers love."
        },
        {
            round: 3,
            color: COLOURS.blue,
            text: "Some text"
        }
    ]

    private questions : Array<q.SliderQuestion | q.MCQuestion> = [
        {
            round:1,
            type: q.QuestionType.Slider,
            params: si.QueryParameters.Valence,
            question : "How bitter would you like your brew?",
            minValue : 0,
            maxValue : 100,
            answer : 0
        },
        {
            round: 1,
            type: q.QuestionType.Slider,
            params: si.QueryParameters.Valence,
            question : "How tangy would you like your brew?",
            minValue : 0,
            maxValue : 100,
            answer : 0
        },
        {
            round: 2,
            type: q.QuestionType.MultiChoice,
            params: si.QueryParameters.Valence,
            question : "Choose your brewer",
            options : [
                {
                    value : "dino",
                    asset : ""
                },
                {
                    value : "dragon",
                    asset : ""
                },
                {
                    value : "unicorn",
                    asset : ""
                },
                {
                    value : "snake",
                    asset : ""
                }
            ],
            answer : ""
        }
    ]

    private recommendations: si.Track[] | undefined = [];
    private queryParameters: {[key: string]: q.QueryParameter }  = {
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
    public OnQuestionAnswered: {(totalQuestions: number, questionNumber: number, question: q.Question): void}[] = [];

    constructor() {
        this.init();
    }
    
    private init() {
        // set button bindings
        el("#startBtn").addEventListener("click", this.Login.bind(this));
        el(".next").addEventListener("click", this.next.bind(this));
        
        this.showLogin();
        // this.showRoundName();
        // this.showQuestion();
    }

    private setBG(color : string) {
        // sets background colour based on page
        el("body").style.backgroundColor = color;
        // this.graphics.switchColor(new THREE.Color(color), 0.5);
    }

    private showLogin() {
        this.setBG(COLOURS.beige);
        el("#login").style.display = "block";

        // bleed in the sound of
        TweenMax.from(".theSoundOf path", 0.75, {alpha:0, y:-50, scale:0, transformOrigin: "bottom", stagger: {each: 0.1, from:"random"}, delay:1});

        // bleed in nectaron
        TweenMax.from(".nectaron path, .nectaron polygon, .nectaron rect", 0.75, {alpha:0, y:50, scale:0, transformOrigin: "top", stagger: {each: 0.05, from:"random"}, delay:1});

        // show subheading and button
        TweenMax.from("#login .subheading, #login .btn", 0.5, {alpha:0, y:5, delay: 3.2});
    }

    private showRoundName() {
        this.currentPage = PageType.RoundName;
        this.currentRoundIdx++;
        var currentRound = this.rounds[this.currentRoundIdx-1];

        // set the things
        this.setBG(currentRound.color);
        el("#round-name .description").innerHTML = currentRound.text;
        el("#round-name").style.display = "block";

        // bleed in round
        TweenMax.fromTo(".round path", 0.75, {alpha:0, y:-50, scale:0, transformOrigin: "bottom"}, {alpha:1, y:0, scale:1, stagger: {each: 0.1, from:"random"}});

        // swing in numbers
        TweenMax.fromTo("#round-name .numbers li:first-child", 0.5, {alpha:0, y:50}, {alpha:1, y:0, delay:0.4});
        TweenMax.fromTo("#round-name .numbers li:nth-child(" + (this.currentRoundIdx+1).toString() + ")", 0.5, {alpha:0, scale:0.5, y:-50, rotate:-120}, {alpha:1, scale:1, y:0, rotate:0, delay:0.5});


        // show the round name
        TweenMax.fromTo(".round-name-text li:nth-child(" + this.currentRoundIdx.toString() + ")", 0.5, {alpha:0, x:-50}, {alpha:1, x:0, delay:1});

        // show the description box
        TweenMax.fromTo("#round-name .description, #round-name .btn", 0.6, {alpha:0, y:20}, {alpha:1, y:0, delay:1.1});
    }

    private showQuestion() { 
        this.currentPage = PageType.Question;
        var currentQuestion = this.questions[this.currentQuestionIdx];
        this.setBG(COLOURS.beige);

        switch(currentQuestion.type) {
            case q.QuestionType.Slider:
                this.slider.set(<q.SliderQuestion>currentQuestion);

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
                TweenMax.to("#login .subheading, #login .btn", 0.3, {alpha:0});
                
                // bleed out logo
                TweenMax.to("#login .bleed path, #login .bleed polygon, #login .bleed rect", 0.5, {alpha:0, y:50, scale:0, transformOrigin: "bottom", stagger: {each: 0.005, from:"random"}, delay:0.2});
                
                //hide login
                TweenMax.to("#login", 0, {alpha:0, delay: 1, onComplete: this.showRoundName.bind(this)});
                break;
            
            case PageType.RoundName:
                //hide button
                TweenMax.to("#round-name", 0.3, {alpha:0});
                TweenMax.to("#login", 0, {alpha:0, delay: 0.5, onComplete: this.showQuestion.bind(this)});

                break;
            
            case PageType.Question:
                var currentQuestion = this.questions[this.currentQuestionIdx];
                if (this.currentQuestionIdx < this.questions.length-1) {
                    // get next question
                    var nextQuestion = this.questions[this.currentQuestionIdx+1];
                    // check if it's the same or a new round
                    if (currentQuestion.round < nextQuestion.round) {
                        this.currentRoundIdx++;
                        this.showRoundName();
                    } else {
                        this.showQuestion();
                    }
                } else {
                    // the end!
                    console.log("the end has been reached");
                }
                break;
        }
    }

    public answerRetrieved(a : any) {
        this.questions[this.currentQuestionIdx].answer = a;
        console.log(this.questions[this.currentQuestionIdx]);
        this.next();
    }

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
    
}
