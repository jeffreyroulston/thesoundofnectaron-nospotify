import Slider from "./slider-q";
// import MCQ from "./mcQ";
// import QuickFireQ from "./quickfireQ";
import * as d3 from "d3";
import { easeBounceInOut } from "d3";

import gsap from "gsap";
import {TimelineMax} from "gsap";
import { DrawSVGPlugin } from "gsap/dist/DrawSVGPlugin";
import { MorphSVGPlugin } from "gsap/dist/MorphSVGPlugin";

gsap.registerPlugin(DrawSVGPlugin, MorphSVGPlugin);
// TweenMax.to("#landing", {duration: 1, morphSVG:"#start-btn"});

const enum Anim { 
    linear = "linear",
    random = "random",
    center = "center",
    bottom = "bottom"

};

// LANDING PAGE IN ANIMATION
export const landingPageIn = gsap.timeline({delay:0.5});
landingPageIn.pause();

landingPageIn.to("#landing", 0, {
    display: "block"
}).from(".logo-head path:nth-child(even)", 1, {
    alpha:0, scale:0, rotation:45, y:50, stagger: {
        each:0.1, from: Anim.random
    }
}, 0.5).from(".logo-head path:nth-child(odd)", 1, {
    alpha:0, scale:0, rotation:-45, y:-200, stagger: {
        each:0.1, from: Anim.random
    }
}, 0.5).from(".logo path, .logo polygon, .logo rect", 1, {
    alpha:0, scale:0, transformOrigin: Anim.center, stagger: {
        each:0.04, from: Anim.random
    }
}, 0).from("#landing .subheading", 0.5, {
    alpha:0, y:5
}, "+=0.2").from("#start-btn", 0.3, {
    alpha:0, x:-5
}).to("#start-btn", 0.3, {
    x:-5, repeat: -1, yoyo: true
})


// var shapes = "path, rects, stroke";
// landingPageIn.to("#circle", 2, {morphSVG: "#test"})
// landingPageIn.to("#circle", {duration: 2, morphSVG: "#hippo"})
// landingPageIn.from(shapes, 2, {alpha:0});


// FRUITS IN LANDING PAGE
export const fruitsIn = new TimelineMax();
fruitsIn.pause();

fruitsIn.fromTo("#landing .fruit", 0.5, {
    alpha:0, scale:0.5
}, {
    alpha:1, scale:1, stagger : {each: 0.1, from: "random"}, delay:1
}).fromTo("#landing .fruit-top", 1, {
    x:-50, rotate:-30
}, {
    x:50, rotate:30, repeat:-1, yoyo:true, ease: Anim.linear
}).fromTo("#landing .fruit-bottom", 1, {
    y:10, rotate:5
}, {
    y:-10, rotate:-5, repeat:-1, yoyo:true, ease: Anim.linear
}).fromTo("#landing .pineapple-top", 0.5, {
    x:-10
}, {
    x:10, repeat:-1, yoyo:true, ease: Anim.linear
}).fromTo("#landing .fruit-bottom-2", 0.5, {
    x:10
}, {
    x:-10, repeat:-1, yoyo:true, ease: Anim.linear
}).fromTo("#landing .fruit-whole", 5, {
    rotate:0
}, {
    rotate:360, repeat:-1, ease: "linear"
}).fromTo("#landing .pineapple-burner", 0.1, {
    rotate:-1
}, {
    rotate:0, transformOrigin: "bottom", repeat:-1, yoyo:true, ease: "linear", yoyoEase : "linear"
})



// LANDING PAGE OUT ANIMATION
// export const landingPageOut = new TimelineMax();
// landingPageOut.pause();

// landingPageOut.to("#landing .bleed path, #landing .bleed polygon, #landing .bleed rect", 0.5, {
//     alpha:0, scale:0, transformOrigin: Anim.center, stagger: {
//         each: 0.005, from: Anim.random
//     }
// }, 0).to("#landing .subheading", 0.5, {
//     alpha:0, y:5
// }, 0).to("#start-btn", 0.5, {
//     alpha:0, x:5
// }, 0).to("#landing", 0, {
//     display: "none"
// });



// ROUND NAME IN
// export const roundPageIn = new TimelineMax({delay:0.5});
// roundPageIn.pause();

// roundPageIn.fromTo(".round path", 0.75, {
//     alpha:0, y:-50, scale:0, transformOrigin: Anim.bottom
// }, {
//     alpha:1, y:0, scale:1, stagger: {
//         each: 0.1, from: Anim.random
// }}).fromTo("#round-name .numbers li:first-child", 0.5, {
//     display: "none", alpha:0, y:50
// }, {
//     display: "inline-block", alpha:1, y:0
// }, 0.4).fromTo("#round-name .fruit-whole", 1, {
//     alpha: 0, y:-500, x:500, rotate:360
// }, {
//     alpha:1, y:0, x:0, rotate:0, ease: Anim.linear
// }, 0.5).fromTo("#round-name .fruit-whole", 1, {
//     rotate:0, y:0
// }, {
//     rotate: -5, y:20, repeat:-1, yoyo: true, ease: Anim.linear
// }).fromTo("#round-name .description, #round-name .btn", 0.6, {
//     alpha:0, y:20
// }, {
//     alpha:1, y:0
// }, 1);
// roundPageIn.fromTo("#round-name .numbers li:first-child path", 2, {
//     drawSVG: "0"
// }, {
//     drawSVG: "100%"
// }, 0.4).fromTo("#round-name .fruit-whole", 1, {
//     alpha: 0, y:-500, x:500, rotate:360
// }, {
//     alpha:1, y:0, x:0, rotate:0, ease: Anim.linear
// }, 0.5).fromTo("#round-name .description", 0.6, {
//     alpha:0, y:20, rotation:-17
// }, {
//     alpha:1, y:0, rotation:-17
// }, 1.2);



// ROUND NAME OUT
// export const roundPageOut = new TimelineMax();
// roundPageOut.pause();

// roundPageOut.to("#round-name .description, #round-name .btn, #round-name .numbers li", 0.5, {
//     alpha:0, y:20
// }).to(".round-name-text li", 0.5, {
//     alpha:0, x:-50
// }).to(".round path", 0.5, {
//     alpha:0, y:0, scale:0, stagger: {
//         each: 0.05, from:"random"
//     }
// }).to("#round-name .fruit-whole", 0.5, {
//     rotate:0, y:-20, alpha:0
// }).to("#round-name", 0, {
//     display: "none"
// });


// SLIDER IN
// export const sliderIn = new TimelineMax();


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