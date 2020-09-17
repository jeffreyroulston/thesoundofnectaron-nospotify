import * as si from "./spotify-interface";
import * as data from "./data";
import * as f from "./helpers";
import {TweenMax} from "gsap"
import App from "./app";
import Landing from "./landing";
import Rounds from "./rounds";
import Modernizr from "modernizr";

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
    private currentFrameColor = data.COLOURS.beige;

    // waves
    private wavesTopEl : HTMLElement = f.elByID("waves-top");
    private wavesBottomEl : HTMLElement = f.elByID("waves-bottom");
    private currentWaveColor: string = "purple";

    // end frame
    private endFrameEl : HTMLElement = f.elByID("end-frame");
    
    // nav
    private navWrapperEl : HTMLElement = f.elByID("nav-wrapper")
    private navEl : HTMLElement = f.elByID("nav");
    private burgerEl : HTMLElement = f.elByID("burger");
    public smallLogoEl : HTMLElement = f.elByID("headerSmall");

    // pop up pages
    private currentPopupPageEl : HTMLElement | undefined = undefined;
    private currentPopupPage : string = "";

    // about page
    private aboutEl : HTMLElement = f.elByID("about");
    private aboutHopTopEl : HTMLElement = f.find(this.aboutEl, ".hopTop");
    private aboutHopBottomEl : HTMLElement = f.find(this.aboutEl, ".hopBottom")
    
    // faq page
    private faqEl : HTMLElement = f.elByID("faq");

    // for between pages
    private elementsToHide : HTMLElement[] = [];

    // loader
    private loaderCircleWrapperEl = f.elByID("loader-circle-wrapper");
    private loaderCircleEl = f.elByID("loader-circle");
    private loaderPercentEl = f.elByID("loader-percent");
    private currentLoaderCount = 0;
    private nextLoaderCount = 0;
    private imgCount = 0;
    private imgsLoaded = 0;
    
    // nav
    private navVisible : boolean = false;
    private frameVisible : boolean = false;

    // looping animations
    private loopingAnimations : TweenMax[] = [];

    private nope : boolean = false;

    // is mobile
    public isMobileSize : boolean = false;

    // bound to app
    public Login = ()=>{};

    constructor(app : App) {
        // pass in the app to use for spotify interface
        this.app = app;

        // check if it's a shit browser
        if (!Modernizr.svg) {
            this.nope = true;
            f.elByID("shit-browser-alert").style.display = "block";
        }

        // this.nope = true;
        // f.elByID("shit-browser-alert").style.display = "block";

        // Set custom height
        window.addEventListener('resize', this.onResize.bind(this));
        document.addEventListener('DOMContentLoaded', this.init.bind(this), false);
    }

    private init() {
        if (this.nope) return;

        // check dimensions
        this.isMobileSize = this.burgerEl.getBoundingClientRect().width > 1;

        // used for the mobile menu
        this.burgerEl.addEventListener("click", this.toggleNav.bind(this));

        // navigation elements
        f.findAll(this.navWrapperEl, "li").forEach(li => {
            li.addEventListener("click", this.togglePage.bind(this))
        })

        // we playing rounds on the redirect
        if (window.location.href.indexOf("access_token") > -1) {
            // GAMEPLAY
            this.ROUNDS = new Rounds(this);

            // start
            this.ROUNDS.CreatePlaylist = this.app.CreatePlaylist.bind(this.app);
            this.ROUNDS.showRound(0)
        } else {
            // LANDING PAGE
            this.LANDING = new Landing(this);
            this.LANDING.onLoginPressed = this.Login.bind(this);
            this.loadImages(data.preloadList)
            // if (this.isCached(this.ASSET_URL + data.preloadList[0])) {
            //     this.LANDING.show();
            // } else {
            //     this.loaderInit();
            // }
            // this.LANDING.show();
        }

        // this.showEndFrame("nothing");
    }

    private loaderInit() {
        this.loaderCircleWrapperEl.style.height = "200px";
        this.loaderCircleWrapperEl.style.width = "200px";
        this.loadImages(data.preloadList)
    }

    async loadImages(images: string[]) {
        this.imgCount = images.length;
        console.log(this.imgCount);
        
        images.forEach((imgSrc)=> {
            let imgObject = new Image();
            imgObject.onload = this.incrementLoader.bind(this);
            imgObject.src = this.ASSET_URL + imgSrc;
        })
    }

    private incrementLoader() {
        this.imgsLoaded++;
        var percent = this.imgsLoaded/this.imgCount * 100;
        console.log(percent);

        // this.loaderPercentEl.innerHTML = Math.round(percent).toString() + "%";
        // if (this.imgsLoaded == this.imgCount) {
        //     this.onResize();
        // } else {
        //     var scale = (percent > 1) ? percent : 1
        //     this.loaderCircleEl.style.transform = "scale(" + scale + ")";
        // }

        if (this.imgsLoaded == this.imgCount) this.LANDING?.show();
    }

    private isCached(src: string) {
        var image = new Image();
        image.src = src;
        console.log(src, image.complete)
        return image.complete;
    }

    private checkMobileSize() {
        var m = this.burgerEl.getBoundingClientRect().width > 1;
        
        if (m != this.isMobileSize) {
            if (this.isMobileSize) {
                this.changeToDesktop();
            } else {
                this.changeToMobile();
            }
        }

        this.isMobileSize = m;
    }

    private changeToDesktop() {
        // small logo
        TweenMax.to(this.smallLogoEl, 0.5, {display: "none", y:-100})

        // reset nav
        this.navVisible = false;
        this.navWrapperEl.removeAttribute("style");

        TweenMax.fromTo(this.navEl, 0.2, {
            display: "none", y:-100
        }, {
            display: "block", y:0
        })

        this.ROUNDS?.changeToDesktop();
    }

    private changeToMobile() {
        this.navWrapperEl.removeAttribute("style");

        // small logo
        console.log(this.LANDING);
        if (this.LANDING == undefined) TweenMax.fromTo(this.smallLogoEl, 0.5, {display: "none", y:-100}, {display: "block", y:0})

        this.ROUNDS?.changeToMobile();
    }

    private onResize() {
        if (this.nope) return;

        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        this.checkMobileSize();

        // change the position of the nav
        if (this.isMobileSize) {
            // remove the left offset
            this.navEl.removeAttribute("style")
            // remove the colour
            f.findAll(this.navWrapperEl, "*").forEach((el)=> {
                el.removeAttribute("style");
            })

            // console.log(f.findAll(this.navWrapperEl, "*"))
        } else {
            if (window.innerWidth <= 768) {
                console.log("remove nav width");
                this.navEl.style.left = "0";
            } else {
                console.log("reposition nav");
                // is desktop...
                this.navEl.style.left = f.px(window.innerWidth/4 - 50 - this.navEl.getBoundingClientRect().width/2)
            }
        }

        // frame
        if (window.innerWidth <= 768) {
            if (this.frameVisible) {
                this.frameOut();
                this.frameVisible = false;
            }

        } else {
            if (!this.frameVisible) {
                this.frameIn();
                this.frameVisible = true;
            }
        }
    }

    private clearHiddenElements() {
        // reset hidden elements
        this.elementsToHide = [];
    }


    public setVisibleElements(elements : HTMLElement[]) {
        elements.forEach((e)=> {
            this.elementsToHide.push(e);
        })
    }

    public setBgColor(color: string) {
        f.el("body").style.backgroundColor = color;
    }

    public showNavBar() {
        // show the border letters
        // this.frameIn();

        // change the position of the nav
        if (this.isMobileSize) {
            // is mobile
            this.navEl.removeAttribute("style");

            // small logo
            console.log(this.LANDING);
            if (this.LANDING == undefined) TweenMax.fromTo(this.smallLogoEl, 0.5, {display: "none", y:-100}, {display: "block", y:0})
        } else {
            // show the listed nav
            TweenMax.fromTo(this.navEl, 0.5, {dispplay: "none", y:-100}, {display:"block", y:0})
        }

    }

    private frameIn() {
        // N E C
        TweenMax.fromTo(f.findAll(this.frameEl, "li.top"), 0.5, {display:"none", y:-100}, {y:0, display:"block"})
        // T
        TweenMax.fromTo(f.findAll(this.frameEl,"li.left.middle"), 0.5, {display:"none", x:-100}, {x:0, display:"block"})
        // A
        TweenMax.fromTo(f.findAll(this.frameEl, "li.right.middle"), 0.5, {display:"none", x:100}, { x:0, display:"block"})
        // R O N
        TweenMax.fromTo(f.findAll(this.frameEl, "li.bottom"), 0.5, {display:"none", y:100}, {y:0, display:"block"})
    }

    private frameOut() {
        // N E C
        TweenMax.fromTo(f.findAll(this.frameEl, "li.top"), 0.5, {display:"block", y:-0}, {y:-100, display:"none"})
        // T
        TweenMax.fromTo(f.findAll(this.frameEl,"li.left.middle"), 0.5, {display:"block", x:-0}, {x:-100, display:"none"})
        // A
        TweenMax.fromTo(f.findAll(this.frameEl, "li.right.middle"), 0.5, {display:"block", x:0}, { x:100, display:"none"})
        // R O N
        TweenMax.fromTo(f.findAll(this.frameEl, "li.bottom"), 0.5, {display:"block", y:0}, {y:100, display:"none"})
    }

    public showWaves(d: number) {
        TweenMax.fromTo([this.wavesTopEl, this.wavesBottomEl], 2, {display:"none", alpha:0}, {display:"block", alpha:0.95, ease: "linear", delay: d})
        TweenMax.fromTo(this.wavesBottomEl, 3, {y:100}, {y:0, ease: "linear", delay: d})
        TweenMax.fromTo(this.wavesTopEl, 3, {y:-100}, {y:0, ease: "linear", delay: d})
    }

    public hideWaves(delay: number) {
        TweenMax.to([this.wavesTopEl, this.wavesBottomEl], 1, {display:"none", alpha:0, ease: "linear"})
        TweenMax.to(this.wavesBottomEl, 1, {y:500, ease: "linear"})
        TweenMax.to(this.wavesTopEl, 1, {y:-500, ease: "linear"})
    }

    public toggleWaveColor(color: string) {
        // change visible wave colors
        TweenMax.fromTo(f.findAll(this.wavesTopEl, "." + this.currentWaveColor), 1, {alpha:1, display:"block"}, {alpha:0, display:"none"})

        TweenMax.fromTo(f.findAll(this.wavesBottomEl, "." + this.currentWaveColor), 1, {alpha:1, display:"block"}, {alpha:0, display:"none"})

        TweenMax.fromTo(f.findAll(this.wavesTopEl, "." + color), 1, {alpha:0, display:"none"}, {alpha:1, display:"block"})

        TweenMax.fromTo(f.findAll(this.wavesBottomEl, "." + color), 1, {alpha:0, display:"none"}, {alpha:1, display:"block"})

        this.currentWaveColor = color;
    }

    public toggleFrameColours(color : string, setValue : boolean) {
        // change color of letters in the border
        this.frameLetterFill.forEach((el)=> {
            el.style.fill = color;
        })

        if (this.isMobileSize) {
            // change the color of the nav
            // f.findAll(this.navWrapperEl, "*").forEach((el)=> {
            //     el.removeAttribute("style");
            // })

            // change the color of the burger
            f.findAll(this.burgerEl, ".burger-fill").forEach((el)=> {
                el.style.fill = color;
            })

            // change the color of the small header logo
            f.findAll(this.smallLogoEl, ".logo-small-fill").forEach((el)=> {
                el.style.fill = color;
            })
        } else {
            f.findAll(this.navWrapperEl, "*").forEach((el)=> {
                el.style.color = color;
            })
        }

        if (setValue) {
            this.currentFrameColor = color;
        }
    }

    public transitionOut() {
        console.log("elements to hide", this.elementsToHide);
        // hide the elements
        TweenMax.to(this.elementsToHide, 0.5, {
            alpha:0, scale:0.95, display: "none", onComplete: this.clearHiddenElements.bind(this)
        })
    }

    public showQuestion() { 
        // called from UI.ROUNDS
        // this.currentPage = PageType.Question;
        this.setBgColor(data.COLOURS.beige)

        // change the color of the frame
        this.toggleFrameColours(data.COLOURS.purple, true);

        // hide waves
        this.hideWaves(0);

        // hide the elements
        this.transitionOut();
    }

    public showEndFrame(description: string) {
        // this.currentPage = PageType.EndFrame;
        this.setBgColor(data.COLOURS.beige);
        this.toggleFrameColours(data.COLOURS.purple, true);

        f.elByID("playlist-desc").innerHTML = description;

        this.endFrameEl.style.display = "block";
        var d = 0.5;

        TweenMax.fromTo(f.find(this.endFrameEl, "#playlist-title"), 0.5, {
            alpha: 0, x:-100
        }, {
            alpha: 1, x:0, delay: d
        });

        TweenMax.fromTo(f.find(this.endFrameEl, "#playlist-desc"), 0.5, {
            alpha: 0, x:-100
        }, {
            alpha: 1, x:0, delay: d+0.1
        });

        TweenMax.fromTo(f.find(this.endFrameEl, "#album-cover"), 0.5, {
            alpha:0, scale:0.9
        }, {
            alpha: 1, scale:1, delay: d+0.2
        });
    }

    private togglePage(e: any) {
        // used for nav (About/Contact/Order)
        var target = e.srcElement.getAttribute("data");
        
        if (this.currentPopupPage == target) {
            // if it's the same page, close it
            e.srcElement.classList.toggle("active");
            this.hidePage(this.currentPopupPage);
            this.currentPopupPage = "";
            this.currentPopupPageEl = undefined;

            // change the frame colours
            this.toggleFrameColours(this.currentFrameColor, false);

        } else {  
            if (target == "about" || target == "faq") {
                // change the color of the frame but don't set it as the current (so it can be reverted)
                this.toggleFrameColours(data.COLOURS.purple, false);

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
            }          

            this.currentPopupPage = target;
            this.currentPopupPageEl = e.srcElement;
        }
    }

    private showPage(p : string) {
        // animations for different pages
        switch(p) {
            case "about" :
                // bop the fruit
                this.loopingAnimations.push(TweenMax.fromTo(this.aboutHopTopEl, 3, {
                    rotate: -10, x:-50
                }, {
                    rotate: 10, x:50, repeat: -1, yoyo: true, ease: "linear"
                }))

                this.loopingAnimations.push(TweenMax.to(this.aboutHopBottomEl, 1.5, {
                    y: -20, repeat: -1, yoyo: true, ease: "linear"
                }))

                this.show(this.aboutEl);
                break;
            case "faq":
                this.show(this.faqEl);
                break;
            default:
                break;
        }
    }

    private hidePage(p : string, p2?: string) {
        // animations for different pages
        switch(p) {
            case "about" :
                this.hide(this.aboutEl)
                break;
            case "faq":
                this.hide(this.faqEl)
                break;
            default:
                break;
        }

        if (p2) {
            this.showPage(p2);
        }
    }

    private show(e: HTMLElement) {
        TweenMax.fromTo(e, 0.15, {
            display : "none", alpha: 0, scale:0.98
        }, {
            display: "block", alpha: 1, scale:1
        })
    }

    private hide(e: HTMLElement) {
        TweenMax.fromTo(e, 0.15, {
            display : "block", alpha: 1, scale:1
        }, {
            display: "none", alpha: 0, scale:0.98
        })
    }

    private toggleNav() {
        // called from the burger/close
        if (this.navVisible) {
            // close the nav
            this.toggleFrameColours(this.currentFrameColor, false);

            TweenMax.to(this.navWrapperEl, 0.5, {
                display: "none", x:-window.innerWidth*2
            })

            this.navVisible = false;

        } else {
            // show the nav
            this.toggleFrameColours(data.COLOURS.purple, false);

            TweenMax.fromTo(this.navWrapperEl, 0.5, {
                display: "none", x:-window.innerWidth*2
            }, {
                display: "block", x:0
            })

            TweenMax.fromTo(f.findAll(this.navEl, "li"), 0.5, {
                alpha:0, y:50
            }, {
                alpha: 1, y:0, delay:0.2, stagger : {
                    each: 0.1
                }
            })

            // turn it into a close sign?
            // TweenMax.to(f.find(this.burgerEl, ".left-line"), 0.2, {rotate:-45, y:20})

            // TweenMax.to(f.find(this.burgerEl, ".right-line"), 0.2, {rotate:45, y:-50})

            this.navVisible = true;
        }

    }

    public playlistCreated(url: string) {
        console.log("playlist created", url)
        f.elByID("playlist-url").innerHTML = url;
    }
}
