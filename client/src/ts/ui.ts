import * as si from "./spotify-interface";
import * as data from "./data";
import * as f from "./helpers";
import {TweenMax} from "gsap"
import App from "./app";
import Landing from "./landing";
import Rounds from "./rounds";
import Graphics from "./graphics";
import * as THREE from "three";
import { animation } from "modernizr";
import { brushSelection, easeBounce } from "d3";
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
    private currentFrameColor = data.COLORS.beige;

    // waves
    private wavesTopEl : HTMLElement = f.elByID("waves-top");
    private wavesBottomEl : HTMLElement = f.elByID("waves-bottom");
    private currentWaveColor: string = "purple";
    private loopingWaveAnimantions : TweenMax[] = [];

    // end frame
    private endFrameEl : HTMLElement = f.elByID("end-frame");
    
    // nav
    private navWrapperEl : HTMLElement = f.elByID("nav-wrapper")
    private navEl : HTMLElement = f.elByID("nav");
    private burgerEl : HTMLElement = f.elByID("burger");
    public smallLogoEl : HTMLElement = f.elByID("headerSmall");

    // pop up pages
    private popupPageEl : HTMLElement = f.elByID("popupPage");
    private popupPageVisible : boolean = false;
    private currentPage : string = "";

    // about page
    private aboutEl : HTMLElement = f.elByID("about");
    private aboutHopTopEl : HTMLElement = f.find(this.aboutEl, ".hopTop");
    private aboutHopBottomEl : HTMLElement = f.find(this.aboutEl, ".hopBottom")
    
    // for between pages
    private elementsToHide : HTMLElement[] = [];

    // loader
    private loaderEl = f.elByID("loader")
    private assetCount= 0;
    private assetsLoaded = 0;
    
    // nav
    private navVisible : boolean = false;
    private frameVisible : boolean = false;

    private degTopEl : HTMLElement= f.elByID("deg-top");
    private degBottomEl : HTMLElement= f.elByID("deg-bottom");
    private trueLinkEl : HTMLElement= f.elByID("true");

    // looping animations
    private loopingAnimations : TweenMax[] = [];
    private inPageLoopingAnimations : TweenMax[] = [];

    // for bad browsers
    private nope : boolean = false;

    // for end page
    private name : string = "Your";

    // is mobile
    public isMobileSize : boolean = false;

    // bound to app
    public Login = ()=>{};

    constructor(app : App) {
        this.app = app;

        if (f.getStyle(f.el("#shit-browser-alert"), "display") == "block") {
            this.nope = true;
        }

        document.addEventListener('DOMContentLoaded', this.init.bind(this), false);
    }

    private init() {
        if (this.nope) return;

        // resize callback
        window.addEventListener('resize', this.onResize.bind(this));

        // check dimensions
        this.isMobileSize = this.burgerEl.getBoundingClientRect().width > 1;

        // used for the mobile menu
        this.burgerEl.addEventListener("click", this.mobileMenuClicked.bind(this));

        // navigation elements
        f.findAll(this.navWrapperEl, "li").forEach(li => {
            li.addEventListener("click", this.navClicked.bind(this))
        })

        // popuppage close button
        f.find(this.popupPageEl, ".close-btn").addEventListener("click", this.closePage.bind(this));

        // reload
        f.find(this.endFrameEl, "#brew-again").addEventListener("click", (e: any)=> {
            if (!(e.target.className.indexOf("active") > -1)) return;

            location.reload();
        })

        // copy link
        // f.find(this.endFrameEl, "#share").addEventListener("click", (e: any)=> {
        //     if (!(e.target.className.indexOf("active") > -1)) return;

        //     if (this.app.playlistCreated) {
        //         this.copyText(this.app.playlistCreated.ShareLink)
        //     }
        // });

        // open subscription dialoge
        f.elList(".subscribe-btn").forEach((e)=> {
            e.addEventListener("click", (e:any)=> {
                var inputs = document.querySelectorAll(".hbspt-form .hs-input");
                console.log(inputs);
                this.togglePage("subscribe");
            });
        })

        // we playing rounds on the redirect
        if (this.app.authorized) {
            // hide the loader
            // this.loaderEl.style.display = "none";

            // set the frame
            this.frameVisible = true;
            this.frameEl.classList.toggle("visible");
            f.elList(".hide-top").forEach((el)=> {el.classList.toggle("visible")});
            f.elList(".hide-bottom").forEach((el)=> {el.classList.toggle("visible")});

            // GAMEPLAY
            this.ROUNDS = new Rounds(this);

            // start
            this.ROUNDS.showRound(1);
            this.onResize();
        } else {
            // show the loader
            // this.loaderEl.style.display = "block";

            // LANDING PAGE
            this.LANDING = new Landing(this);
            this.LANDING.onLoginPressed = this.Login.bind(this);
            this.loaderInit();
        }

        // this.showEndFrame();
    }

    // ************************
    // LOADER
    // ************************

    public showLoader() {
        TweenMax.fromTo(this.loaderEl, 0.5, {display:"none", alpha:0}, {display:"block", alpha:1});
        TweenMax.to(f.find(this.loaderEl, ".purple-loader"), 0, {alpha:1})
    }

    public hideLoader() {
        TweenMax.to(this.loaderEl, 0.5, {display:"none", alpha:0});
        TweenMax.to(f.find(this.loaderEl, ".purple-loader"), 0.3, {alpha:0})
    }

    private loaderInit() {
        this.loadImages(data.preloadList);
        this.showLoader();
        this.loaderEl.style.display = "block";
    }

    async loadImages(images: string[]) {
        this.assetCount= images.length + App.audio.audioCount;
        console.log(images.length, this.assetCount);

        images.forEach((imgSrc)=> {
            let imgObject = new Image();
            imgObject.onload = this.incrementLoader.bind(this);
            imgObject.src = this.ASSET_URL + imgSrc;
        })
    }

    public incrementLoader() {
        if (this.app.authorized) return;
        this.assetsLoaded++;

        if (this.assetsLoaded == this.assetCount) {
            this.hideLoader();
            this.LANDING?.show();
            this.onResize();
        }
    }

        // ************************
    // SET AND HIDE ELEMENTS
    // ************************

    public setVisibleElements(elements : HTMLElement[]) {
        elements.forEach((e)=> {
            this.elementsToHide.push(e);
        })
    }

    public transitionOut() {
        // hide the elements
        TweenMax.to(this.elementsToHide, 0.5, {
            alpha:0, scale:0.95, display: "none", onComplete: this.clearHiddenElements.bind(this)
        })
    }

    private clearHiddenElements() {
        // reset hidden elements
        this.elementsToHide = [];
    }

    // ************************
    // SET BG COLOR
    // ************************

    public setBgColor(color: string) {
        f.el("body").style.backgroundColor = color;
    }

    // ************************
    // RESIZES
    // ************************

    private onResize() {
        if (this.nope) return;

        let vh = window.innerHeight * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`);
        this.checkMobileSize();

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

    private checkMobileSize() {
        // check if the burger is visible
        var m = this.burgerEl.getBoundingClientRect().width > 1;

        if (m != this.isMobileSize) {
            if (this.isMobileSize) {
                this.changeToDesktop();
            } else {
                this.isMobileSize = m;
                this.changeToMobile();
            }
        }

        this.isMobileSize = m;
    }

    private changeToDesktop() {
        this.toggleHeaderLogo(false);

        // reset nav
        this.navVisible = false;
        this.navWrapperEl.removeAttribute("style");
        // TweenMax.fromTo([this.navEl, this.degTopEl], 0.5, {y:-100}, {y:0});
        // TweenMax.fromTo([this.degBottomEl, this.trueLinkEl], 0.5, {y:100}, {y:0});

        // change the frame colour
        this.toggleFrameColors(this.currentFrameColor, false);
    }

    private changeToMobile() {
        // nav
        this.navWrapperEl.removeAttribute("style");

        // check pages
        if (this.currentPage.length) {
            // if there's a page open
            this.burgerEl.classList.toggle("opened");
            this.toggleHeaderLogo(true);
            this.toggleFrameColors(data.COLORS.purple, false);
        } else {
            // small logo
            if (this.LANDING == undefined) this.toggleHeaderLogo(true);
        }
    }

    // ************************
    // FRAME
    // ************************

    private frameIn() {
        // N E C
        TweenMax.fromTo(f.findAll(this.frameEl, "li.top"), 0.5, {display:"none", y:-100}, {y:0, display:"block"})
        // T
        TweenMax.fromTo(f.findAll(this.frameEl,"li.left.middle"), 0.5, {display:"none", x:-100}, {x:0, display:"block"})
        // A
        TweenMax.fromTo(f.findAll(this.frameEl, "li.right.middle"), 0.5, {display:"none", x:100}, { x:0, display:"block"})
        // R O N
        TweenMax.fromTo(f.findAll(this.frameEl, "li.bottom"), 0.5, {display:"none", y:100}, {y:0, display:"block"})

        if (!this.isMobileSize) {
            TweenMax.to(".hide-top", 0.5, {y:0})
        }
    }

    private frameOut() {
        console.log("frame out");
        // N E C
        TweenMax.fromTo(f.findAll(this.frameEl, "li.top"), 0.5, {display:"block", y:-0}, {y:-100, display:"none"})
        // T
        TweenMax.fromTo(f.findAll(this.frameEl,"li.left.middle"), 0.5, {display:"block", x:-0}, {x:-100, display:"none"})
        // A
        TweenMax.fromTo(f.findAll(this.frameEl, "li.right.middle"), 0.5, {display:"block", x:0}, { x:100, display:"none"})
        // R O N
        TweenMax.fromTo(f.findAll(this.frameEl, "li.bottom"), 0.5, {display:"block", y:0}, {y:100, display:"none"})
    }

    public toggleFrameColors(color : string, setValue : boolean) {
        // change color of letters in the border
        this.frameLetterFill.forEach((el)=> {
            el.style.fill = color;
        })

        if (this.isMobileSize) {
            // change the color of the nav
            f.findAll(this.navWrapperEl, "*").forEach((el)=> {
                el.removeAttribute("style");
            })

            // change the color of the burger
            f.findAll(this.burgerEl, "li").forEach((el)=> {
                el.style.backgroundColor = color;
            })

            if (this.LANDING == undefined) {
                // change the color of the small logo
                f.findAll(this.smallLogoEl, ".logo-small-fill").forEach((el)=> {
                    el.style.fill = color;
                })
            } else {
                // keep it purple
                f.findAll(this.smallLogoEl, ".logo-small-fill").forEach((el)=> {
                    el.style.fill = data.COLORS.purple;
                })
            }
            
        } else {
            f.findAll(this.navWrapperEl, "*").forEach((el)=> {
                el.style.color = color;
            });

            var e = [this.degTopEl, this.degBottomEl, this.trueLinkEl];
            e.forEach((el)=> {
                el.style.color = color;
            })
        }

        if (setValue) {
            this.currentFrameColor = color;
        }
    }

    // ************************
    // NAVIGATION AND PAGES
    // ************************

    public showNavBar() {
        // // change the position of the nav
        // if (this.isMobileSize) {
        //     // is mobile
        //     this.navEl.removeAttribute("style");

        //     // small logo
        //     if (this.LANDING == undefined) this.toggleHeaderLogo(true);
        // } else {
        //     // show the listed nav
        //     TweenMax.fromTo([this.navEl, this.degTopEl], 0.5, {y:-100}, {y:0});
        //     TweenMax.fromTo([this.degBottomEl, this.trueLinkEl], 0.5, {y:100}, {y:0});
        // }
    }

    private toggleHeaderLogo(show: boolean) {
        // if (show) {
        //     TweenMax.fromTo(this.smallLogoEl, 0.5, {display:"none", y:-100, alpha:0}, {display: "block", y:0, alpha:1})
        // } else {
        //     TweenMax.to(this.smallLogoEl, 0.5, {display: "none", y:-100, alpha:0})
        // }
    }

    private mobileMenuClicked() {
        // // called from the burger/close
        if (this.navVisible) {
            this.fadeOut(this.navWrapperEl);
            this.navVisible = false;
        } else {
            if (this.popupPageVisible) {
                // hide the popup page
                // this.fadeOut(this.popupPageEl);
                // this.fadeOut(this.navWrapperEl);
                // this.navVisible = false;
                // this.popupPageVisible = false;
                this.closePage();

            } else {
                // show the navigation
                this.fadeIn(this.navWrapperEl);
                this.showMobileNavElements();
                this.navVisible = true;
            }
        }

        this.burgerEl.classList.toggle("opened");

        // if (this.navVisible) {
        //     this.slideOut(this.navWrapperEl);

        //     // revert the frame Colors
        //     this.toggleFrameColors(this.currentFrameColor, false);

        //     // hide the small logo
        //     if (this.LANDING) this.toggleHeaderLogo(false);
        //     this.navVisible = false;

        // } else {
        //     if (this.currentPopupPageEl) {
        //         this.closePage();

        //     } else {
        //         // show the nav
        //         this.toggleFrameColors(data.COLORS.purple, false);
        //         this.slideIn(this.navWrapperEl);

        //         // bounce in the things
        //         TweenMax.fromTo(f.findAll(this.navEl, "li"), 0.5, {
        //             alpha:0, y:50
        //         }, {
        //             alpha: 1, y:0, delay:0.2, stagger : {
        //                 each: 0.1
        //             }
        //         })

        //         // show the small logo
        //         if (this.LANDING) this.toggleHeaderLogo(true);
        //         this.navVisible = true;
        //     }
        // }

        // this.burgerEl.classList.toggle("opened");
    }


    private navClicked(e: any) {
        var target = e.srcElement.getAttribute("data");
        if (!target || target == null) return;
        if (target.length > 0) this.togglePage(target);
    }

    private togglePage(target: string) {
        // console.log(this.navVisible, this.popupPageVisible);
        console.log("toggle page", target);
        console.log("current page", this.currentPage);
        console.log("popup visible", this.popupPageVisible)
        console.log(this.currentPage != target);

        var pageEl = f.find(this.popupPageEl, "#" + target);

        if (this.popupPageVisible) {
            if (this.currentPage != target) {
                pageEl.scrollTop = 0;
                // pageEl.scroll = (0,0)
                
                var currentPageEl = f.find(this.popupPageEl, "#" + this.currentPage);
                if (this.isMobileSize) {
                    this.slideUpOut(currentPageEl);
                    this.slideUpIn(pageEl);

                } else {
                    this.fadeOut(currentPageEl);
                    this.fadeIn(pageEl, 0.3);
                }
                
                this.currentPage = target;
            }

        } else {
            this.currentPage = target;
            if (this.isMobileSize) {
                // MOBILE
                // remove nav elements
                this.hidemobileNavElements();
                this.toggleNavWrapperColor(data.COLORS.beige);

                // change the burger color
                this.setBurgerColor(data.COLORS.orange);

                // transition in page
                this.fadeIn(this.popupPageEl, 0.3);

                // show current page
                this.slideUpIn(pageEl);
            } else {
                // DESKTOP
                this.toggleFrameColors(data.COLORS.orange, false);

                // transition in popup page element
                this.slideIn(this.popupPageEl); 

                // show current page
                this.fadeIn(pageEl, 0.3);
            }

            // set variables
            this.popupPageVisible = true;
            this.navVisible = false;
        }
    }

    private closePage() {
        console.log("close current page", this.currentPage);
        if (this.isMobileSize) {
            this.slideUpOut(f.find(this.popupPageEl, "#" + this.currentPage));
            this.fadeOut(this.popupPageEl);
            this.fadeOut(this.navWrapperEl);
            this.navVisible = false;
            this.toggleNavWrapperColor(data.COLORS.orange, 0.5);
            console.log(this.currentFrameColor);
            // change the burger color
            this.setBurgerColor(this.currentFrameColor);
        } else {
            this.toggleFrameColors(this.currentFrameColor, false);
            this.slideOut(this.popupPageEl);
            this.fadeOut(f.find(this.popupPageEl, "#" + this.currentPage));
        }
        this.popupPageVisible = false;
        this.currentPage = "";
    }

    private slideIn(e: HTMLElement) {
        TweenMax.fromTo(e, 0.5, {
            display: "none", x:-window.innerWidth, opacity: 0
        }, {
            display: "block", x:0, opacity: 1
        })
    }

    private slideOut(e: HTMLElement) {
        TweenMax.to(e, 0.5, {
            display: "none", x:-window.innerWidth, opacity: 0
        })
    }

    private slideUpIn(e: HTMLElement) {
        TweenMax.fromTo(e, 0.5, {
            display: "none", y:50, opacity: 0
        }, {
            display: "block", y:0, opacity: 1, delay: 0.2
        })
    }

    private slideUpOut(e: HTMLElement) {
        TweenMax.fromTo(e, 0.5, {
            display: "block", y:0, opacity: 1
        }, {
            display: "none", y:-50, opacity: 0
        })
    }

    private fadeIn(e: HTMLElement, delay?:number) {
        var d  = delay ? delay : 0
        TweenMax.fromTo(e, 0.3, {
            display: "none", opacity: 0
        }, {
            display: "block", opacity: 1, delay: d
        })
    }

    private fadeOut(e: HTMLElement, delay?:number) {
        TweenMax.to(e, 0.3, {
            display: "none", opacity: 0
        })
    }
    private showMobileNavElements() {
        // bounce in the things
        TweenMax.fromTo(f.findAll(this.navEl, "li"), 0.5, {
            alpha:0, y:50
        }, {
            alpha: 1, y:0, delay:0.2, stagger : {
                each: 0.1
            }
        })
    }

    private hidemobileNavElements() {
        // bounce in the things
        TweenMax.fromTo(f.findAll(this.navEl, "li"), 0.3, {
            alpha: 1, y:0
        }, {
            alpha:0, y:-50, stagger : {
                each: 0.05
            }
        })
    }

    // private showPopupPageElements() {
    //     if (!this.currentPopupPageEl) return;
    //     TweenMax.fromTo(f.findAll(this.currentPopupPageEl, ".col-wrapper"), 0.5, {
    //         alpha:0, y:50
    //     }, {
    //         alpha: 1, y:0, delay:0.5, stagger : {
    //             each: 0.05
    //         }
    //     });
    // }

    // private hidePopupPageElements() {
    //     if (!this.currentPopupPageEl) return;
    //     TweenMax.fromTo(f.findAll(this.currentPopupPageEl, ".pop"), 0.5, {
    //         alpha:1, y:0
    //     }, {
    //         alpha: 0, y:-50, stagger : {
    //             each: 0.05
    //         }, onComplete: ()=> {
    //             if (this.currentPopupPageEl) this.currentPopupPageEl.style.display = "none"
    //         }
    //     });
    // }

    private toggleNavWrapperColor(color: string, delay?:number) {
        var d = delay ? delay : 0
        TweenMax.to(this.navWrapperEl, 0.5, {
            backgroundColor : color, delay: d
        })
    }

    private setBurgerColor(color: string) {
        f.findAll(this.burgerEl, "li").forEach((el)=> {
            el.style.backgroundColor = color;
        })

    }

    // ************************
    // WAVES
    // ************************

    public showWaves(d: number) {
        console.log(this.loopingWaveAnimantions);
        TweenMax.fromTo([this.wavesTopEl, this.wavesBottomEl], 3, {display:"none", alpha:0}, {display:"block", alpha:0.95, ease: "linear", delay: d})
        TweenMax.fromTo(this.wavesBottomEl, 3, {y:200}, {y:0, ease: "linear", delay: d});
        TweenMax.fromTo(this.wavesTopEl, 3, {y:-200}, {y:0, ease: "linear", delay: d});
        
        // get waves
        var topWaves = f.findAll(this.wavesTopEl, ".wave." + this.currentWaveColor);
        var bottomWaves = f.findAll(this.wavesBottomEl, ".wave." + this.currentWaveColor);
        var waves : HTMLElement[] = [];
        waves = waves.concat(topWaves, bottomWaves);

        // reset waves
        TweenMax.to(waves, 0, {x:0, y:0});

        // animate
        this.loopingWaveAnimantions.push(
            TweenMax.to([topWaves[0], bottomWaves[0]], 7, {x:-1600, repeat:-1, ease: "linear"})
        )

        this.loopingWaveAnimantions.push(
            TweenMax.to([topWaves[1], bottomWaves[1]], 7, {x:-1600, repeat:-1, delay:0.5, ease: "linear"})
        )

        this.loopingWaveAnimantions.push(
            TweenMax.to([topWaves[0], bottomWaves[0]], 7, {y:50, repeat:-1, delay:1, ease: easeBounce, yoyo:true})
        )

        this.loopingWaveAnimantions.push(
            TweenMax.to([topWaves[1], bottomWaves[1]], 7, {y:25, repeat:-1, ease: easeBounce, yoyo:true})
        )
    }

    public hideWaves(delay: number) {
        TweenMax.to([this.wavesTopEl, this.wavesBottomEl], 1, {display:"none", alpha:0, ease: "linear", onComplete: ()=> {
            this.loopingWaveAnimantions.forEach((anim)=> {
                anim.kill();
            })
            this.loopingWaveAnimantions = [];
        }})
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

    // ************************
    // END FRAME
    // ************************

    public prepareEndFrame() {
        this.setBgColor(data.COLORS.purple);
        this.showLoader();
        this.app.CreatePlaylist();
    }

    public playlistCreated(url: string) {
        console.log("playlist created", url);
        var split = url.split("/");
        var id = split[split.length-1];

        // create an embed link
        var iframe = <HTMLIFrameElement>f.el("#embed");
        iframe.src = "https://open.spotify.com/embed/playlist/" + id;
        iframe.onload = ()=> {
            console.log("iframe loaded");
            this.showEndFrame();
        }
    }

    public nameSet(name : string) {
        // set user name pulled from spotify
        this.name = name.split(" ")[0];
        f.elByID("playlist-title").innerHTML = this.name + "'s Playlist"
    }

    public setEndFrameCopy(copy: string) {
        // set description
        f.find(this.endFrameEl, "#playlist-desc").innerHTML = copy;
    }

    public showEndFrame() {
        this.endFrameEl.style.display = "block";
        var d = 1;

        var hop = f.find(this.endFrameEl, ".hop-wrapper img");
        let restartBtn = f.find(this.endFrameEl, "#brew-again");
        let playlistBtn = f.find(this.endFrameEl, "#listen");

        // hide the loader
        this.hideLoader();

        // make the frame text white
        this.toggleFrameColors(data.COLORS.beige, true);

        // set wave colour
        this.toggleWaveColor("purple");

        // waves
        this.showWaves(0);

        TweenMax.fromTo(hop, 0.5, {
            alpha: 0, scale:0.8
        }, {
            alpha:1, scale:1, delay:d
        })

        TweenMax.to(hop, 4, {
            y:20, repeat:-1, yoyo:true, ease: "linear"
        })

        TweenMax.fromTo(f.find(this.endFrameEl, "#playlist-title"), 0.5, {
            alpha: 0, y:50
        }, {
            alpha: 1, y:0, delay: d+0.2
        });

        TweenMax.fromTo(f.find(this.endFrameEl, "#playlist-desc"), 0.5, {
            alpha: 0, y:50
        }, {
            alpha: 1, y:0, delay: d+0.4
        });

        TweenMax.fromTo(f.find(this.endFrameEl, "iframe"), 0.5, {
            alpha: 0, y:50
        }, {
            alpha: 1, y:0, delay: d+0.6
        })

        TweenMax.fromTo([playlistBtn, restartBtn], 0.3, {
            alpha: 0, y:50
        }, {
            alpha:1, y:0, delay: d+1.2, stagger:0.1, onComplete : ()=> {
                restartBtn.className += " active";
                playlistBtn.className += " active";
            }
        })

        TweenMax.fromTo(f.find(this.endFrameEl, ".subscribe-btn"), 2, {
            alpha: 0
        }, {
            alpha:1, delay: d+2
        })
    }

    // private copyLink() {
    //     var copyText = this.app.playlistCreated?.ShareLink;
    //     console.log("copy link", copyText);
    //     if (copyText) {
    //         var el = <HTMLInputElement>f.elByID("playlist-url-thing");
    //         el.value = copyText;

    //         console.log("value", el.value);
    
    //           /* Select the text field */
    //         el.select();
    //         el.setSelectionRange(0, 99999); /*For mobile devices*/
    
    //         /* Copy the text inside the text field */
    //         document.execCommand("copy");
    //         console.log("test");
    //     }
    // }

    // private copyText(text: string) {
    //     const el = document.createElement('textarea');
    //     el.value = text;
    //     document.body.appendChild(el);
    //     el.select();
    //     document.execCommand('copy');
    //     document.body.removeChild(el);
    // }


    // private isCached(src: string) {
    //     var image = new Image();
    //     image.src = src;
    //     console.log("CACHED?", src, image.complete)
    //     return image.complete;
    // }
}
