
// Set correct icon status depending on whether the container specified to hold the xml is contained.
chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
		chrome.browserAction.setIcon({
			path: request.newIconPath,
			tabId: sender.tab.id
		});
	});

// Shows/hides modal containing formatter xml.
chrome.browserAction.onClicked.addListener(function(tab) {
	chrome.tabs.sendMessage(tab.id, {action: 'toggle'}, function(response) {
	});
});