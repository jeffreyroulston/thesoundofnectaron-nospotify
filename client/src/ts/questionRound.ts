import * as f from "./helpers"
import * as data from "./data"
import UI from "./ui";

export default class QuestionRound {
    private ui : UI;
    private id : string;
    private el : HTMLElement;

    constructor(ui: UI, id : string) {
        this.ui = ui;
        this.id = id;
        this.el = f.el(id);
    }

    show() {}

    hide() {}

    answerRetrieved() {
    }
}
