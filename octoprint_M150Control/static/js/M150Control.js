/*
 * View model for OctoPrint-M150control
 *
 * Author: Jean-Philippe Alexandre
 * License: AGPLv3
 */
$(function() {
    function componentToHex(c) {
      var hex = c.toString(16);
      return hex.length == 1 ? "0" + hex : hex;
    }

    function rgbToHex(color) {
      if ( typeof(color) === "string" ) return color;
      return "#" + componentToHex(color.r) + componentToHex(color.g) + componentToHex(color.b);
    }

    function hexToRgb(hex) {
      var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null;
    }


    function M150controlViewModel(parameters) {
        var self = this;
        self.loginState = parameters[0];
        self.settings   = parameters[1];
        self.controls   = parameters[2];

        self.controls.brightness = ko.observable(100);
        self.controls.whiteBrightness = ko.observable(0);
        self.controls.color = ko.observable({r:0, g:0, b:0});

    	self.controls.not = function(val) {
    		return typeof(val) === "function" ? !val() : !val;
    	}

        // triggered when user press a preset color
    	self.controls.changePresetColor = function(bindings, event) {
    		self.controls.m150control_colorPicker.color.hexString = bindings.color();
    	};

        
        // send command to change the color through M150 gcode
        self.controls.changeColor = function(e) {
            var {b,g,r} = self.controls.color();
            var w = self.controls.whiteBrightness();
            var brightness = self.controls.brightness();

            r = parseInt((r * brightness) / 100);
            g = parseInt((g * brightness) / 100);
            b = parseInt((b * brightness) / 100);

            w = parseInt((255 * w) / 100);
            OctoPrint.control.sendGcode("M150 R" + r + " U" + g + " B" + b + " W" + w + " P255");

            self.settings.settings.plugins.M150Control.lastBrightnessSent(brightness);
            self.settings.settings.plugins.M150Control.lastColorSent(rgbToHex(self.controls.color()));
            self.settings.settings.plugins.M150Control.lastWhiteColorSent(self.controls.whiteBrightness());
            self.settings.saveData();
        };
        


        var containerId = "#control-jog-general";
        $(containerId).after(
            "<div id=\"m150-control\" class=\"jog-panel\" data-bind=\"visible: loginState.hasPermissionKo(access.permissions.CONTROL)\">" +
            "   <h1>" + gettext('LED') + "</h1>" +
            "   <div data-bind=\"foreach: settings.settings.plugins.M150Control.presets\" class=\"m150controlpalette\">" +
            "       <button class=\"m150ControlButton\" data-bind=\"visible: active, style: {background: color}, click: $parent.changePresetColor\">" +
            "   </div>" +
            "   <div style=\"display: flex; flex-direction: column; align-items: center;\">" +
            "       <div style=\"display: flex; height: 120px; justify-content: center;\">" +
            "           <div id=\"m150_control_picker\"></div>" +
            "           <input type=\"number\" data-bind=\"slider: {reversed: true, selection: 'after', orientation: 'vertical', min: 0, max: 100, step: 1, value: brightness, formatter: brightNessPct}\">" +
            "       </div>" +
            "       <input type=\"number\" data-bind=\"slider: {min: 0, max: 100, step: 1, orientation: 'horizontal', value: whiteBrightness, tooltip: 'show', formatter: whiteBrightnessPct}\">" +
            "   </div>" +
            "   <div style=\"display:flex; align-items: center; height: 32px; justify-content: center;\">" +
            "       <input id=\"m150_control_autocommit\" type=\"checkbox\" style=\"margin: 2px;\" data-bind=\"checked: settings.settings.plugins.M150Control.autoCommit\">" +
            "       <label for=\"m150_control_autocommit\" style=\"margin: 2px\">" + gettext('Send auto.') + "</label>" +
            "       <input type=\"button\" style=\"margin: 2px;\" value=\"" + gettext('Send') + "\" data-bind=\"click: changeColor, visible: not(settings.settings.plugins.M150Control.autoCommit)\">" +
            "   </div>" +
            "</div>"
        );

        self.controls.brightNessPct = function(value) {
            return gettext("brightness ") + value + " %";
        }

        self.controls.whiteBrightnessPct = function(value) {
            return gettext("White brightness ") + value + " %";   
        }


        self.onBeforeBinding = function() {
            self.controls.brightness( self.settings.settings.plugins.M150Control.lastBrightnessSent());
            self.controls.whiteBrightness( self.settings.settings.plugins.M150Control.lastWhiteColorSent());
            self.controls.color( hexToRgb(self.settings.settings.plugins.M150Control.lastColorSent()));

            var _f = function(newVal) {
                if ( self.settings.settings.plugins.M150Control.autoCommit() ) {
                    self.controls.changeColor();
                }
            };

            self.controls.color.subscribe( _f );
            self.controls.brightness.subscribe( _f );
            self.controls.whiteBrightness.subscribe( _f );

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

            var lastColorSent = self.controls.color() === "" ? "#FFFFFF" : self.controls.color();
            var colorPicker = new iro.ColorPicker('#m150_control_picker', {layout:[ { component: iro.ui.Wheel}], width: 120, color: lastColorSent});
            self.controls.m150control_colorPicker = colorPicker;

            colorPicker.on([ 'color:change'], function(color) {
                self.controls.color(color.rgb);
            });


            }
        }


    OCTOPRINT_VIEWMODELS.push({
        construct: M150controlViewModel,
        dependencies: [ "loginStateViewModel", "settingsViewModel", "controlViewModel" ],
        // Elements to bind to, e.g. #settings_plugin_M150Control, #tab_plugin_M150Control, ...
        elements: [ ]
    });
});
