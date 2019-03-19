/**
 * Handles info button functionality. Used for mobile. Pops up information about the current label.
 * @param uiModal
 * @returns {Modal Info}
 * @constructor
 */

function ModalInfo (uiModal) {
    var self = this;

    var infoHeaderHTML = '<p>What is a __LABELTYPE_PLACEHOLDER__?</p>';
    var descriptionHTML = '<p>__DESCRIPTION_PLACEHOLDER__</p>';

    function _handleButtonClick() {
        svv.tracker.push("ModalInfo_ClickOK");
        hide();
    }


    function hide () {
        uiModal.background.css('visibility', 'hidden');
        uiModal.holder.css('visibility', 'hidden');
        uiModal.foreground.css('visibility', 'hidden');
    }

    function setMissionInfo(mission) {
        infoHeaderHTML = infoHeaderHTML.replace("__LABELTYPE_PLACEHOLDER__", svv.labelTypeNames[mission.getProperty("labelTypeId")]);
        descriptionHTML = descriptionHTML.replace("__DESCRIPTION_PLACEHOLDER__", mission.getLabelTypeDescription(mission.getProperty("labelTypeId")));
    }

    function show () {
        uiModal.background.css('visibility', 'visible');
        uiModal.holder.css('visibility', 'visible');
        uiModal.foreground.css('visibility', 'visible');
        uiModal.infoHeader.html(infoHeaderHTML);
        uiModal.description.html(descriptionHTML);
        uiModal.closeButton.html('x');
        uiModal.closeButton.on('click', _handleButtonClick);
    }

    uiModal.infoButton.on("click", show);

    self.hide = hide;
    self.setMissionInfo = setMissionInfo;
    self.show = show;

    return this;
}
