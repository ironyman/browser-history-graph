import * as visit from './visit.js';

export class NavigationListener {
	constructor() {
		console.log("Creating NavigationListener");
		this.currentTabs = {};
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/Tab

		browser.tabs.onActivated.addListener(this.onTabActivated.bind(this));
		browser.tabs.onUpdated.addListener(this.onTabUpdated.bind(this));
		browser.tabs.onRemoved.addListener(this.onTabRemoved.bind(this));
		browser.tabs.onCreated.addListener(this.onTabCreated.bind(this));
		browser.tabs.onMoved.addListener(this.onTabMoved.bind(this));
		// browser.windows.onFocusChanged.addListener(this.onWindowFocusChanged);
		// browser.windows.onCreated.addListener(this.onWindowCreated);
		// browser.windows.onRemoved.addListener(this.onWindowRemoved);
		// browser.downloads.onChanged.addListener(handleDownloadsChanged);

		// Doesn't work.
		// const filter = {
		//     url:
		//     [
		//         {hostContains: "*"},
		//         {hostPrefix: "*"}
		//     ]
		// };
		// browser.webNavigation.onBeforeNavigate.addListener(this.onBeforeNavigate, filter);
	}
	onTabActivated(activeInfo) {
		// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/tabs/onActivated
		// console.log(`onTabActivated: Tab ${activeInfo.tabId} was activated`);
	}
	onTabUpdated(tabId, changeInfo, tabInfo) {
		// console.log(`onTabUpdated: Updated tab: ${tabId}`);
		// console.log("onTabUpdated: Changed attributes: ", changeInfo.status);
		// console.log("onTabUpdated: New tab Info: ", tabInfo);
		try {
			if (changeInfo.url) {
				console.log(`onTabUpdated: Tab: ${tabId} URL changed to ${changeInfo.url}`);

				let existingTab;
				existingTab = this.currentTabs[tabId];

				if (existingTab === undefined) {
					console.log("onTabUpdated: Ooops this tab doesn't exist, create it now");
					this.onTabCreated(tabInfo);
					return;
				}
				// console.log(`onTabUpdated: ${tab.url}`);
				// Ignore refreshes.
				if (existingTab.url == changeInfo.url) {
					return;
				}

				let edge = new visit.Visit(changeInfo.title, changeInfo.url, changeInfo.status, existingTab.url);
				console.log(edge.serializeJson());
				edge.save();
				this.currentTabs[tabId] = tabInfo;
			}
		} catch (e) {
			console.log("Failed to get onTabUpdated", e.toString());
		}
	}
	onTabRemoved(tabId, removeInfo) {
		console.log(`onTabRemoved: Tab: ${tabId} is closing`);
		console.log(`onTabRemoved: Window ID: ${removeInfo.windowId}`);
		console.log(`onTabRemoved: Window is closing: ${removeInfo.isWindowClosing}`);
		delete this.currentTabs[tabId];
	}
	onTabMoved(tabId, moveInfo) {
		console.log(`onTabMoved: Tab ${tabId} moved from ${moveInfo.fromIndex} to ${moveInfo.toIndex}`);
	}
	onTabCreated(tab) {
		console.log(`onTabCreated: Tab ${tab.id}, ${tab.url}`);
		this.currentTabs[tab.id] = tab;

		if (tab.url != "about:blank" && tab.url != "about:newtab") {
			let edge = new visit.Visit(tab.title, tab.url, tab.status, "");
			console.log(edge.serializeJson());
			edge.save();
		}
	}
	// onBeforeNavigate(details) {
	//     console.log(`onBeforeNavigate to: ${details.url}`);
	// }
}



// // https://developer.chrome.com/docs/extensions/mv3/messaging/
// // https://developer.chrome.com/docs/extensions/reference/runtime/
// // For firefox background.js has access to theme information. Popup does not.
// // Chrome doesn't have this.
// chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
// 	if (message === 'get-current-theme') {
// 		// Only firefox supports this.
// 		if (browser) {
// 			browser.theme.getCurrent().then(function (theme) {
// 				console.log("got theme", theme);
// 				sendResponse(theme);
// 			});
// 		} else {
// 			sendResponse(null);
// 		}
// 		return true;
// 	}
// });

