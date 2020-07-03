/*
 * View model for OctoPrint-M150control
 *
 * Author: Jean-Philippe Alexandre
 * License: AGPLv3
 */
$(function() {
    function M150controlViewModel(parameters) {
        var self = this;


        // assign the injected parameters, e.g.:
         self.loginState = parameters[0];
         self.settings   = parameters[1];
	 self.controls   = parameters[2];

	self.controls.autoCommit = ko.observable();
	self.notAutoCommit = ko.pureComputed(function(){
		return !self.controls.autoCommit();
	});

	self.controls.not = function(val) {
		return typeof(val) === "function" ? !val() : !val;
	}
// function(val) { return !(typeof(val) === "function" ? val() : val); };//ko.observable( !self.controls.autoCommit());
	self.controls.inCustomControl = ko.observable();

	var containerId = "#control-jog-general";
	$(containerId).after(
                "<div id=\"m150-control\" class=\"jog-panel\" data-bind=\"visible: loginState.hasPermissionKo(access.permissions.CONTROL)\">" +
                        "<h1>" + gettext('ledTitle') + "</h1>" +
                        "<div id=\"m150_control_picker\"></div>" +
                        "<input id=\"m150_control_autocommit\" type=\"checkbox\" data-bind=\"checked: settings.settings.plugins.M150Control.autoCommit\">" +
                        "<label for=\"m150_control_autocommit\">" + gettext('ledAutoSend') + "</label>" +
                        "<input type=\"button\" value=\"" + gettext('ledSend') + "\" data-bind=\"click: changeColor, visible: not(settings.settings.plugins.M150Control.autoCommit)\">" +
                "</div>");
        var colorPicker = new iro.ColorPicker('#m150_control_picker', {layoutDirection:"horizontal", width: 120});
	
	self.controls.m150control_colorPicker = colorPicker;

        colorPicker.on([ 'color:change'], function(color) {

                if ( self.settings.settings.plugins.M150Control.autoCommit() ) {
                        self.controls.changeColor(self.controls);
                }
        });

	self.controls.changeColor = function(e) {
                var {r, g, b} = e.m150control_colorPicker.color.rgb;
                //var white = 0;
		//var brightness = e.m150control_colorPicker.color.hsl.l;
                brightness = parseInt(0.2126 * r + 0.7152 * g + 0.0722 * b);

                OctoPrint.control.sendGcode("M150 R" + r + " U" + g + " B" + b + " P255");
		// + " W" + white + " P" + brightness);

        };

	self.onBeforeBinding = function() {
		self.controls.autoCommit(self.settings.settings.plugins.M150Control.autoCommit());
		self.controls.inCustomControl(self.settings.settings.plugins.M150Control.inCustomControl());
		self.settings.settings.plugins.M150Control.autoCommit.subscribe(function(newVal){
        	        self.settings.saveData();
	        });

	}

    }

    /* view model class, parameters for constructor, container to bind to
     * Please see http://docs.octoprint.org/en/master/plugins/viewmodels.html#registering-custom-viewmodels for more details
     * and a full list of the available options.
     */
    OCTOPRINT_VIEWMODELS.push({
        construct: M150controlViewModel,
        // ViewModels your plugin depends on, e.g. loginStateViewModel, settingsViewModel, ...
        dependencies: [ "loginStateViewModel", "settingsViewModel", "controlViewModel" ],
        // Elements to bind to, e.g. #settings_plugin_M150Control, #tab_plugin_M150Control, ...
        elements: [ ]
    });
});
