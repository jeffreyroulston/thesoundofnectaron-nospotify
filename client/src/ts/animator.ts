import Slider from "./slider";
import MCQ from "./mcq";
import QuickFireQ from "./quickfireq";
import {TweenMax, TimelineMax} from "gsap"
import * as d3 from "d3";

const enum Anim { 
    linear = "linear",
    random = "random",
    center = "center"

};

// LANDING PAGE IN ANIMATION
export const landingPageIn = new TimelineMax();
landingPageIn.to("#login", 0, {
    display: "block"
}).from(".theSoundOf path:nth-child(even)", 0.8, {
    alpha:0, scale:0, y:50, stagger: {each:0.1, from: Anim.random}
}, 0).from(".theSoundOf path:nth-child(odd)", 0.8, {
    alpha:0, scale:0, y:-50, stagger: {each:0.1, from: Anim.random}
}, 0).from(".nectaron path, .nectaron polygon, .nectaron rect", 1, {
    alpha:0, scale:0, transformOrigin: Anim.center, stagger: {each:0.02, from: Anim.random}
}, 0.8).from("#login .subheading, #login .btn", 0.5, {
    alpha:0, y:5
}, "+=0.5")
landingPageIn.pause();

// LANDING PAGE OUT ANIMATION
export const landingPageOut = new TimelineMax();
landingPageOut.to("#login .subheading, #login .btn", 0.3, {
    alpha:0
}, 0).to("#login .bleed path, #login .bleed polygon, #login .bleed rect", 0.5, {
    alpha:0, y:0, scale:0, transformOrigin: Anim.center, stagger: {each: 0.02, from: Anim.random}
}, 0).to("#login .fruit", 0.5, {
    alpha:0, scale:0.5, stagger : {each: 0.05, from: Anim.random}
}, 0).from("#login .subheading, #login .btn", 0.5, {
    alpha:0, y:5
}).to("#login", 0, {
    display: "none"
});
landingPageOut.pause();