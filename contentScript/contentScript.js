// localStorage.setItem("gw-log-level", 5)
// By the time content script is loaded this event has already fired.
// But setup is waiting for this event so fire again.
setTimeout(function(){
window.document.dispatchEvent(new Event("DOMContentLoaded", {
    bubbles: true,
    cancelable: true
  }));
}, 2000);

