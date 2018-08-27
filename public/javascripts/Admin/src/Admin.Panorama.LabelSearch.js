/**
 *
 *
 * @param svHolder: One single DOM element
 * @returns {{className: string}}
 * @constructor
 */
function AdminPanoramaLabelSearch(svHolder) {
    var self = {
        className: "AdminPanoramaLabelSearch",
        labelMarker: undefined,
        panorama: undefined
    };

    var icons = {
        CurbRamp : 'assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_CurbRamp.png',
        NoCurbRamp : 'assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_NoCurbRamp.png',
        Obstacle : 'assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_Obstacle.png',
        SurfaceProblem : 'assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_SurfaceProblem.png',
        Other : 'assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_Other.png',
        Occlusion : 'assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_Other.png',
        NoSidewalk : 'assets/javascripts/SVLabel/img/admin_label_tool/AdminTool_NoSidewalk.png'
    };

    // Adjust zoom level for GSV Panorama
    var zoomLevel = {
        1: 1.55,
        2: 2.55,
        3: 3.6
    };

    /**
     * This function initializes the Panorama
     */
    function _init () {
        self.svHolder = $(svHolder);
        self.svHolder.addClass("admin-panorama");

        // svHolder's children are absolutely aligned, svHolder's position has to be either absolute or relative
        if(self.svHolder.css('position') != "absolute" && self.svHolder.css('position') != "relative")
            self.svHolder.css('position', 'relative');

        // GSV will be added to panoCanvas
        self.panoCanvas = $("<div id='pano'>").css({
            width: self.svHolder.width(),
            height: self.svHolder.height()
        })[0];

        // Add them to svHolder
        self.svHolder.append($(self.panoCanvas));

        self.panorama = new google.maps.StreetViewPanorama(self.panoCanvas, { mode: 'html4' });
        self.panoId = null;

        if (self.panorama) {
            self.panorama.set('addressControl', false);
            self.panorama.set('clickToGo', false);
            self.panorama.set('disableDefaultUI', true);
            self.panorama.set('linksControl', false);
            self.panorama.set('navigationControl', false);
            self.panorama.set('panControl', false);
            self.panorama.set('zoomControl', false);
            self.panorama.set('keyboardShortcuts', false);
            self.panorama.set('motionTracking', false);
            self.panorama.set('motionTrackingControl', false);
            self.panorama.set('showRoadLabels', false);
        }

        return this;
    }

    /**
     * @param newId
     */
    function changePanoId(newId) {
        if(self.panoId != newId) {
            self.panorama.setPano(newId);
            self.panoId = newId;
            self.refreshGSV();
        }
        return this;
    }

    /**
     * @param options: The options object should have "heading", "pitch" and "zoom" keys
     */
    function setPov(coords) {
        self.panorama.set('pov', {heading: coords['heading'], pitch: coords['pitch']});
        // self.panorama.set('zoom', coords['zoom']);
        self.panorama.set('zoom', zoomLevel[coords['zoom']]);
        return this;
    }

    /**
     * Renders a panomarker on canvas
     * @param label: instance of AdminPanoramaLabel
     * @returns {renderLabel}
     */
    function renderLabel (label) {
        var url = icons[label['label_type']];
        var pos = getPosition(label['canvas_x'], label['canvas_y'], label['canvas_width'],
            label['canvas_height'], label['zoom'], label['heading'], label['pitch']);

        self.labelMarker = new PanoMarker ({
            container: self.panoCanvas,
            pano: self.panorama,
            // position: new google.maps.LatLng(labelCoords['lat'], labelCoords['lng']),
            position: {heading: pos.heading, pitch: pos.pitch},
            icon: url,
            size: new google.maps.Size(20, 20),
            anchor: new google.maps.Point(10, 10)
        });

        google.maps.event.addListener(self.labelMarker, 'click', function() {
            self.labelMarker.setVisible(false);
        });

        return this;
    }

    /**
     * Calculates heading and pitch for a Google Maps marker using (x, y) coordinates
     * @param canvas_x          X coordinate (pixel) for label
     * @param canvas_y          Y coordinate (pixel) for label
     * @param canvas_width      Original canvas width
     * @param canvas_height     Original canvas height
     * @param zoom              Original zoom level of label
     * @param heading           Original heading of label
     * @param pitch             Original pitch of label
     * @returns {{heading: number, pitch: number}}
     */
    function getPosition(canvas_x, canvas_y, canvas_width, canvas_height, zoom, heading, pitch) {
        function sgn(x) {
            return x >= 0 ? 1 : -1;
        }

        var PI = Math.PI;
        var cos = Math.cos;
        var sin = Math.sin;
        var tan = Math.tan;
        var sqrt = Math.sqrt;
        var atan2 = Math.atan2;
        var asin = Math.asin;
        var fov = get3dFov(zoom) * PI / 180.0;
        var width = canvas_width;
        var height = canvas_height;
        var h0 = heading * PI / 180.0;
        var p0 = pitch * PI / 180.0;
        var f = 0.5 * width / tan(0.5 * fov);
        var x0 = f * cos(p0) * sin(h0);
        var y0 = f * cos(p0) * cos(h0);
        var z0 = f * sin(p0);
        var du = (canvas_x) - width / 2;
        var dv = height / 2 - (canvas_y - 5);
        var ux = sgn(cos(p0)) * cos(h0);
        var uy = -sgn(cos(p0)) * sin(h0);
        var uz = 0;
        var vx = -sin(p0) * sin(h0);
        var vy = -sin(p0) * cos(h0);
        var vz = cos(p0);
        var x = x0 + du * ux + dv * vx;
        var y = y0 + du * uy + dv * vy;
        var z = z0 + du * uz + dv * vz;
        var R = sqrt(x * x + y * y + z * z);
        var h = atan2(x, y);
        var p = asin(z / R);
        return {
            heading: h * 180.0 / PI,
            pitch: p * 180.0 / PI
        };
    }

    /**
     * From panomarker spec
     * @param zoom
     * @returns {number}
     */
    function get3dFov (zoom) {
        return zoom <= 2 ?
            126.5 - zoom * 36.75 :  // linear descent
            195.93 / Math.pow(1.92, zoom); // parameters determined experimentally
    }


    /*
     * Sometimes strangely the GSV is not shown, calling this function might fix it
     * related:http://stackoverflow.com/questions/18426083/how-do-i-force-redraw-with-google-maps-api-v3-0
     */
    function refreshGSV() {
        if (typeof google != "undefined")
            google.maps.event.trigger(self.panorama,'resize');
    }

    //init
    _init();

    self.changePanoId = changePanoId;
    self.setPov = setPov;
    self.renderLabel = renderLabel;
    self.refreshGSV = refreshGSV;
    return self;
}