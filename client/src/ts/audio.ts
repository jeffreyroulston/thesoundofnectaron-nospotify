import {Howl, Howler} from "howler";
import { el } from "./helpers";

export default class AudioPlayer {
    private ambientLoopSound : Howl;
    private quickfireSound : Howl;

    constructor() {
        this.ambientLoopSound = new Howl({
            src: ["assets/sounds/ambient_loop.wav"] ,
            volume: 0.5,
            loop: true
        });

        this.quickfireSound = new Howl({
            src: ["assets/sounds/round_3.wav"] ,
            volume: 0.5
        });

        // el("body").addEventListener("click", ()=> {
        //     this.ambientLoopSound.play();
        // });
        // el("body").click();

        // this.ambientLoopSound.play();
        // var r1 = new XMLHttpRequest();
        // r1.open('GET', "assets/sounds/ambient_loop.wav", true);
        // r1.responseType = 'arraybuffer';
        // r1.onload = (r : any) => {
        //     this.context.decodeAudioData(r.response, (buffer) => {
        //         this.ambientLoopSound = buffer;
        //     })
        // }
        // r1.onload = function() {
        //     this.context.decodeAudioData(r1.response, function(buffer) {
        //     bubbleSound = buffer;
        //     game.soundLoaded();
        //     }, onError);
        // }
        // r1.send();
    }

    public playAmbient() {
        if (!this.ambientLoopSound.playing()) {
            this.ambientLoopSound.play();
        }
    }

    public playRound3() {
        if (this.ambientLoopSound.playing()) {
            this.ambientLoopSound.fade(0.5, 0, 0.2)
        }

        this.quickfireSound.play();
        this.quickfireSound.on("end", this.playAmbient.bind(this))
    }

    // ambientSoundLoaded(e: any) {

    //     this.context.decodeAudioData(e.response, (bufferr) => {
    //         this.ambientLoopSound = buffer;
    //     }
    //     function(buffer) {
    //         this.ambientLoopSound = buffer;

    //         bubbleSound = buffer;
    //         game.soundLoaded();
    //         }, onError);
    // }
}