import { createApp } from 'vue'
import App from './App.vue'
import { init } from './init.js'

import './assets/main.css'

init();
createApp(App).mount('#app')
