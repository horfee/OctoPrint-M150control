/*
 * View Model for M150Control settings
 *
 * Author : Jean-Philippe Alexandre
 * Licence : AGPLv3
 */

$(function () {
    function M150ControlSettingsViewModel(parameters){
	var self = this;
        self.settings = parameters[0];
        self.addPreset = function () {
            self.settings.settings.plugins.M150Control.presets.push({
                name: 'Color-' + (self.settings.settings.plugins.M150Control.presets.length + 1),
                color: "#FFFFFF",
                active: true
            });
        }
        self.removePreset = function (preset) {
            self.settings.settings.plugins.M150Control.presets.remove(preset);
        }
        self.movePresetUp = function (preset) {
            self.moveItemUp(self.settings.settings.plugins.M150Control.presets, preset);
        }

        self.movePresetDown = function (preset) {
            self.moveItemDown(self.settings.settings.plugins.M150Control.presets, preset);
        }

        self.moveItemDown = function(list, item) {
            var i = list().indexOf(item);
            if (i < list().length - 1) {
                var rawList = list();
               list.splice(i, 2, rawList[i + 1], rawList[i]);
            }
         }

         self.moveItemUp = function(list, item) {
            var i = list().indexOf(item);
            if (i > 0) {
               var rawList = list();
               list.splice(i-1, 2, rawList[i], rawList[i-1]);
            }
         }
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: M150ControlSettingsViewModel,
        dependencies: ["settingsViewModel"],
        elements: ["#settings_plugin_M150Control"]
    });

});
