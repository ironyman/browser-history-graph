import * as visit from './visit.js';

// Should I use pojo or class??
// https://technotes.nustechnology.com/some-common-idioms-which-javascript-developers-should-know-part-2
// https://stackoverflow.com/questions/36419713/are-es6-classes-just-syntactic-sugar-for-the-prototypal-pattern-in-javascript
// https://masteringjs.io/tutorials/fundamentals/pojo

export class NavigationListener {
  constructor() {
    // console.log("Creating NavigationListener");

    // map tabId -> tabInfo
    this.currentTabs = {};
    // map tabId -> Visit
    this.history = {};

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
    // console.log("onTabUpdated: Changed attributes: ", changeInfo.title);
    // console.log("onTabUpdated: Changed attributes: ", changeInfo.url);
    // console.log("onTabUpdated: New tab Info: ", tabInfo.status);
    // console.log("onTabUpdated: New tab Info: ", tabInfo.title);
    // console.log("onTabUpdated: New tab Info: ", tabInfo.url);
    try {
      if (tabInfo.status == "loading") {
        if (changeInfo.url) {
          console.log(`onTabUpdated: Tab: ${tabId} URL changed to ${changeInfo.url}`);

          let existingTab = this.currentTabs[tabId];
          if (existingTab === undefined) {
            console.log("onTabUpdated: Ooops this tab doesn't exist, create it now");
            this.onTabCreated(tabInfo);
            return;
          }

          let existingVisit = this.history[tabId];
          if (existingVisit === undefined) {
            console.log("onTabUpdated: Ooops this history doesn't exist, tragic");
            alert("onTabUpdated: Ooops this history doesn't exist, tragic");
            return;
          }

          // console.log(`onTabUpdated: ${tab.url}`);
          // Ignore refreshes.
          if (existingTab.url == changeInfo.url) {
            return;
          }

          this.history[tabId] = new visit.Visit({
            title: changeInfo.title,
            url: changeInfo.url,
            status: changeInfo.status,
            fromUrl: existingTab.url,
            fromId: existingVisit.id,
          });
          console.log(this.history[tabId].serializeJson());
          this.history[tabId].save();
          this.currentTabs[tabId] = tabInfo;
        }
      } else if (tabInfo.status == "complete") {
        let existingVisit = this.history[tabId];
        if (existingVisit === undefined) {
          console.log("onTabUpdated: Ooops this history doesn't exist, tragic");
          alert("onTabUpdated: Ooops this history doesn't exist, tragic");
          return;
        }
        existingVisit.status = tabInfo.status;
        existingVisit.title = tabInfo.title;
        existingVisit.save();
        this.currentTabs[tabId] = tabInfo;
      }
    } catch (e) {
      console.log("Failed to get onTabUpdated", e.toString());
    }
  }
  onTabRemoved(tabId, removeInfo) {
    // console.log(`onTabRemoved: Tab: ${tabId} is closing`);
    // console.log(`onTabRemoved: Window ID: ${removeInfo.windowId}`);
    // console.log(`onTabRemoved: Window is closing: ${removeInfo.isWindowClosing}`);
    delete this.currentTabs[tabId];
    delete this.history[tabId];
  }
  onTabMoved(tabId, moveInfo) {
    // console.log(`onTabMoved: Tab ${tabId} moved from ${moveInfo.fromIndex} to ${moveInfo.toIndex}`);
  }
  onTabCreated(tab) {
    // console.log(`onTabCreated: Tab ${tab.id}, ${tab.url}`);
    this.currentTabs[tab.id] = tab;
    this.history[tab.id] = new visit.Visit({
      title: tab.title,
      url: tab.url,
      status: tab.status
    });
    // console.log(this.history[tab.id].serializeJson());
    if (tab.url != "about:blank" && tab.url != "about:newtab") {
      this.history[tab.id].save();
    }
  }
  // onBeforeNavigate(details) {
  //     console.log(`onBeforeNavigate to: ${details.url}`);
  // }
}