import * as si from "./spotify-interface";
import * as data from "./data";
import * as f from "./helpers";
import Slider from "./slider-q";
import MCQ from "./mc-q";
import QuickFireQ from "./quickfire-q";
import {TweenMax} from "gsap"
import App from "./app";

import gsap from "gsap";
import { DrawSVGPlugin } from "gsap/dist/DrawSVGPlugin";
import { easeCircleInOut, easeExpIn, easeSinIn } from "d3";
gsap.registerPlugin(DrawSVGPlugin);

var qDefault = function() { return { value: 0, include: false } };

enum PageType {
    Login,
    RoundName,
    Question,
    EndFrame
}

export default class UI {
    private app : App;

    private slider : Slider;
    private mcq : MCQ;
    private qfq : QuickFireQ;

    private currentPage : PageType = PageType.Login;
    private currentRoundIdx : number = -1;

    // main bits
    private graphicsEl: HTMLElement = f.elByID("canvas-container");
    private landingPageEl: HTMLElement = f.elByID("landing");
    private roundPageEl: HTMLElement = f.elByID("round-name");

    // frame letters
    private frameEl: HTMLElement = f.elByID("frame-letters");
    private frameLetterFill : HTMLElement[] = f.findAll(this.frameEl, ".logo-letter-fill");

    // description box for the round
    private descriptionEl : HTMLElement = f.find(this.roundPageEl, ".description");

    // waves
    private wavesTopEl : HTMLElement = f.elByID("waves-top");
    private wavesBottomEl : HTMLElement = f.elByID("waves-bottom");
    private currentWaveColor: string = "purple";
    
    // nav
    private navWrapperEl : HTMLElement = f.elByID("nav-wrapper")
    private burgerEl : HTMLElement = f.elByID("burger");

    // pop up pages
    private currentPopupPageEl : HTMLElement | undefined = undefined;
    private currentPopupPage : string = "";

    // for between pages
    private elementsToHide : HTMLElement[] = [];
    // private lastVisibleEl : HTMLElement;
    private nextBgColor : string = "";
    
    // nav
    private navVisible : boolean = false;

    // questions
    private questionGroups : any[] = [];
    private currentQuestionGroup: Slider | MCQ | QuickFireQ;

    // looping animations
    private loopingAnimations: TweenMax[] = [];

    private isMobile : boolean = false;

    // private recommendations: si.Track[] | undefined = [];
    // private queryParameters: {[key: string]: si.QueryParameter }  = {
    //     "acousticness" : qDefault(),
    //     "danceability" : qDefault(),
    //     "energy" : qDefault(),
    //     "instrumentalness" : qDefault(),
    //     "liveness" : qDefault(),
    //     "loudness" : qDefault(),
    //     "speechiness" : qDefault(),
    //     "valence" : qDefault(),
    //     "tempo" : qDefault()
    // }
    
    // PUBLIC VARIABLES
    // public OnLoginPressed = () => {};
    // public OnQuestionAnswered: {(totalQuestions: number, questionNumber: number, question: q.Question): void}[] = [];

