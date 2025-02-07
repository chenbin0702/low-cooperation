import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

// Suppress ResizeObserver loop error
const debounce = (fn, delay) => {
  let timeoutId
  return (...args) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn.apply(this, args), delay)
  }
}

const resizeHandler = debounce(() => {
  const event = new Event('resize')
  window.dispatchEvent(event)
}, 100)

window.addEventListener('resize', resizeHandler)

const app = createApp(App)
app.use(ElementPlus)
app.use(router)
app.mount('#app')