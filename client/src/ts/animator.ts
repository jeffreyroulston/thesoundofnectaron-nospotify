import Slider from "./sliderQ";
import MCQ from "./mcQ";
import QuickFireQ from "./quickfireQ";
import {TweenMax, TimelineMax} from "gsap"
import * as d3 from "d3";
import { easeBounceInOut } from "d3";

const enum Anim { 
    linear = "linear",
    random = "random",
    center = "center",
    bottom = "bottom"

};

// LANDING PAGE IN ANIMATION
export const landingPageIn = new TimelineMax();
landingPageIn.pause();

landingPageIn.to("#landing", 0, {
    display: "block"
}).from(".logo-head path:nth-child(even)", 0.8, {
    alpha:0, scale:0, y:50, stagger: {
        each:0.1, from: Anim.random
    }
}, 0).from(".logo-head path:nth-child(odd)", 0.8, {
    alpha:0, scale:0, y:-50, stagger: {
        each:0.1, from: Anim.random
    }
}, 0).from(".logo path, .logo polygon, .logo rect", 2, {
    alpha:0, scale:0, transformOrigin: Anim.center, stagger: {
        each:0.02, from: Anim.random
    }
}).from("#landing .subheading", 0.3, {
    alpha:0, y:5
}, "+=0.5").from("#start-btn", 0.3, {
    alpha:0, x:-10
}).to("#start-btn", 0.3, {
    x:-5, repeat: -1, yoyo: true
})


// FRUITS IN LANDING PAGE
export const fruitsIn = new TimelineMax();
fruitsIn.pause();

// fruitsIn.fromTo("#login .fruit", 0.5, {
//     alpha:0, scale:0.5
// }, {
//     alpha:1, scale:1, stagger : {each: 0.05, from: "random"}
// }).fromTo("#login .fruit-top", 1, {
//     x:-50, rotate:-30
// }, {
//     x:50, rotate:30, repeat:-1, yoyo:true, ease: Anim.linear
// }).fromTo("#login .fruit-bottom", 1, {
//     y:10, rotate:5
// }, {
//     y:-10, rotate:-5, repeat:-1, yoyo:true, ease: Anim.linear
// }).fromTo("#login .pineapple-top", 0.5, {
//     x:-10
// }, {
//     x:10, repeat:-1, yoyo:true, ease: Anim.linear
// }).fromTo("#login .fruit-bottom-2", 0.5, {
//     x:10
// }, {
//     x:-10, repeat:-1, yoyo:true, ease: Anim.linear
// }).fromTo("#login .fruit-whole", 5, {
//     rotate:0
// }, {
//     rotate:360, repeat:-1, ease: "linear"
// }).fromTo("#login .pineapple-burner", 0.1, {
//     rotate:-1
// }, {
//     rotate:0, transformOrigin: "bottom", repeat:-1, yoyo:true, ease: "linear", yoyoEase : "linear"
// })



// LANDING PAGE OUT ANIMATION
export const landingPageOut = new TimelineMax();
landingPageOut.pause();

landingPageOut.to("#login .subheading, #login .btn", 0.3, {
    alpha:0
}, 0).to("#login .bleed path, #login .bleed polygon, #login .bleed rect", 0.5, {
    alpha:0, y:0, scale:0, transformOrigin: Anim.center, stagger: {
        each: 0.02, from: Anim.random
    }
}, 0).to("#login .fruit", 0.5, {
    alpha:0, scale:0.5, stagger : {
        each: 0.05, from: Anim.random
    }
}, 0).from("#login .subheading, #login .btn", 0.5, {
    alpha:0, y:5
}).to("#login", 0, {
    display: "none"
});



// ROUND NAME IN
export const roundPageIn = new TimelineMax();
roundPageIn.pause();

roundPageIn.to("#round-name", 0, {
    display: "block"
}).fromTo(".round path", 0.75, {
    alpha:0, y:-50, scale:0, transformOrigin: Anim.bottom
}, {
    alpha:1, y:0, scale:1, stagger: {
        each: 0.1, from: Anim.random
}}).fromTo("#round-name .numbers li:first-child", 0.5, {
    alpha:0, y:50
}, {
    alpha:1, y:0
}, 0.4).fromTo("#round-name .fruit-whole", 1, {
    alpha: 0, y:-500, x:500, rotate:360
}, {
    alpha:1, y:0, x:0, rotate:0, ease: Anim.linear
}, 0.5).fromTo("#round-name .fruit-whole", 1, {
    rotate:0, y:0
}, {
    rotate: -5, y:20, repeat:-1, yoyo: true, ease: Anim.linear
}).fromTo("#round-name .description, #round-name .btn", 0.6, {
    alpha:0, y:20
}, {
    alpha:1, y:0
}, 1);



// ROUND NAME OUT
export const roundPageOut = new TimelineMax();
roundPageOut.pause();

roundPageOut.to("#round-name .description, #round-name .btn, #round-name .numbers li", 0.5, {
    alpha:0, y:20
}).to(".round-name-text li", 0.5, {
    alpha:0, x:-50
}).to(".round path", 0.5, {
    alpha:0, y:0, scale:0, stagger: {
        each: 0.05, from:"random"
    }
}).to("#round-name .fruit-whole", 0.5, {
    rotate:0, y:-20, alpha:0
}).to("#round-name", 0, {
    display: "none"
});



// SHOW END FRAME
export const endFrameIn = new TimelineMax();
endFrameIn.pause();

endFrameIn.to("#end-frame", 0, {
    display: "block"
}).fromTo("#playlist-title", 0.3, {
    alpha:0, x:-20
}, {
    alpha:1, x:0
}, 0.4).fromTo("#playlist-desc", 0.3, {
    alpha:0, x:-20
}, {
    alpha:1, x:0
}, 0.5).fromTo("#album-cover", 0.3, {
    alpha:0, scale:0.5
}, {
    alpha: 1, scale:1, delay: 0.7
}, 0.7)
