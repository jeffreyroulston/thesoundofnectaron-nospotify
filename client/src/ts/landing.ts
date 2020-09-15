import * as f from "./helpers";
import * as data from "./data";
import UI from "./ui";
import { easeSinIn } from "d3";
import {TweenMax} from "gsap"

export default class Landing {
    private UI : UI;
    private landingPageEl: HTMLElement = f.elByID("landing");
    private loopingAnimations: TweenMax[] = [];
    private preloadImgs : string[] = [
        "fruit/hop.png",
        "waves/wave-orange.svg",
        "waves/wave-purple.svg"
    ]

    public onLoginPressed = ()=> {};

    constructor(ui : UI) {
        this.UI = ui;

        f.find(this.landingPageEl, ".next-btn").addEventListener("click", this.login.bind(this))
        this.Show();
    }

    private login() {
        this.onLoginPressed();
    }

    public Show() {
        // elements
        var logoDesktop = f.find(this.landingPageEl, ".logo-wrapper-large");
        var logoMobile = f.find(this.landingPageEl, ".logo-wrapper-mobile");
        var isDesktop = f.getStyle(logoDesktop, "display") == "block";
        var logoContainer = isDesktop ? logoDesktop : logoMobile;

        var logoHeadElements= f.findAll(logoContainer, ".logo-head-fill");
        var logoElements= f.findAll(logoContainer, ".logo-fill");
        var hop = f.elByID("hop");
        var subheading = f.find(this.landingPageEl, ".subheading")
        var btn = f.find(this.landingPageEl, "#start-btn");

        // elements to hide
        this.UI.SetVisibleElements([this.landingPageEl, hop]);

        // make the frame text white
        this.UI.ToggleFrameColours(data.COLOURS.beige, true);

        // make the border come in
        this.UI.ShowBorder();

        // waves
        this.UI.ShowWaves(0);

        // show elements
        this.landingPageEl.style.display = "block";

        // HOP  
        TweenMax.fromTo(hop, 1, {
            display:"none", scale: 0.95, alpha:0
        }, {
            display:"block",scale:1, alpha:0.9, ease: easeSinIn
        })

        // BOUNCE DAT HOP
        // this.loopingAnimations.push(TweenMax.to(hop, 2, {
        //     scale:0.99, ease: "linear", delay:1, repeat:-1, yoyo:true
        // }))

        // NECTARON
        TweenMax.from(logoElements, 1, {
            alpha:0, scale:0, transformOrigin: "center", delay:1.5, stagger: {
                each:0.04, from: "random"
            }
        })
        
        // THE SOUND OF
        TweenMax.from(logoHeadElements, 1, {
            alpha:0, scale:0, rotation:-45, y:-200, delay:1.5, stagger: {
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
}