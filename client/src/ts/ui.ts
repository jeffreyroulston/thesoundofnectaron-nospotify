import * as si from "./spotify-interface";
import * as data from "./data";
import * as f from "./helpers";
import {TweenMax} from "gsap"
import App from "./app";
import Landing from "./landing";
import Rounds from "./rounds";
import Graphics from "./graphics";
import * as THREE from "three";
// import Modernizr from "modernizr";

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
    private loaderEl = f.elByID("loader")
    private loaderCircleWrapperEl = f.find(this.loaderEl, "#loader-circle-wrapper");
    private loaderCircleEl = f.find(this.loaderEl, "#loader-circle");
    private loaderPercentEl =f.find(this.loaderEl, "#loader-percent");
    private imgCount = 0;
    private imgsLoaded = 0;
    
    // nav
    private navVisible : boolean = false;
    private frameVisible : boolean = false;

    // looping animations
    private loopingAnimations : TweenMax[] = [];
    private inPageLoopingAnimations : TweenMax[] = [];

    private nope : boolean = false;

    // for end page
    private name : string = "Your";

    // is mobile
    public isMobileSize : boolean = false;

    // bound to app
    public Login = ()=>{};

    constructor(app : App) {
        // pass in the app to use for spotify interface
        this.app = app;

        // check if it's a shit browser
        // if (!Modernizr.svg) {
        //     this.nope = true;
        //     f.elByID("shit-browser-alert").style.display = "block";
        // } else {
        //     window.addEventListener('resize', this.onResize.bind(this));
        //     document.addEventListener('DOMContentLoaded', this.init.bind(this), false);
        // }
        document.addEventListener('DOMContentLoaded', this.init.bind(this), false);
    }

    private copyText(text: string) {
        const el = document.createElement('textarea');
        el.value = text;
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);
    }

    private init() {
        if (this.nope) return;

        // resize callback
        window.addEventListener('resize', this.onResize.bind(this));

        // check dimensions
        this.isMobileSize = this.burgerEl.getBoundingClientRect().width > 1;

        // used for the mobile menu
        this.burgerEl.addEventListener("click", this.toggleNav.bind(this));

        // navigation elements
        f.findAll(this.navWrapperEl, "li").forEach(li => {
            li.addEventListener("click", this.togglePage.bind(this))
        })

        // page close buttons
        f.elList(".close-btn").forEach((e)=> {
            e.addEventListener("click", this.closePage.bind(this));
        })

        // reload
        // let restartBtn = f.find(this.endFrameEl, "#brew-again");
        // let shareBtn = f.find(this.endFrameEl, "#share");
        // let subscribeBtn = f.find(this.endFrameEl, "#subscribe-btn");
        f.find(this.endFrameEl, "#brew-again.active").addEventListener("click", ()=> {
            location.reload();
        })

        // copy link
        f.find(this.endFrameEl, "#share.active").addEventListener("click", ()=> {
            if (this.app.playlistCreated) {
                this.copyText(this.app.playlistCreated.ShareLink)
            }
        });

        // open subscription dialoge
        f.find(this.endFrameEl, "#subscribe-btn.active").addEventListener("click", this.openSubscriptionPage.bind(this));

        // we playing rounds on the redirect
        // if (window.location.href.indexOf("access_token") > -1) {
        //     // hide the loader
        //     // this.loaderEl.style.display = "none";

        //     // GAMEPLAY
        //     this.ROUNDS = new Rounds(this);

        //     // start
        //     this.ROUNDS.CreatePlaylist = this.app.CreatePlaylist.bind(this.app);
        //     this.ROUNDS.showRound(0)
        //     this.onResize();
        // } else {
        //     // show the loader
        //     // this.loaderEl.style.display = "block";

        //     // LANDING PAGE
        //     this.LANDING = new Landing(this);
        //     this.LANDING.onLoginPressed = this.Login.bind(this);
        //     this.loaderInit();

        //     // this.loadImages(data.preloadList)
        //     // if (this.isCached(this.ASSET_URL + data.preloadList[0])) {
        //     //     this.LANDING.show();
        //     // } else {
        //     //     this.loaderInit();
        //     // }
        //     // this.LANDING.show();
        // }

        this.showEndFrame("Best savoured on your local park bench, your brew is extra fresh and topped off with just a dash of liquid poison. Kick back and chill with low key tunes filled with all the right feels, that'll have you feeling like an extra cool snowman.");
    }

    private loaderInit() {
        this.loaderCircleWrapperEl.style.height = "200px";
        this.loaderCircleWrapperEl.style.width = "200px";
        this.loadImages(data.preloadList)

        // this.imgCount = 100;
        // this.incrementLoader();
    }

    async loadImages(images: string[]) {
        this.imgCount = images.length;
        // console.log(this.imgCount);
        
        images.forEach((imgSrc)=> {
            let imgObject = new Image();
            imgObject.onload = this.incrementLoader.bind(this);
            imgObject.src = this.ASSET_URL + imgSrc;
        })
    }

    private incrementLoader() {
        this.imgsLoaded++;
        var percent = this.imgsLoaded/this.imgCount * 100;

        this.loaderPercentEl.innerHTML = Math.round(percent).toString() + "%";
        // if (this.imgsLoaded == this.imgCount) {
        //     TweenMax.to(this.loaderEl, 0.2, {
        //         alpha: 0, display: "none", onComplete : this.LANDING?.show.bind(this.LANDING)
        //     })
        //     // this.LANDING?.show();
        //     this.onResize();
        // } else {
        //     var scale = (percent > 1) ? (1 + percent*0.2) : 1;
        //     console.log(scale);
        //     this.loaderCircleEl.style.transform = "scale(" + scale + ")";
        // }

        if (this.imgsLoaded == this.imgCount) {
            this.LANDING?.show();
            this.onResize();
        }
    }

    private isCached(src: string) {
        var image = new Image();
        image.src = src;
        console.log("CACHED?", src, image.complete)
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

    private toggleHeaderLogo(show: boolean) {
        if (show) {
            TweenMax.fromTo(this.smallLogoEl, 0.5, {display: "none", y:-100}, {display: "block", y:0})
        } else {
            TweenMax.fromTo(this.smallLogoEl, 0.5, {display: "block", y:0}, {display: "none", y:0})
        }
    }

    private changeToDesktop() {
        // small logo
        if (this.LANDING == undefined) this.toggleHeaderLogo(false);

        // reset nav
        this.navVisible = false;
        this.navWrapperEl.removeAttribute("style");

        TweenMax.fromTo(this.navEl, 0.2, {
            y:-100
        }, {
            y:0
        })

        this.ROUNDS?.changeToDesktop();
    }

    private changeToMobile() {
        this.navWrapperEl.removeAttribute("style");
        f.elByID("album-cover").removeAttribute("style");

        // small logo
        if (this.LANDING == undefined) this.toggleHeaderLogo(true);

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
                console.log(window.innerWidth, window.innerWidth)
                this.navEl.style.left = f.px((window.innerWidth/2 - this.navEl.getBoundingClientRect().width)/2)
            }
        }

        // frame
        if (window.innerWidth <= 768) {
            if (this.frameVisible) {
                this.frameOut();
                this.frameVisible = false;
            }

        } else {
            console.log("frame visible", this.frameVisible);
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
        // change the position of the nav
        if (this.isMobileSize) {
            // is mobile
            this.navEl.removeAttribute("style");

            // small logo
            if (this.LANDING == undefined) this.toggleHeaderLogo(true);
        } else {
            // show the listed nav
            TweenMax.fromTo(this.navEl, 0.5, {y:-100}, {y:0})
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
            f.findAll(this.burgerEl, "li").forEach((el)=> {
                el.style.backgroundColor = color;
            })

            // change the color of the small logo
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
        // f.elByID("canvas-container").style.zIndex = "50";
        // const graphics: Graphics = new Graphics();
        // graphics.onInitResources(App.resourceManager);
        // graphics.switchColorForward(data.COLOURS_THREE[data.COLOURS.beige], 0.3)

        // const container = document.getElementById('canvas-container');
        // if (container !== null) {
        //     container.append(graphics.domElement);
        //     container.style.zIndex ="50";
        //     graphics.domElement.style.zIndex = '50';
        //     graphics.domElement.id = "graphics-canvas";
        // }

        // graphics.switchColorForward(new THREE.Color(0xff00), 1.0);

        this.setBgColor(data.COLOURS.beige);
        this.toggleFrameColours(data.COLOURS.purple, true);

        // set description
        f.find(this.endFrameEl, "#playlist-desc").innerHTML = description;

        this.endFrameEl.style.display = "block";
        var d = 1;

        let restartBtn = f.find(this.endFrameEl, "#brew-again");
        let shareBtn = f.find(this.endFrameEl, "#share");
        let subscribeBtn = f.find(this.endFrameEl, "#subscribe-btn");

        TweenMax.fromTo(f.find(this.endFrameEl, "#playlist-title"), 0.5, {
            alpha: 0, x:-100
        }, {
            alpha: 1, x:0, delay: d
        });

        TweenMax.fromTo(f.find(this.endFrameEl, "#playlist-desc"), 0.5, {
            alpha: 0, x:-100
        }, {
            alpha: 1, x:0, delay: d+0.2
        });

        TweenMax.fromTo(f.find(this.endFrameEl, "#album-cover"), 0.5, {
            alpha:0, scale:0.9
        }, {
            alpha: 1, scale:1, delay: d+0.4
        });

        TweenMax.fromTo([restartBtn, shareBtn], 0.3, {
            alpha: 0, y:50
        }, {
            alpha:1, y:0, delay: d+1.2, stagger:0.1, onComplete : ()=> {
                restartBtn.className += " active";
                shareBtn.className += " active";
            }
        })

        TweenMax.fromTo(subscribeBtn, 2, {
            alpha: 0
        }, {
            alpha:1, delay: d+2, onComplete : ()=> {
                subscribeBtn.className += " active"
            }
        })
    }

    private toggleNav() {
        // called from the burger/close

        // BURGER OPEN
        if (this.navVisible) {
            if (this.currentPopupPage) {
                this.hidePage(this.currentPopupPage);
            } else {
                this.slideOut(this.navWrapperEl);
            }

            // revert the frame colours
            this.toggleFrameColours(this.currentFrameColor, false);

            // hide the small logo
            if (this.LANDING) this.toggleHeaderLogo(false);
            this.navVisible = false;

        } else {
            // show the nav
            this.toggleFrameColours(data.COLOURS.purple, false);
            this.slideIn(this.navWrapperEl);

            // bounce in the things
            TweenMax.fromTo(f.findAll(this.navEl, "li"), 0.5, {
                alpha:0, y:50
            }, {
                alpha: 1, y:0, delay:0.2, stagger : {
                    each: 0.1
                }
            })

            // show the small logo
            if (this.LANDING) this.toggleHeaderLogo(true);
            this.navVisible = true;
        }

        this.burgerEl.classList.toggle("opened");

    }

    private togglePage(e: any) {
        // used for nav (About/Contact/Order)
        var target = e.srcElement.getAttribute("data");

        if (this.isMobileSize) {
            // MOBILE
            if (target == "about" || target == "faq") {
                this.showPage(target);

                // hide the nav wrapper
                this.slideOut(this.navWrapperEl);
            }
        } else {
            // DEKSTOP
            if (this.currentPopupPage == target) {
                // if it's the same page, close it

                // show the underline on the next page
                e.srcElement.classList.toggle("active");

                // hide the current page
                this.hidePage(this.currentPopupPage);
    
                // change the frame colours
                this.toggleFrameColours(this.currentFrameColor, false);

                // set current pop up page to nothing
                this.currentPopupPageEl = undefined;
    
            } else {  
                if (target == "about" || target == "faq") {
                    // change the color of the frame but don't set it as the current (so it can be reverted)
                    this.toggleFrameColours(data.COLOURS.orange, false);
    
                    if (this.currentPopupPage.length) {
                        // if there's a page currently showing, so hide it and show the next
                        this.currentPopupPageEl?.classList.toggle("active");

                        // hide the current page and show the next one 
                        this.hidePage(this.currentPopupPage, target);
                    } else {
                        // nothing else visible, show the damn page
                        this.showPage(target);
                    } 

                    // set the currrent list element to active
                    this.currentPopupPageEl = e.srcElement;
                    this.currentPopupPageEl?.classList.toggle("active");
                }          
            }
        }
    }

    private closePage() {
        // called from x buttons on desktop page
        this.hidePage(this.currentPopupPage);
        this.toggleFrameColours(this.currentFrameColor, false);
        this.currentPopupPageEl?.classList.toggle("active");
        this.currentPopupPageEl = undefined;
    }

    private showPage(p : string, delay?: number) {
        // animations for different pages
        if (p == "about") {
            // bop the fruit
            this.inPageLoopingAnimations.push(TweenMax.fromTo(this.aboutHopTopEl, 3, {
                rotate: -10, x:-50
            }, {
                rotate: 10, x:50, repeat: -1, yoyo: true, ease: "linear"
            }))

            this.inPageLoopingAnimations.push(TweenMax.to(this.aboutHopBottomEl, 1.5, {
                y: -50, repeat: -1, yoyo: true, ease: "linear"
            }))

            if (this.isMobileSize) {
                this.slideIn(this.aboutEl)
            } else {
                delay? this.show(this.aboutEl, delay) : this.show(this.aboutEl)
            }
        } else if (p == "faq") {
            this.inPageLoopingAnimations.push(TweenMax.to(f.elByID("faq-bg"), 2, {
                scale: 1.01, repeat: -1, yoyo: true, ease: "linear"
            }))

            if (this.isMobileSize) {
                this.slideIn(this.faqEl);
            } else {
                delay? this.show(this.faqEl, delay) : this.show(this.faqEl)
            }
        }

        this.currentPopupPage = p;
        // this.currentPopupPageEl = f.elByID(p);
        console.log("show page", this.currentPopupPage, this.currentPopupPageEl);
    }

    private hidePage(p : string, p2?: string) {
        if (p == "about") {
            if (this.isMobileSize) {
                this.slideOut(this.aboutEl)
            } else {
                this.hide(this.aboutEl);
            }
        } else if (p == "faq") {
            if (this.isMobileSize) {
                this.slideOut(this.faqEl);
            } else {
                this.hide(this.faqEl);
            }
        }

        this.inPageLoopingAnimations.forEach((anim)=> {
            anim.kill();
        });

        this.inPageLoopingAnimations = [];
        this.currentPopupPage = "";
        // this.currentPopupPageEl = undefined;
        console.log("hide page", p, this.currentPopupPageEl);

        if (p2) this.showPage(p2, 0.3);
    }

    private show(e: HTMLElement, delay?: number) {
        var d = delay ? delay : 0; 

        TweenMax.fromTo(e, 0.3, {
            display : "none", alpha: 0
        }, {
            display: "block", alpha: 1, delay: d
        })
    }

    private hide(e: HTMLElement) {
        TweenMax.fromTo(e, 0.3, {
            display : "block", alpha: 1
        }, {
            display: "none", alpha: 0
        })
    }

    private slideIn(e: HTMLElement) {
        TweenMax.fromTo(e, 0.5, {
            display: "none", x:-window.innerWidth*2
        }, {
            display: "block", x:0, ease: "easeOut"
        })
    }

    private slideOut(e: HTMLElement) {
        TweenMax.to(e, 1, {
            display: "none", x:-window.innerWidth*2, ease: "easeOut"
        })
    }

    private openSubscriptionPage() {
        
    }

    public playlistCreated(url: string) {
        console.log("playlist created", url)
        f.elByID("playlist-url").innerHTML = url;
    }

    public nameSet(name : string) {
        this.name = name.split(" ")[0];
        f.elByID("playlist-title").innerHTML = this.name + "'s Playlist"
    }

    private copyLink() {
        var copyText = this.app.playlistCreated?.ShareLink;
        console.log("copy link", copyText);
        if (copyText) {
            var el = <HTMLInputElement>f.elByID("playlist-url-thing");
            el.value = copyText;

            console.log("value", el.value);
    
              /* Select the text field */
            el.select();
            el.setSelectionRange(0, 99999); /*For mobile devices*/
    
            /* Copy the text inside the text field */
            document.execCommand("copy");
            console.log("test");
        }
    }
}
