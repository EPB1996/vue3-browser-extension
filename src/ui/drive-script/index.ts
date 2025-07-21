import { i18n } from "src/utils/i18n"
import { pinia } from "src/utils/pinia"
import { createApp } from "vue"
import App from "./app.vue"
import ui from "@nuxt/ui/vue-plugin"
import "./index.css"

const createDriveApp = (): ReturnType<typeof createApp> => {
  const app = createApp(App).use(i18n).use(ui).use(pinia)
  return app
}
export { createDriveApp }

self.onerror = function (message, source, lineno, colno, error) {
  console.info("Error: " + message)
  console.info("Source: " + source)
  console.info("Line: " + lineno)
  console.info("Column: " + colno)
  console.info("Error object: " + error)
}

console.info("hello world from drive script injected vue app")
