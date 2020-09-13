import * as si from "./spotify-interface";
import * as data from "./data";
import * as f from "./helpers";
import {TweenMax} from "gsap"
import App from "./app";
import Landing from "./landing";
import Rounds from "./rounds";

var qDefault = function() { return { value: 0, include: false } };

enum PageType {
    Login,
    RoundName,
    Question,
    EndFrame
}

export default class UI {
    public ASSET_URL : string = "./assets/";

    // these are toggled depending on redirect state
    private LANDING : Landing | undefined;
    private ROUNDS : Rounds | undefined;

    // link to the app
    private app : App;

    // frame letters
    private frameEl: HTMLElement = f.elByID("frame-letters");
    private frameLetterFill : HTMLElement[] = f.findAll(this.frameEl, ".logo-letter-fill");

    // waves
    private wavesTopEl : HTMLElement = f.elByID("waves-top");
    private wavesBottomEl : HTMLElement = f.elByID("waves-bottom");
    private currentWaveColor: string = "purple";
    private wavesVisible : boolean = false;
    
    // nav
    private navWrapperEl : HTMLElement = f.elByID("nav-wrapper")
    private burgerEl : HTMLElement = f.elByID("burger");

    // pop up pages
    private currentPopupPageEl : HTMLElement | undefined = undefined;
    private currentPopupPage : string = "";

    // for between pages
    private elementsToHide : HTMLElement[] = [];
    
    // nav
    private navVisible : boolean = false;

    // assets
    private assetCounter : number = 0;
    private assetsLoaded : number= 0;

    // spotify
    // private authorized : boolean = false;

    // binder for images
    public ImagesDownloadedCallback = ()=>{};

    // bound to app
    public Login = ()=>{};

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

        // check if it's fucking internet explorer
        // if (!Modernizr.svg) {
        //     console.log("it's internet fucking explorer")
        //   }

        // Set custom height
        window.addEventListener('resize', this.onResize.bind(this));
        this.onResize();

