class Controller {
    constructor() {
        this.currentQuestion = 1;
        this.totalQuestions = 3;
        this.init()
    }

    init() {
        var forms = getElements("form");
        for (var i=0; i<forms.length; i++) {
            forms[i].addEventListener("submit", this.onFormSubmit.bind(this))
        }

        // show the first question
        show("#q" + this.currentQuestion.toString());
    }

    onFormSubmit(e) {
        var el = e.target;
        if (!el) return;

        // get current question number
        var current = parseInt(el.id.split("q")[1]);
        var next = current + 1;

        // hide answered question
        hide("#q" + current.toString());

        // show next question
        if (next <= this.totalQuestions) {
            show("#q" + next.toString(), 0.25);
            this.currentQuestion = next;
        } else {
            show("#summary", 0.25);
        }
    }

}
