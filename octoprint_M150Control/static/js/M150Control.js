/*
 * View model for OctoPrint-M150control
 *
 * Author: Jean-Philippe Alexandre
 * License: AGPLv3
 */
$(function() {
    function M150controlViewModel(parameters) {
        var self = this;
        self.loginState = parameters[0];
        self.settings   = parameters[1];
        self.controls   = parameters[2];

    	self.controls.not = function(val) {
    		return typeof(val) === "function" ? !val() : !val;
    	}


        // triggered when user press a preset color
    	self.controls.changePresetColor = function(bindings, event) {
    		self.controls.m150control_colorPicker.color.hexString = bindings.color();
    	};


        // send command to change the color through M150 gcode
        self.controls.changeColor = function(e) {
            var {r, g, b} = e.m150control_colorPicker.color.rgb;
            var w = (e.m150control_whiteColorPicker.color.hsl.l * 255) / 100;
            OctoPrint.control.sendGcode("M150 R" + r + " U" + g + " B" + b + " W" + w + " P255");

            self.settings.settings.plugins.M150Control.lastColorSent(e.m150control_colorPicker.color.hexString);
            self.settings.settings.plugins.M150Control.lastWhiteColorSent(e.m150control_whiteColorPicker.color.hexString);
            self.settings.saveData();
        };


        var containerId = "#control-jog-general";
        $(containerId).after(
            "<div id=\"m150-control\" class=\"jog-panel\" data-bind=\"visible: loginState.hasPermissionKo(access.permissions.CONTROL)\">" +
            "   <h1>" + gettext('LED') + "</h1>" +
            "   <div data-bind=\"foreach: settings.settings.plugins.M150Control.presets\" class=\"m150controlpalette\">" +
            "       <div class=\"m150ControlButton\" data-bind=\"visible: active, style: {background: color}, click: $parent.changePresetColor\"/>" +
            "   </div>" +
            "   <div id=\"m150_control_picker\"></div>" +
            "   <div id=\"m150_control_picker_white\" data-bind=\"visible: settings.settings.plugins.M150Control.enableRGBW\"></div>" +
            "   <input id=\"m150_control_autocommit\" type=\"checkbox\" data-bind=\"checked: settings.settings.plugins.M150Control.autoCommit\">" +
            "   <label for=\"m150_control_autocommit\">" + gettext('Send auto.') + "</label>" +
            "   <input type=\"button\" value=\"" + gettext('Send') + "\" data-bind=\"click: changeColor, visible: not(settings.settings.plugins.M150Control.autoCommit)\">" +
            "</div>"
        );

        self.onBeforeBinding = function() {
            self.settings.settings.plugins.M150Control.autoCommit.subscribe(function(newVal){
                self.settings.saveData();
            });

            self.settings.settings.plugins.M150Control.inCustomControl.subscribe(function(newVal){
                var containerId = "#control-jog-general";
                if ( newVal ) {
                    containerId = "#control-jog-custom";
                }
                $(containerId).append($("#m150-control"));
            });

            if ( self.settings.settings.plugins.M150Control.inCustomControl() ) {
                $("#control-jog-custom").append($("#m150-control"));
            }

            var lastColorSent = self.settings.settings.plugins.M150Control.lastColorSent() === "" ? "#FFFFFF" : self.settings.settings.plugins.M150Control.lastColorSent();
            var lastWhiteColorSent = self.settings.settings.plugins.M150Control.lastWhiteColorSent() === "" ? "#000000" : self.settings.settings.plugins.M150Control.lastWhiteColorSent();

            var colorPicker = new iro.ColorPicker('#m150_control_picker', {layoutDirection:"horizontal", width: 120, color: lastColorSent});
            var whiteColorPicker = new iro.ColorPicker('#m150_control_picker_white', {
                    layout: [ { component: iro.ui.Slider} ],
                    color: lastWhiteColorSent,
                    width: 120,
                    layoutDirection: "vertical"
                });

            self.controls.m150control_whiteColorPicker = whiteColorPicker;  
            self.controls.m150control_colorPicker = colorPicker;

            whiteColorPicker.on(['color:change'], function(color){
                if ( self.settings.settings.plugins.M150Control.autoCommit() ) {
                    self.controls.changeColor(self.controls);
                }
            });

            colorPicker.on([ 'color:change'], function(color) {
                if ( self.settings.settings.plugins.M150Control.autoCommit() ) {
                    self.controls.changeColor(self.controls);
                }
            });


            }
        }


    OCTOPRINT_VIEWMODELS.push({
        construct: M150controlViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: [ "loginStateViewModel", "settingsViewModel", "controlViewModel" ],
        // Elements to bind to, e.g. #settings_plugin_M150Control, #tab_plugin_M150Control, ...
        elements: [ ]
    });
});
