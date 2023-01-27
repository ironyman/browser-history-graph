import { mydump } from './debug.js'

function disableRightClick() {
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
}

function initTheme() {
  let styleNode;

  function applyTheme(theme) {
    if (!theme.hasOwnProperty('colors') || !theme.colors) {
      // return;
      theme = {
        colors: {
          popup: 'black',
          popup_text: 'white',
          popup_highlight: 'grey',
          popup_highlight_text: 'white',
        }
      }
    }

    if (styleNode) {
      styleNode.parentElement.removeChild(styleNode);
    }

    // console.log(mydump(theme))

    // document.body.style.backgroundColor = theme.colors.frame;
    document.body.style.backgroundColor = theme.colors.popup;
    // document.body.style.color = theme.colors.toolbar_text || "black";
    document.body.style.color = theme.colors.popup_text;

    styleNode = document.createElement('style');
    styleNode.type = 'text/css';
    document.getElementsByTagName('head')[0].appendChild(styleNode);
    styleNode.sheet.insertRule(`
    :root {
      --background-color: ${theme.colors.popup};
      --text: ${theme.colors.popup_text};
      --popup_highlight: ${theme.colors.popup_highlight};
      --popup_highlight_text: ${theme.colors.popup_highlight_text};
    }`);

    /*
      'colors' ...
        'accentcolor' ...
        'bookmark_text' => "hsla(261, 53%, 15%, 1)"
        'button_background_active' => "hsla(240, 26%, 11%, .16)"
        'button_background_hover' => "hsla(240, 26%, 11%, .08)"
        'frame' => "hsla(240, 20%, 98%, 1)"
        'frame_inactive' ...
        'icons' => "hsla(258, 66%, 48%, 1)"
        'icons_attention' => "hsla(180, 100%, 32%, 1)"
        'ntp_background' => "#F9F9FB"
        'ntp_card_background' ...
        'ntp_text' => "hsla(261, 53%, 15%, 1)"
        'popup' => "hsla(254, 46%, 21%, 1)"
        'popup_border' => "hsla(255, 100%, 94%, .32)"
        'popup_highlight' => "hsla(255, 100%, 94%, .12)"
        'popup_highlight_text' => "hsla(0, 0%, 100%, 1)"
        'popup_text' => "hsla(255, 100%, 94%, 1)"
        'sidebar' => "hsla(240, 15%, 95%, 1)"
        'sidebar_border' => "hsla(261, 53%, 15%, .24)"
        'sidebar_highlight' => "hsla(265, 100%, 72%, 1)"
        'sidebar_highlight_text' => "hsla(0, 0%, 100%, 1)"
        'sidebar_text' => "hsla(261, 53%, 15%, 1)"
        'tab_background_separator' => "hsla(261, 53%, 15%, 1)"
        'tab_background_text' => "hsla(261, 53%, 15%, 1)"
        'tab_line' => "hsla(265, 100%, 72%, 1)"
        'tab_loading' => "hsla(265, 100%, 72%, 1)"
        'tab_selected' ...
        'tab_text' => "hsla(261, 53%, 15%, 1)"
        'textcolor' ...
        'toolbar' => "hsla(0, 0%, 100%, .76)"
        'toolbar_bottom_separator' => "hsla(261, 53%, 15%, .32)"
        'toolbar_field' => "hsla(0, 0%, 100%, .8)"
        'toolbar_field_border' => "transparent"
        'toolbar_field_border_focus' => "hsla(265, 100%, 72%, 1)"
        'toolbar_field_focus' => "hsla(261, 53%, 15%, .96)"
        'toolbar_field_highlight' => "hsla(265, 100%, 72%, .32)"
        'toolbar_field_highlight_text' ...
        'toolbar_field_separator' ...
        'toolbar_field_text' => "hsla(261, 53%, 15%, 1)"
        'toolbar_field_text_focus' => "hsla(255, 100%, 94%, 1)"
        'toolbar_text' => "hsla(261, 53%, 15%, 1)"
        'toolbar_top_separator' => "transparent"
        'toolbar_vertical_separator' => "hsla(261, 53%, 15%, .2)"
        'focus_outline' => "hsla(258, 65%, 48%, 1)"
    'images' ...
        'additional_backgrounds' ...
            '0' => "moz-extension://9dda04be-af2d-413a-b5a8-b95a58b7192e/background-noodles-right.svg"
            '1' => "moz-extension://9dda04be-af2d-413a-b5a8-b95a58b7192e/background-noodles-left.svg"
            '2' => "moz-extension://9dda04be-af2d-413a-b5a8-b95a58b7192e/background-gradient.svg"
        'headerURL' ...
        'theme_frame' ...
    'properties' ...
        'additional_backgrounds_alignment' ...
            '0' => "right top"
            '1' => "left top"
            '2' => "right top"
        'additional_backgrounds_tiling' ...
            '0' => "no-repeat"
            '1' => "no-repeat"
            '2' => "repeat-x"
        'color_scheme' ...
        'content_color_scheme' ...
        'zap_gradient' => "linear-gradient(90deg, #9059FF 0%, #FF4AA2 52.08%, #FFBD4F 100%)"
        */
  }

  browser.theme.getCurrent().then(applyTheme);
  browser.theme.onUpdated.addListener(applyTheme);
}

export function init() {
  disableRightClick();
  initTheme();
}