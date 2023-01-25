import { createApp } from 'vue'
import App from './App.vue'

import './assets/main.css'

createApp(App).mount('#app')

// Disable right click menu.
document.oncontextmenu = function (e) {
  var evt = new Object({ keyCode: 93 });
  stopEvent(e);
  keyboardUp(evt);
}
function stopEvent(event) {
  if (event.preventDefault != undefined)
    event.preventDefault();
  if (event.stopPropagation != undefined)
    event.stopPropagation();
}
