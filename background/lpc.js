import { Visit } from './visit.js';
import Storage from "./storage.js";
export function initLpc() {
    chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
        console.log("background received message", message);
        if (message === 'clickme') {
            Visit.getRecent();
        }
    });
}