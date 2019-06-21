/**
 * Represents a validation label
 * @returns {Label}
 * @constructor
 */
function Label(params) {
    // Original properties of the label. These properties are initialized from metadata from the
    // backend. These properties are used to help place the label on the validation interface
    // and should not be changed.
    var originalProperties = {
        canvasHeight: undefined,
        canvasWidth: undefined,
        canvasX: undefined,
        canvasY: undefined,
        heading: undefined,
        labelId: undefined,
        labelType: undefined,
        pitch: undefined,
        zoom: undefined,
        isMobile: undefined
    };

    // These properties are set through validating labels. In this object, canvas properties and
    // heading/pitch/zoom are from the perspective of the user that is validating the labels.
    var validationProperties = {
        canvasX: undefined,
        canvasY: undefined,
        endTimestamp: undefined,
        labelId: undefined,
        heading: undefined,
        pitch: undefined,
        startTimestamp: undefined,
        validationResult: undefined,
        zoom: undefined,
        isMobile: undefined
    };

    if (isMobile()) {
        var icons = {
            CurbRamp : '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_CurbRamp_Mobile.png',
            NoCurbRamp : '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_NoCurbRamp_Mobile.png',
            Obstacle : '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_Obstacle_Mobile.png',
            SurfaceProblem : '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_SurfaceProblem_Mobile.png',
            Other : '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_Other_Mobile.png',
            Occlusion : '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_Other_Mobile.png',
            NoSidewalk : '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_NoSidewalk_Mobile.png'
        };
    } else {
        var icons = {
            CurbRamp: '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_CurbRamp.png',
            NoCurbRamp: '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_NoCurbRamp.png',
            Obstacle: '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_Obstacle.png',
            SurfaceProblem: '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_SurfaceProblem.png',
            Other: '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_Other.png',
            Occlusion: '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_Other.png',
            NoSidewalk: '/assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_NoSidewalk.png'
        };
    }

    // Labels are circles with a 10px radius.
    if (isMobile()) {
        var radius = 25;
    } else {
        var radius = 10;
    }

    var self = this;

    /**
     * Initializes a label from metadata (if parameters are passed in)
     * @private
     */
    function _init() {
        if (params) {
            if ("canvasHeight" in params) setOriginalProperty("canvasHeight", params.canvasHeight);
            if ("canvasWidth" in params) setOriginalProperty("canvasWidth", params.canvasWidth);
            if ("canvasX" in params) setOriginalProperty("canvasX", params.canvasX);
            if ("canvasY" in params) setOriginalProperty("canvasY", params.canvasY);
            if ("gsvPanoramaId" in params) setOriginalProperty("gsvPanoramaId", params.gsvPanoramaId);
            if ("heading" in params) setOriginalProperty("heading", params.heading);
            if ("labelId" in params) setOriginalProperty("labelId", params.labelId);
            if ("labelId" in params) setValidationProperty("labelId", params.labelId);
            if ("labelType" in params) setOriginalProperty("labelType", params.labelType);
            if ("pitch" in params) setOriginalProperty("pitch", params.pitch);
            if ("zoom" in params) setOriginalProperty("zoom", params.zoom);
            if (isMobile()) {
                setOriginalProperty("isMobile", 1);
            } else {
                setOriginalProperty("isMobile", 0);
            }
        }
    }

    /**
     * Gets the file path associated with the labels' icon type.
     * @returns {*} String - Path of image in the directory.
     */
    function getIconUrl() {
        return icons[originalProperties.labelType];
    }

    /**
     * Returns a specific originalProperty of this label.
     * @param key   Name of property.
     * @returns     Value associated with this key.
     */
    function getOriginalProperty (key) {
        return key in originalProperties ? originalProperties[key] : null;
    }

    /**
     * Returns the entire originalProperty object for this label.
     * @returns Object for originalProperties.
     */
    function getOriginalProperties () {
        return originalProperties;
    }

    /**
     * Gets the position of this label from the POV from which it was originally placed.
     * @returns {heading: number, pitch: number}
     */
    function getPosition () {
        // This calculates the heading and position for placing this Label onto the panorama from
        // the same POV as when the user placed the label.
        var pos = svv.util.properties.panorama.getPosition(getOriginalProperty('canvasX'),
            getOriginalProperty('canvasY'), getOriginalProperty('canvasWidth'),
            getOriginalProperty('canvasHeight'), getOriginalProperty('zoom'),
            getOriginalProperty('heading'), getOriginalProperty('pitch'));
        return pos;
    }

    /**
     * Gets the radius of this label.
     * @returns {number}
     */
    function getRadius () {
        return radius;
    }

    /**
     * Returns the entire validationProperties object for this label.
     * @returns Object for validationProperties.
     */
    function getValidationProperties () {
        return validationProperties;
    }

    /**
     * Gets a specific validationProperty of this label.
     * @param key   Name of property.
     * @returns     Value associated with this key.
     */
    function getValidationProperty (key) {
        return key in validationProperties ? validationProperties[key] : null;
    }

    /**
     * Sets the value of a single property in originalProperties.
     * @param key   Name of property
     * @param value Value to set property to.
     */
    function setOriginalProperty(key, value) {
        originalProperties[key] = value;
        return this;
    }

    /**
     * Sets the value of a single property in validationProperties.
     * @param key   Name of property
     * @param value Value to set property to.
     */
    function setValidationProperty(key, value) {
        validationProperties[key] = value;
        return this;
    }

    /**
     * Updates validation status for Label, StatusField and logs interactions into Tracker. Occurs
     * when a validation button is clicked.
     *
     * NOTE: canvas_x and canvas_y are null when the label is not visible when validation occurs.
     *
     * @param validationResult  Must be one of the following: {Agree, Disagree, Unsure}.
     */
    function validate(validationResult) {
        // This is the POV of the PanoMarker, where the PanoMarker would be loaded at the center
        // of the viewport.
        var pos = getPosition();
        var panomarkerPov = {
            heading: pos.heading,
            pitch: pos.pitch
        };

        // This is the POV of the viewport center - this is where the user is looking.
        var userPov = svv.panorama.getPov();
        var zoom = svv.panorama.getZoom();

        // Calculates the center xy coordinates of the Label on the current viewport.
        var pixelCoordinates = svv.util.properties.panorama.povToPixel3d(panomarkerPov, userPov,
            zoom, svv.canvasWidth, svv.canvasHeight);

        // If the user has panned away from the label and it is no longer visible on the canvas, set canvasX/Y to null.
        // We add/subtract the radius of the label so that we still record these values when only a fraction of the
        // labe is still visible.
        let labelCanvasX = null;
        let labelCanvasY = null;
        if (pixelCoordinates
            && pixelCoordinates.left + getRadius() > 0
            && pixelCoordinates.left - getRadius() < svv.canvasWidth
            && pixelCoordinates.top + getRadius() > 0
            && pixelCoordinates.top - getRadius() < svv.canvasHeight) {

            labelCanvasX = pixelCoordinates.left - getRadius();
            labelCanvasY = pixelCoordinates.top - getRadius();
        }

        setValidationProperty("endTimestamp", new Date().getTime());
        setValidationProperty("canvasX", labelCanvasX);
        setValidationProperty("canvasY", labelCanvasY);
        setValidationProperty("heading", userPov.heading);
        setValidationProperty("pitch", userPov.pitch);
        setValidationProperty("zoom", userPov.zoom);
        if (isMobile()) {
            setValidationProperty("isMobile", 1);
        } else {
            setValidationProperty("isMobile", 0);
        }

        switch (validationResult) {
            // Agree option selected.
            case "Agree":
                setValidationProperty("validationResult", 1);
                svv.missionContainer.getCurrentMission().updateValidationResult(1);
                svv.labelContainer.push(getValidationProperties());
                svv.missionContainer.updateAMission();
                break;
            // Disagree option selected.
            case "Disagree":
                setValidationProperty("validationResult", 2);
                svv.missionContainer.getCurrentMission().updateValidationResult(2);
                svv.labelContainer.push(getValidationProperties());
                svv.missionContainer.updateAMission();
                break;
            // Not sure option selected.
            case "NotSure":
                setValidationProperty("validationResult", 3);
                svv.missionContainer.getCurrentMission().updateValidationResult(3);
                svv.labelContainer.push(getValidationProperties());
                svv.missionContainer.updateAMission();
                break;
        }

        // If there are more labels left to validate, add a new label to the panorama.
        // Otherwise, we will load a new label onto the panorama from Form.js - where we still need
        // to retrieve 10 more labels for the next mission.
        if (!svv.missionContainer.getCurrentMission().isComplete()) {
            svv.panoramaContainer.loadNewLabelOntoPanorama();
        }
    }

    function isMobile() {
        var isMobile = false; //initiate as false
        // device detection
        if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0, 4))) {
            isMobile = true;
        }
        return isMobile;
    }

    _init();

    self.getIconUrl = getIconUrl;
    self.getOriginalProperty = getOriginalProperty;
    self.getPosition = getPosition;
    self.getRadius = getRadius;
    self.getValidationProperty = getValidationProperty;
    self.getOriginalProperties = getOriginalProperties;
    self.getValidationProperties = getValidationProperties;
    self.setValidationProperty = setValidationProperty;
    self.validate = validate;

    return this;
}
