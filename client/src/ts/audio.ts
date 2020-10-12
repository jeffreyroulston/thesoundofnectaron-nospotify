import {Howl, Howler} from "howler";
import { el } from "./helpers";
import UI from "./ui";

export default class AudioPlayer {
    private ambientLoopSound : Howl;
    private quickfireSound : Howl;
    private clickSound : Howl;
    private selectedSound : Howl;
    private rejectedSound : Howl;
    private volume = 0.3;
    
    public audioCount = 5;
    public muted : boolean = false;

    constructor(ui : UI) {
        this.ambientLoopSound = new Howl({
            src: ["assets/sounds/ambient_loop.mp3"] ,
            volume: this.volume,
            loop: true
        });

        this.ambientLoopSound.on("load", ui.incrementLoader.bind(ui));

        this.quickfireSound = new Howl({
            src: ["assets/sounds/round_3.mp3"] ,
            volume: this.volume
        });

        this.quickfireSound.on("load", ui.incrementLoader.bind(ui));

        this.clickSound = new Howl({
            src: ["assets/sounds/click_1.mp3"] ,
            volume: this.volume
        });

        this.clickSound.on("load", ui.incrementLoader.bind(ui));

        this.selectedSound = new Howl({
            src: ["assets/sounds/click_2.mp3"] ,
            volume: this.volume
        });

        this.selectedSound.on("load", ui.incrementLoader.bind(ui));

        this.rejectedSound = new Howl({
            src: ["assets/sounds/click_3.mp3"] ,
            volume: this.volume
        });

        this.rejectedSound.on("load", ui.incrementLoader.bind(ui));
    }

    public playAmbient() {
        if (!this.ambientLoopSound.playing()) {
            if (this.muted) this.ambientLoopSound.volume(0);
            this.ambientLoopSound.play();
        }
    }

    public playRound3() {
        if (this.ambientLoopSound.playing()) {
            this.ambientLoopSound.fade(0.5, 0, 0.2)
        }

        if (this.muted) this.quickfireSound.volume(0);
        this.quickfireSound.play();
        this.quickfireSound.on("end", this.playAmbient.bind(this))
    }

    public playClick() {
        // used for landing page, round page
        if (this.muted) return;
        if (!this.clickSound.playing()) this.clickSound.play();
    }

    public playSelectedSound() {
        // used for questions
        if (this.muted) return;
        if (!this.selectedSound.playing()) this.selectedSound.play();
    }

    public playRejectedSound() {
        // used for questions
        if (this.muted) return;
        if (!this.rejectedSound.playing()) this.rejectedSound.play();
    }
    
    public mute() {
        if (this.ambientLoopSound.playing()) {
            this.ambientLoopSound.volume(0);
        }
        if (this.quickfireSound.playing()) {
            this.quickfireSound.volume(0)
        }
    }

    public unmute() {
        if (this.ambientLoopSound.playing()) {
            this.ambientLoopSound.volume(this.volume);
        }
        if (this.quickfireSound.playing()) {
            this.quickfireSound.volume(this.volume)
        }
    }
}