    constructor(app : App) {
        // pass in the app to use for spotify interface
        this.app = app;

        // create the questions classes
        this.slider= new Slider(this);
        this.mcq = new MCQ(this, "#mc-q");
        this.qfq = new QuickFireQ(this, "#quickfire-q");


        // set the order (lol)
        this.questionGroups = [this.slider, this.mcq, this.qfq];
        // this.questionGroups = [this.mcq, this.slider, this.mcq];
        // this.questionGroups = [this.qfq, this.slider, this.mcq];

        // set initial question
        this.currentQuestionGroup = this.slider;

        // set the page to be hidden in graphics callback
        // this.lastVisibleEl = this.landingPageEl;

        // check if it's fucking internet explorer
        // if (!Modernizr.svg) {
        //     console.log("it's internet fucking explorer")
        //   }


        // var btns = elList(".next-btn:not(#start-btn)");
        f.find(this.landingPageEl, ".next-btn").addEventListener("click", this.next.bind(this))
        f.find(this.roundPageEl, ".next-btn").addEventListener("click", this.next.bind(this))

        // used for the mobile menu
        this.burgerEl.addEventListener("click", this.toggleNav.bind(this));

        // navigation elements
        f.findAll(this.navWrapperEl, "li").forEach(li => {
            li.addEventListener("click", this.togglePage.bind(this))
        })

        // set the height?
        f.el("body").style.height =  f.px(window.innerHeight);

        // kick it off
        // setTimeout(this.showLanding.bind(this), 1000);
        this.showLanding();
        // this.showRoundName();
        // this.showLoader();

        // First we get the viewport height and we multiple it by 1% to get a value for a vh unit
        let vh = window.innerHeight * 0.01;
        // Then we set the value in the --vh custom property to the root of the document
        document.documentElement.style.setProperty('--vh', `${vh}px`);

        // We listen to the resize event
        window.addEventListener('resize', () => {
            // We execute the same script as before
            let vh = window.innerHeight * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`);
        });
    }

    private setBG(color : string) {
        // set the next background color to turn the body in the graphics callback
        this.nextBgColor = color;
        // let complete = this.bgTransitionComplete.bind(this);
        f.el("body").style.backgroundColor = this.nextBgColor;

        this.loopingAnimations.forEach((anim)=> {
            anim.kill();
        })

        this.loopingAnimations = [];

        TweenMax.to(this.elementsToHide, 0.5, {
            alpha:0, scale:0.95, display: "none", onComplete: this.clearHiddenElements.bind(this)
        })

    }

    private clearHiddenElements() {
        this.elementsToHide = [];
    }

    private showBorder() {
        // show the border letters
        // N E C
        TweenMax.fromTo(f.findAll(this.frameEl, "li.top"), 0.5, {y:-100}, {y:0})
        // T
        TweenMax.fromTo(f.findAll(this.frameEl,"li.left.middle"), 0.5, {x:-100}, {x:0})
        // A
        TweenMax.fromTo(f.findAll(this.frameEl, "li.right.middle"), 0.5, {x:100}, { x:0})
        // R O N
        TweenMax.fromTo(f.findAll(this.frameEl, "li.bottom"), 0.5, {y:100}, {y:0})
    }

    private toggleWaves(colour: string) {
        // change visible wave colours
        TweenMax.fromTo(f.findAll(this.wavesTopEl, "." + this.currentWaveColor), 1, {
            alpha:1, display:"block"
        }, {
            alpha:0, display:"none"
        })

        TweenMax.fromTo(f.findAll(this.wavesBottomEl, "." + this.currentWaveColor), 1, {
            alpha:1, display:"block"
        }, {
            alpha:0, display:"none"
        })

        TweenMax.fromTo(f.findAll(this.wavesTopEl, "." + colour), 1, {
            alpha:0, display:"none"
        }, {
            alpha:1, display:"block"
        })

        TweenMax.fromTo(f.findAll(this.wavesBottomEl, "." + colour), 1, {
            alpha:0, display:"none"
        }, {
            alpha:1, display:"block"
        })

        this.currentWaveColor = colour;
    }

    // private hideWaves() {
    //     TweenMax.to([this.wavesBottomEl, this.wavesTopEl], 1, {
    //         alpha:0, display:"none"
    //     })
    // }

    private toggleFrameColours(colour : string) {
        // change colour of letters in the border
        this.frameLetterFill.forEach((el)=> {
            el.style.fill = colour;
        })
    }

    public showLanding() {
        // // reset the cookie
        document.cookie = "landingShown"
        this.landingPageEl.style.display = "block";

        // make the frame text white
        this.toggleFrameColours(data.COLOURS.beige);

        // make the border come in - this is used on round name as well?
        this.showBorder();

        // logos
        var logoDesktop = f.find(this.landingPageEl, ".logo-wrapper-large");
        var logoMobile = f.find(this.landingPageEl, ".logo-wrapper-mobile");
        var isDesktop = f.getStyle(logoDesktop, "display") == "block";
        var logoContainer = isDesktop ? logoDesktop : logoMobile;

        var logoHeadElements= f.findAll(logoContainer, ".logo-head-fill");
        var logoElements= f.findAll(logoContainer, ".logo-fill");

        // other elements
        var hop = f.elByID("hop");
        var subheading = f.find(this.landingPageEl, ".subheading")
        var btn = f.find(this.landingPageEl, "#start-btn");

        // elements to hide
        this.elementsToHide.push(this.landingPageEl);
        this.elementsToHide.push(hop);

        // WAVES
        TweenMax.fromTo([this.wavesTopEl, this.wavesBottomEl], 2, {
            display:"none", alpha:0
        }, {
            display:"block", alpha:0.95, ease: "linear"
        })

        TweenMax.fromTo(this.wavesBottomEl, 3, {
            y:100
        }, {
            y:0, ease: "linear"
        })

        TweenMax.fromTo(this.wavesTopEl, 3, {
            y:-100
        }, {
            y:0, ease: "linear"
        })

        // HOP  
        TweenMax.fromTo(hop, 1, {
            display:"none", scale: 0.95, alpha:0
        }, {
            display:"block",scale:1, alpha:0.9, ease: easeSinIn
        })

        // BOUNCE DAT HOP
        this.loopingAnimations.push(TweenMax.to(hop, 2, {
            scale:0.99, ease: "linear", delay:1, repeat:-1, yoyo:true
        }))

        // NECTARON
        TweenMax.from(logoElements, 1, {
            alpha:0, scale:0, transformOrigin: "center", delay:1.5, stagger: {
                each:0.04, from: "random"
            }
        })

        // TweenMax.from(logoElements, 0.2, {
        //     alpha:0, delay:1.5, stagger: {
        //         each:0.04, from: "random"
        //     }
        // })
        
        // THE SOUND OF
        TweenMax.from(logoHeadElements, 1, {
            alpha:0, scale:0, rotation:-45, y:-200, delay:2, stagger: {
                each:0.1
            }
        })
        
        // TweenMax.from(".logo-head path:nth-child(even)", 1, {
        //     alpha:0, scale:0, rotation:45, y:50, delay:1, stagger: {
        //         each:0.1, from: "random"
        //     }
        // })
        
        // TweenMax.from(".logo-head path:nth-child(odd)", 1, {
        //     alpha:0, scale:0, rotation:-45, y:-200, delay:1, stagger: {
        //         each:0.1, from: "random"
        //     }
        // })
        
        // BREW YOUR OWN....
        TweenMax.from(subheading, 0.5, {
            alpha:0, y:5, delay:3
        })
        
        // ARROW
        TweenMax.from(btn, 0.5, {
            alpha:0, scale:0.9, delay:4
        })
    }

    public showRoundName() {
        window.onbeforeunload = ()=> {
            document.cookie = "showLanding"
        }

        // // set current page to be a round
        this.currentPage = PageType.RoundName;

        // // increment the current round
        this.currentRoundIdx++;
        var currentRound = data.ROUNDS[this.currentRoundIdx];

        // // do the background
        this.setBG(currentRound.color);

        // set wave colour
        this.toggleWaves(currentRound.waveColor);

        // set round copy
        this.descriptionEl.innerHTML = "<p>" + currentRound.text + "</p>";

        // set the arrow colour
        // f.find(this.roundPageEl, ".arrow-line").style.stroke = data.CONTRAST[currentRound.color];
        // f.find(this.roundPageEl, ".arrow-head").style.fill = data.CONTRAST[currentRound.color];

        // if round 3, change the colour of zero
        if (this.currentRoundIdx == 2) {
            f.find(this.roundPageEl, ".numbers li:first-child-path").style.stroke = data.COLOURS.purple;
        }

        // change the colour of the frame
        this.toggleFrameColours(data.COLOURS.beige);

        // show elements
        this.roundPageEl.style.display = "block";

        // VARIABLES
        var d = 0.7; // set delay time
        var btn = f.find(this.roundPageEl, ".next-btn");
        var fruit = f.find(this.roundPageEl, ".fruit-whole");

        // this is 0
        var roundNumberZero = f.find(this.roundPageEl, ".numbers li:first-child");

        // this is the round number (1, 2, 3)
        var nextRoundNumber = f.find(this.roundPageEl, ".numbers li:nth-child(" + (this.currentRoundIdx +2).toString() + ")");

        // this is the name of the round
        var nextRoundName = f.find(this.roundPageEl, ".round-name-text li:nth-child(" + (this.currentRoundIdx +1).toString() + ")");

        // set hidden inline elements to visible
        TweenMax.fromTo([roundNumberZero, nextRoundNumber, nextRoundName], 0, {
            display: "none"
        }, {
            display: "inline-block"
        })

        // show round number "0"
        TweenMax.fromTo(f.find(roundNumberZero, "path"), 2, {
            drawSVG : "0"
        }, {
            drawSVG : "100%", ease: easeCircleInOut, delay: d
        });

        // show variable round number (1,2,3)
        TweenMax.fromTo(f.find(nextRoundNumber, "path"), 2, {
           drawSVG : "0"
        }, {
            drawSVG : "100%", ease: easeCircleInOut, delay: d
        });

        // float in 'round'
        var paths = f.findAll(this.roundPageEl, ".round path");
        for (var i=0; i<paths.length; i++) {
            let xVal = f.getRandom(-300, 300)
            let yVal = f.getRandom(-500, 0);
            let r = f.getRandom(-180, 180);

            TweenMax.fromTo(paths[i], 1, {
                alpha:0, scale:0, x:xVal, y: yVal, rotation: r
            }, {
                alpha:1, scale:1, x:0, y:0, rotation:0, delay:2*d + i*0.1
            })
        }

        // show the round name
        TweenMax.fromTo(nextRoundName, 0.5, {
            alpha:0, x:-50
        }, {
            alpha:1, x:0, delay:2*d+1
        });

        // console.log(window.innerWidth);
        // show the description box
        if (window.innerWidth > 900) {
            TweenMax.fromTo(this.descriptionEl, 0.5, {
                alpha:0, y:-50, rotation:-17
            }, {
                alpha:1, y:0, rotation: -17, delay:2*d+1
            });

        } else {
            // show the description box
            TweenMax.fromTo(this.descriptionEl, 1, {
                alpha:0, y:-50
            }, {
                alpha:1, y:0, delay:2*d+1
            });
        }

        // bring in the fruit
        TweenMax.fromTo(fruit, 1, {
            y:-window.innerHeight, rotate:90
        }, {
            y:0, rotate:0, delay:2*d+0.5
        })

        // bop the fruit
        // this.loopingAnimations.push(TweenMax.to(fruit, 1, {
        //     y:5, repeat:-1, ease: "linear", yoyo:true, delay:2*d+1.5
        // }))


        // show the arrow
        TweenMax.fromTo(btn, 0.5, {
            alpha:0, scale:0.9
        }, {
            alpha:1, scale: 1, ease: "linear", delay:2*d+2.5
        })

        // bounce the arrow
        // this.loopingAnimations.push(
        //     TweenMax.to(btn, 1, {
        //         scale:0.9, ease: "linear", delay:2*d+3, repeat:-1, yoyo:true
        //     })
        // )

        // WAVES
        var wavesAreVisible = f.getStyle(this.wavesTopEl, "display");
        if (!wavesAreVisible) {
            // if waves aren't visible, fade them in
            TweenMax.fromTo([this.wavesTopEl, this.wavesBottomEl], 2, {
                display:"none", alpha:0
            }, {
                display:"block", alpha:0.95, delay: d, ease: "linear"
            })
        }
    
        // move the waves in
        TweenMax.fromTo(this.wavesBottomEl, 2, {
            y:100
        }, {
            y:0, delay: d, ease: "linear"
        })

        TweenMax.fromTo(this.wavesTopEl, 2, {
            y:-100
        }, {
            y:0, delay: d, ease: "linear"
        })
        
    }

    private showQuestion() { 
        this.currentPage = PageType.Question;
        this.setBG(data.COLOURS.beige);
        
        // change the colour of the frame
        this.toggleFrameColours(data.COLOURS.purple);
        
        this.currentQuestionGroup = this.questionGroups[this.currentRoundIdx];
        this.currentQuestionGroup.set();

        // move the waves out
        TweenMax.to([this.wavesTopEl, this.wavesBottomEl], 1, {
            display:"none", alpha:0, ease: "linear"
        })

        TweenMax.to(this.wavesBottomEl, 1, {
            y:500, ease: "linear"
        })

        TweenMax.to(this.wavesTopEl, 1, {
            y:-500, ease: "linear"
        })
    }

    private togglePage(e: any) {
        // used for nav (About/Contact/Order)
        var target = "#" + e.srcElement.getAttribute("data");
        
        if (this.currentPopupPage == target) {
            e.srcElement.classList.toggle("active");
            this.hidePage(this.currentPopupPage);
            this.currentPopupPage = "";
            this.currentPopupPageEl = undefined;
        } else {            
            switch (target) {
                case "link":
                    // go to the nz hops website
                    break;
                case "deg":
                    // show nelson?
                    break;
                default:
                    if (this.currentPopupPageEl) {
                        // of there's a page currently showing, so hide it and show the next
                        this.currentPopupPageEl.classList.toggle("active");
                        e.srcElement.classList.toggle("active");
                        this.hidePage(this.currentPopupPage, target);
                    } else {
                        // check if it's mobile


                        e.srcElement.classList.toggle("active");
                        this.showPage(target);
                    }
                    break;
            }

            this.currentPopupPage = target;
            this.currentPopupPageEl = e.srcElement;
        }
        

    }

    private showPage(p : string) {
        TweenMax.fromTo(p, 0.5, {
            display : "none", alpha: 0, x:-window.innerWidth
        }, {
            display: "block", alpha: 1, x:0
        })
    }

    private hidePage(p : string, p2?: string) {
        TweenMax.fromTo(p, 0.5, {
            display : "block", alpha: 1, x:0
        }, {
            display: "none", alpha: 0, x:window.innerWidth
        })

        if (p2) {
            this.showPage(p2);
        }
    }

    private toggleNav() {
        // called from the burger/close
        if (this.navVisible) {
            // close the nav
            TweenMax.to(this.navWrapperEl, 0.5, {
                display: "none", x:-window.innerWidth*2
            })

            this.navVisible = false;

        } else {
            // show the nav
            TweenMax.fromTo(this.navWrapperEl, 0.5, {
                display: "none", x:-window.innerWidth*2
            }, {
                display: "block", x:0
            })

            TweenMax.fromTo("#nav li", 0.5, {
                alpha:0, y:50
            }, {
                alpha: 1, y:0, delay:0.2, stagger : {
                    each: 0.1
                }
            })

            this.navVisible = true;
        }

    }

    private login() {
        this.app.Login();
    }

    private next() {
        console.log("next");
        switch (this.currentPage) {
            case PageType.Login:
                // show the round name
                this.showRoundName();
                break;
            
            case PageType.RoundName:
                // set the page to be hidden in graphics callback
                // this.lastVisibleEl = this.roundPageEl;
                this.elementsToHide.push(this.roundPageEl);
                this.showQuestion();
                break;
            
            case PageType.Question:
                // show the round name
                this.showRoundName();
                break;
        }
    }

     private onResize(e: any) {
        //  if (window.innerWidth)
     }

    private showEndFrame() {
        this.currentPage = PageType.EndFrame;
        this.setBG(data.COLOURS.beige);
        // anim.endFrameIn.play();
        // endFrameIn.to("#end-frame", 0, {
        //     display: "block"
        // }).fromTo("#playlist-title", 0.3, {
        //     alpha:0, x:-20
        // }, {
        //     alpha:1, x:0
        // }, 0.4).fromTo("#playlist-desc", 0.3, {
        //     alpha:0, x:-20
        // }, {
        //     alpha:1, x:0
        // }, 0.5).fromTo("#album-cover", 0.3, {
        //     alpha:0, scale:0.5
        // }, {
        //     alpha: 1, scale:1, delay: 0.7
        // }, 0.7)
    }

    public answerRetrieved(a : any) {
        // data.QUESTIONS[this.currentQuestionIdx].answer = a;
        // console.log(data.QUESTIONS[this.currentQuestionIdx]);
        // this.next();
    }

    public roundComplete(el: HTMLElement) {
        // this.lastVisibleEl = el;
        this.elementsToHide.push(el);
        if (this.currentRoundIdx == this.questionGroups.length-1) {
            this.questionsCompleted();
        } else {
            this.next();
        }
    }

    public questionsCompleted() {
        // called from quick fire question class
        // use the current question index to discount unanswered quickfire questions
        console.log("questions completed");
        this.showEndFrame();

    }

    // CALLBACK FROM APP
    public loginSuccessful() {
        this.next();
        // this.showRoundName();
    }

    public startRounds() {
        this.showRoundName();
    }

    public OnUserData(type: si.DataType, data: si.Data): void {

        // switch(type) {
        //     case si.DataType.UserProfile:
        //         const profile: si.UserProfile = (data as si.UserProfile);
        //         if (profile.images != null && profile.DisplayName != null) {
        //             this.ShowUserData(profile.images[0], profile.DisplayName);
        //         }

        //         break;

        //     case si.DataType.Recommendations:
        //         this.recommendations = (data as si.Track[]);
        //         break;

        //     case si.DataType.TopArtists:
        //         // this.artists = (data as si.Artist[]);
        //         break;
        // }
    }


    // public Login() {
    //     this.OnLoginPressed();
    // }
    
    public ShowUserData(imageURL: string, displayName: string): void {
    }
    
}
