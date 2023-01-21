import { NavigationListener } from "./navigationlistener.js";
import { initLpc } from "./lpc.js";
import Storage from "./storage.js";

async function main() {
  console.log("Starting history-graph");
  await Storage.init();
  let nav = new NavigationListener();
  initLpc();
}

main();