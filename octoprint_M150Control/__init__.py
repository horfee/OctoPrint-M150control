# coding=utf-8
from __future__ import absolute_import

import octoprint.plugin

class M150controlPlugin(octoprint.plugin.SettingsPlugin,
                        octoprint.plugin.AssetPlugin,
                        octoprint.plugin.TemplatePlugin):

	##~~ SettingsPlugin mixin
	def get_settings_defaults(self):
		return dict(
			autoCommit=True,
			enableRGBW=True,
			inCustomControl=True,
			presets=[]
		)

	##~~ AssetPlugin mixin
	def get_assets(self):
		# Define your plugin's asset files to automatically include in the
		# core UI here.
		return dict(
			js=[
				"js/M150Control.js", 
				"js/M150Control_settings.js", 
				"js/iro.min.js"
			],
			css=["css/M150Control.css"]
		)

	##~~ TemplatePlugin mixin
	def get_template_configs(self):
		return [dict(type="settings", custom_bindings=True)]

	##~~ Softwareupdate hook
	def get_update_information(self):
		return dict(
			M150Control=dict(
				displayName="M150 Control",
				displayVersion=self._plugin_version,

				# version check: github repository
				type="github_release",
				user="horfee",
				repo="OctoPrint-M150control",
				current=self._plugin_version,

				# update method: pip
				pip="https://github.com/horfee/OctoPrint-M150control/archive/{target_version}.zip"
			)
		)


__plugin_name__ = "M150 Control"

__plugin_pythoncompat__ = ">=2.7,<4" # python 2 and 3

def __plugin_load__():
	global __plugin_implementation__
	__plugin_implementation__ = M150controlPlugin()

	global __plugin_hooks__
	__plugin_hooks__ = {
		"octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
	}

