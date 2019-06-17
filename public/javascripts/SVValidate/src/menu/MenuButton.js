/**
 * Initializes a grouping of menu buttons. A group of menu-buttons also contain the same IDs.
 * The type of menu buttons that are currently in use are agree, disagree and not sure.
 * @param           ID of this group of buttons.
 * @constructor
 */
function MenuButton(id) {
    let agreeButtonId = "validation-agree-button-" + id;
    let disagreeButtonId = "validation-disagree-button-" + id;
    let notSureButtonId = "validation-not-sure-button-" + id;
    let self = this;

    console.log("Created menu button");
    self.agreeButton = $("#" + agreeButtonId);
    self.disagreeButton = $("#" + disagreeButtonId);
    self.notSureButton = $("#" + notSureButtonId);
    console.log(self);

    self.agreeButton.click(function() {
        console.log(self.agreeButton);
        validateLabel("Agree");
    });

    self.disagreeButton.click(function() {
        console.log(self.disagreeButton);
        validateLabel("Disagree");
    });

    self.notSureButton.click(function() {
        console.log(self.notSureButton);
        validateLabel("NotSure");
    });

    /**
     * Validates a single label from a button click.
     * @param action    {String} Validation action - must be agree, disagree, or not sure.
     */
    function validateLabel (action) {
        let timestamp = new Date().getTime();
        svv.tracker.push("ValidationButtonClick_" + action);

        // Resets CSS elements for all buttons to their default states
        self.agreeButton.removeClass("validate");
        self.disagreeButton.removeClass("validate");
        self.notSureButton.removeClass("validate");

        // If enough time has passed between validations, log validations
        if (timestamp - svv.panorama.getProperty('validationTimestamp') > 800) {
            svv.panoramaContainer.validateLabelFromPano(id, action, timestamp);

            // svv.panorama.getCurrentLabel().validate(action);
            // svv.panorama.setProperty('validationTimestamp', timestamp);
        }
    }

    return self;
}