        document.addEventListener('DOMContentLoaded', this.init.bind(this), false);
    }

    private init() {
        // we playing rounds on the redirect
        if (window.location.href.indexOf("sonicallydelicious") > -1) {
            // GAMEPLAY
            this.ASSET_URL = "../assets/";
            this.ROUNDS = new Rounds(this);
        } else {
            // LANDING PAGE
            this.LANDING = new Landing(this);
            this.LANDING.onLoginPressed = this.Login.bind(this)
        }

        // used for the mobile menu
        this.burgerEl.addEventListener("click", this.toggleNav.bind(this));

        // navigation elements
        f.findAll(this.navWrapperEl, "li").forEach(li => {
            li.addEventListener("click", this.togglePage.bind(this))
        })
    }

    private onResize() {
        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    }

    // public loadImages(images: string[]) {
    //     this.assetCounter += images.length;
        
    //     images.forEach((imgSrc)=> {
    //         let imgObject = new Image();
    //         imgObject.onload = this.imgDownloaded.bind(this);
    //         imgObject.src = this.ASSETURL + imgSrc;
    //     })
    // }

    private imgDownloaded() {
        console.log("image downloaded");
        this.assetsLoaded++;
        if (this.assetsLoaded == this.assetCounter) {
            this.ImagesDownloadedCallback();
        }
    }

    private clearHiddenElements() {
        // reset hidden elements
        this.elementsToHide = [];
    }

    public ShowBorder() {
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

    public ShowWaves(d: number) {
        TweenMax.fromTo([this.wavesTopEl, this.wavesBottomEl], 2, {display:"none", alpha:0}, {display:"block", alpha:0.95, ease: "linear", delay: d})
        TweenMax.fromTo(this.wavesBottomEl, 3, {y:100}, {y:0, ease: "linear", delay: d})
        TweenMax.fromTo(this.wavesTopEl, 3, {y:-100}, {y:0, ease: "linear", delay: d})
    }

    public HideWaves(delay: number) {
        TweenMax.to([this.wavesTopEl, this.wavesBottomEl], 1, {display:"none", alpha:0, ease: "linear"})
        TweenMax.to(this.wavesBottomEl, 1, {y:500, ease: "linear"})
        TweenMax.to(this.wavesTopEl, 1, {y:-500, ease: "linear"})
    }

    public ToggleWaveColor(colour: string) {
        // change visible wave colours
        TweenMax.fromTo(f.findAll(this.wavesTopEl, "." + this.currentWaveColor), 1, {alpha:1, display:"block"}, {alpha:0, display:"none"})

        TweenMax.fromTo(f.findAll(this.wavesBottomEl, "." + this.currentWaveColor), 1, {alpha:1, display:"block"}, {alpha:0, display:"none"})

        TweenMax.fromTo(f.findAll(this.wavesTopEl, "." + colour), 1, {alpha:0, display:"none"}, {alpha:1, display:"block"})

        TweenMax.fromTo(f.findAll(this.wavesBottomEl, "." + colour), 1, {alpha:0, display:"none"}, {alpha:1, display:"block"})

        this.currentWaveColor = colour;
    }

    public ToggleFrameColours(colour : string) {
        // change colour of letters in the border
        this.frameLetterFill.forEach((el)=> {
            el.style.fill = colour;
        })
    }

    public TransitionOut() {
        console.log("elements to hide", this.elementsToHide);
        // hide the elements
        TweenMax.to(this.elementsToHide, 0.5, {
            alpha:0, scale:0.95, display: "none", onComplete: this.clearHiddenElements.bind(this)
        })
    }

    public ShowQuestion() { 
        // called from UI.ROUNDS
        // this.currentPage = PageType.Question;
        this.SetBgColor(data.COLOURS.beige)

        // change the colour of the frame
        this.ToggleFrameColours(data.COLOURS.purple);

        // hide waves
        this.HideWaves(0);

        // hide the elements
        this.TransitionOut();
    }

    private showEndFrame() {
        // this.currentPage = PageType.EndFrame;
        // this.setBG(data.COLOURS.beige);
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
            display : "none", alpha: 0, scale:0.95
        }, {
            display: "block", alpha: 1, scale:1
        })
    }

    private hidePage(p : string, p2?: string) {
        TweenMax.fromTo(p, 0.5, {
            display : "block", alpha: 1, scale:1
        }, {
            display: "none", alpha: 0, scale:0.95
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

    // **************
    // PUBLIC
    // **************

    // public Authorize() {
    //     this.authorized = true;
    // }

    public SetVisibleElements(elements : HTMLElement[]) {
        elements.forEach((e)=> {
            this.elementsToHide.push(e);
        })
    }

    public SetBgColor(color: string) {
        f.el("body").style.backgroundColor = color;
    }

    // public TransitionOut(color : string) {
    //     // transition the background colour
    //     f.el("body").style.backgroundColor = color;

    //     // kill the looping animations
    //     // this.loopingAnimations.forEach((anim)=> {
    //     //     anim.kill();
    //     // })

    //     // this.loopingAnimations = [];

    //     // hide the elements
    //     TweenMax.to(this.elementsToHide, 0.5, {
    //         alpha:0, scale:0.95, display: "none", onComplete: this.clearHiddenElements.bind(this)
    //     })
    // }

    public LoadImages(images: string[]) {
        this.assetCounter += images.length;
        
        images.forEach((imgSrc)=> {
            let imgObject = new Image();
            imgObject.onload = this.imgDownloaded.bind(this);
            imgObject.src = this.ASSET_URL + imgSrc;
        })
    }

    // public RoundComplete(el: HTMLElement) {
    //     // Called from slider/MCQ/Quickfire
    //     this.elementsToHide.push(el);

    //     if (this.currentRoundIdx == this.questionGroups.length-1) {
    //         console.log("questions completed");
    //         this.showEndFrame();
    //     } else {
    //         this.next();
    //     }
    // }

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
    
    public ShowUserData(imageURL: string, displayName: string): void {
    }

    
}
