//META{"name":"MyTyping"}*//

/*@cc_on
@if (@_jscript)
	var shell = WScript.CreateObject("WScript.Shell");
	var fs = new ActiveXObject("Scripting.FileSystemObject");
	var pathPlugins = shell.ExpandEnvironmentStrings("%APPDATA%\\BetterDiscord\\plugins");
	var pathSelf = WScript.ScriptFullName;
	shell.Popup("It looks like you've mistakenly tried to run me directly. \\n(Don't do that!)", 0, "I'm a plugin for BetterDiscord", 0x30);
	if (fs.GetParentFolderName(pathSelf) === fs.GetAbsolutePathName(pathPlugins)) {
		shell.Popup("I'm in the correct folder already.", 0, "I'm already installed", 0x40);
	} else if (!fs.FolderExists(pathPlugins)) {
		shell.Popup("I can't find the BetterDiscord plugins folder.\\nAre you sure it's even installed?", 0, "Can't install myself", 0x10);
	} else if (shell.Popup("Should I copy myself to BetterDiscord's plugins folder for you?", 0, "Do you need some help?", 0x34) === 6) {
		fs.CopyFile(pathSelf, fs.BuildPath(pathPlugins, fs.GetFileName(pathSelf)), true);
		// Show the user where to put plugins in the future
		shell.Exec("explorer " + pathPlugins);
		shell.Popup("I'm installed!", 0, "Successfully installed", 0x40);
	}
	WScript.Quit();
@else @*/


var MyTyping = (() => {

'use strict';

var Initialized = false;
var isInTypingUsers = false;
var TypingUsersContainer;
var UsersModule;
var cancelPatches;

function Init(nonInvasive)
{
    TypingUsersContainer = BdApi.findModuleByDisplayName('FluxContainer(TypingUsers)');
	if(TypingUsersContainer == null) return 0;
	
	UsersModule = BdApi.findModuleByProps('getNullableCurrentUser');
	if(UsersModule == null) return 0;
	
	Initialized = true;
    return 1;
}

function Start() {
	if(!Initialized && Init() !== 1) return;
	
	
	cancelPatches = [];
	cancelPatches[0] = BdApi.monkeyPatch(TypingUsersContainer.prototype, 'render', {
		after: (data) => {
			cancelPatches[0] = BdApi.monkeyPatch(data.returnValue.type.prototype, 'render', {
				before: (data) => { isInTypingUsers = true },
				after:  (data) => { isInTypingUsers = false }
			});
		},
		once: true
	});
	cancelPatches[1] = BdApi.monkeyPatch(UsersModule, 'getNullableCurrentUser', {
		after: (data) => { if(isInTypingUsers) data.returnValue = null; }
	});
}

function Stop() {
	if(!Initialized) return;
	
	cancelPatches.forEach(x => x());
	isInTypingUsers = false;
}

return function() { return {
	getName: () => "MyTyping",
	getDescription: () => "Displays your typing in the chat too",
	getVersion: () => "1.0",
	getAuthor: () => "An0",
	
	start: Start,
	stop: Stop
}};

})();

module.exports = MyTyping;

/*@end @*/