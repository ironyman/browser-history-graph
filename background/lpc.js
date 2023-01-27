import { Visit } from './visit.js';
import Storage from "./storage.js";
import { mydump } from "../lib/debug.js";

export function initLpc(navigationListener) {
  browser.runtime.onMessage.addListener(async function (message, sender, sendResponse) {
    // console.log("background received message", message);
    if (message === 'clickme') {
      Visit.getRecent();
    } else if (message === 'get-current-theme') {
      // https://developer.chrome.com/docs/extensions/mv3/messaging/
      // https://developer.chrome.com/docs/extensions/reference/runtime/
      // For firefox background.js has access to theme information. Popup does not.
      // Chrome doesn't have this.
      // Only firefox supports this.
      if (browser) {
        browser.theme.getCurrent().then(function (theme) {
          // console.log("got theme");
          // let keys = Object.keys(theme);
          // for (let k of keys) {
          //     console.log(k);
          // }
          // console.log(theme['colors'])
          // console.log(theme['properties'])
          // doesn't work.
          sendResponse(theme);
        });
      } else {
        sendResponse(null);
      }
      return true;
    } else if (message === 'get-recent-history') {
      let result = await Visit.getRecent();
      // console.log("get-recent-history got length of ", result.length);
      // sendResponse({ result: result, test: "hi" });
      // Need to return true for sendResponse to work.
      return result;
    } else if (message === 'get-current-tabs') {
      // console.log(Object.keys(navigationListener.history).length)
      return {
        currentTabs: navigationListener.currentTabs,
        history: navigationListener.history,
      };
    } else if (message.command === 'show-tab') {
      // console.log(message.tabId);
      try {
        browser.tabs.update(message.tabId, {
          active: true
        });
      } catch (e) {
        console.log(e.toString())
      }
    } else if (message.command === 'get-history-ancestors') {
      let currentId = message.visitId;
      let ancestors = [];
      let depth = 0;
      while (currentId && depth < message.maxDepth) {
        // console.log('querying', currentId);
        let node = await Visit.getById(currentId);
        console.log(mydump(node));
        ancestors.push(node);
        currentId = node.fromId;
        ++depth;
      }

      return ancestors;
    } else if (message.command === 'get-history-children') {
      let currentId = message.visitId;
      let children = await Visit.getByFromId(currentId);
      return chlidren;
    }
  });
}