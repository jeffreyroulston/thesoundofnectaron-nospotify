function getEL(e) {
    return document.querySelector(e);
}

function getElements(e) {
    return document.querySelectorAll(e);
}

function show(e, d=0) {
    gsap.fromTo(e,{y: 10}, {y: 0, alpha:1, display: "block", duration: 0.25, delay: d});
}

function hide(e, d=0) {
    gsap.to(e, {y: 10, alpha: 0, duration: 0.25, delay: d, onComplete: function(){
        gsap.to(e, {display: "none", duration: 0, delay: 0.5});
    }});
}