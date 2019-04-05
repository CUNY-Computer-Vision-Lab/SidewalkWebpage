function ModalMissionComplete (uiModalMissionComplete, user, confirmationCode) {
    var self = this;

    function _handleButtonClick() {
        svv.tracker.push("ClickOk_MissionComplete");
        self.hide();
    }

    function hide () {
        uiModalMissionComplete.background.css('visibility', 'hidden');
        uiModalMissionComplete.holder.css('visibility', 'hidden');
        uiModalMissionComplete.foreground.css('visibility', 'hidden');
    }

    function show (mission) {
        var message = "You just validated " + mission.getProperty("labelsValidated") + " " +
            svv.labelTypeNames[mission.getProperty("labelTypeId")] + " labels!";

        uiModalMissionComplete.background.css('visibility', 'visible');
        uiModalMissionComplete.missionTitle.html("Great Job!");
        uiModalMissionComplete.message.html(message);
        uiModalMissionComplete.agreeCount.html(mission.getProperty("agreeCount"));
        uiModalMissionComplete.disagreeCount.html(mission.getProperty("disagreeCount"));
        uiModalMissionComplete.notSureCount.html(mission.getProperty("notSureCount"));

        uiModalMissionComplete.holder.css('visibility', 'visible');
        uiModalMissionComplete.foreground.css('visibility', 'visible');
        uiModalMissionComplete.closeButton.html('Validate more labels');
        uiModalMissionComplete.closeButton.on('click', _handleButtonClick);

        // If this is a turker and the confirmation code button hasn't been shown yet, mark amt_assignment as complete
        // and reveal the confirmation code.
        if (user.getProperty('role') === 'Turker' && confirmationCode.css('visibility') === 'hidden') {
            _markAmtAssignmentAsComplete();
            _showConfirmationCode();
            var confirmationCodeElement = document.createElement("h3");
            confirmationCodeElement.innerHTML = "<img src='/assets/javascripts/SVLabel/img/icons/Icon_OrangeCheckmark.png'  \" +\n" +
                "                \"alt='Confirmation Code icon' align='middle' style='top:-1px;position:relative;width:18px;height:18px;'> " +
                "Confirmation Code: " +
                svv.confirmationCode +
                "<p></p>";
            confirmationCodeElement.setAttribute("id", "modal-mission-complete-confirmation-text");
            uiModalMissionComplete.message.append(confirmationCodeElement);
        }
    }

    function _markAmtAssignmentAsComplete() {
        var data = {
            amt_assignment_id: svv.amtAssignmentId,
            completed: true
        };
        $.ajax({
            async: true,
            contentType: 'application/json; charset=utf-8',
            url: "/amtAssignment",
            type: 'post',
            data: JSON.stringify(data),
            dataType: 'json',
            success: function (result) {
            },
            error: function (result) {
                console.error(result);
            }
        });
    }

    function _showConfirmationCode() {
        confirmationCode.css('visibility', "");
        confirmationCode.attr('data-toggle','popover');
        confirmationCode.attr('title','Submit this code for HIT verification on Amazon Mechanical Turk');
        confirmationCode.attr('data-content', svv.confirmationCode);
        confirmationCode.popover();

        //Hide the confirmation popover on clicking the background
        //https://stackoverflow.com/questions/11703093/how-to-dismiss-a-twitter-bootstrap-popover-by-clicking-outside
        $(document).on('click', function(e) {
            confirmationCode.each(function () {
                // The 'is' for buttons that trigger popups.
                // The 'has' for icons within a button that triggers a popup.
                if (!$(this).is(e.target) && $(this).has(e.target).length === 0 && $('.popover').has(e.target).length === 0) {
                    (($(this).popover('hide').data('bs.popover')||{}).inState||{}).click = false
                }

            });
        });
    }

    self.hide = hide;
    self.show = show;
}
