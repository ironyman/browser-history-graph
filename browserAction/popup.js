chrome.runtime.sendMessage('get-current-theme', function (theme) {
  // console.log("response", theme);
  if (theme && theme.colors) {
    const colors = [
      `background: ${theme.colors.popup}`,
      `color: ${theme.colors.popup_text}`,
      // `border: 3px solid ${theme.colors.popup_border}`,
    ];
    document.body.setAttribute('style', colors.join(';'));

  }
});

document.querySelector('#clickme').addEventListener('click', (ev) => {
  console.log("clicked");
  chrome.runtime.sendMessage('clickme');
})