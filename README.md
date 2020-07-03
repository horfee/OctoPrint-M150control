# OctoPrint-M150control

This plugin adds a new control in the control tab, allowing users to send M150 commands to the printer.
Quite simple.

## Setup

Install via the bundled [Plugin Manager](https://docs.octoprint.org/en/master/bundledplugins/pluginmanager.html)
or manually using this URL:

    https://github.com/horfee/OctoPrint-M150control/archive/master.zip

## Configuration

You can choose to install the new control in the regular control section, or in the custom controls.
This parameter is useful if you do not use themeify to get a wide display.

Also you can choose to send automatically the M150 command as soon as the color changes (be careful : if this option is enabled, the user will be able to drag the mouse while clicking, overloading the printer with M150 commandes !)

