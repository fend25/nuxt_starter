import en from './translations/messages.en'
import ru from './translations/messages.ru'
import es from './translations/messages.es'
import pt from './translations/messages.pt'

export default defineI18nConfig(() => ({
  legacy: false,
  locale: 'en',
  fallbackLocale: 'en',
  globalInjection: true,
  messages: {
    en,
    ru,
    es,
    pt,
  }
}))
