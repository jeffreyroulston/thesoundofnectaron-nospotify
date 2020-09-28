import {Howl, Howler} from "howler";
import { el } from "./helpers";

export default class AudioPlayer {
    private ambientLoopSound : Howl;
    private quickfireSound : Howl;
    private clickSound : Howl;
    private selectedSound : Howl;
    private rejectedSound : Howl;

    constructor() {
        this.ambientLoopSound = new Howl({
            src: ["assets/sounds/ambient_loop.mp3"] ,
            volume: 0.5,
            loop: true
        });

        this.quickfireSound = new Howl({
            src: ["assets/sounds/round_3.mp3"] ,
            volume: 0.5
        });


        this.clickSound = new Howl({
            src: ["assets/sounds/click_1.wav"] ,
            volume: 0.5
        });

        this.selectedSound = new Howl({
            src: ["assets/sounds/click_2.wav"] ,
            volume: 0.5
        });

        this.rejectedSound = new Howl({
            src: ["assets/sounds/click_3.wav"] ,
            volume: 0.5
        });
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

    public playClick() {
        // used for landing page, round page
        if (!this.clickSound.playing()) this.clickSound.play();
    }

    public playSelectedSound() {
        // used for questions
        if (!this.selectedSound.playing()) this.selectedSound.play();
    }

    public playRejectedSound() {
        // used for questions
        if (!this.rejectedSound.playing()) this.rejectedSound.play();
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