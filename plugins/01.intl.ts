import {defineNuxtModule} from '@nuxt/kit'
import {App} from 'vue'

export default defineNuxtModule({
  setup(options, nuxt) {
    nuxt.hook('app:created' as any, async (app: App<Element>) => {
      console.log('app:created')
      // app.provide('intl', {})
    })
  }
})
