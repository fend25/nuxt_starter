import {useMainStore} from '~/stores/main.store'
import {SUPPORTED_LOCALES} from '~/translations/supportedLocales'

const getDefaultLocale = (languageFromSettings?: string | null): string => {
  if (!process.server) {
    throw new Error('getDefaultLocale should only be called on the server')
  }
  if (languageFromSettings && SUPPORTED_LOCALES.includes(languageFromSettings)) {
    return languageFromSettings
  } else {
    const allLocalesRaw = useRequestHeaders()['accept-language']?.split(',')
    const allLocales = [...new Set(allLocalesRaw?.map((locale) => {
      return locale.split(';')[0].split('-')[0]
    }))]

    return allLocales.find((locale) => {
      return SUPPORTED_LOCALES.includes(locale)
    }) || SUPPORTED_LOCALES[0]
  }
}

export const getSharedData = () => {
  return {
    defaultLocale: useState('defaultLocale', () => SUPPORTED_LOCALES[0]),
  }
}

const dealWithCookies = () => {
  const {
    cookiesEnabled,
    cookiesEnabledIds,
    isConsentGiven,
    isModalActive,
    moduleOptions
  } = useCookieControl()
// example: react to a cookie being accepted
  watch(
    () => cookiesEnabledIds.value,
    (current, previous) => {
      if (
        (!previous?.includes('google-analytics') &&
          current?.includes('google-analytics'))
      ) {
        // cookie with id `google-analytics` got added
        window.location.reload() // placeholder for your custom change handler
      }
    },
    { deep: true }
  )
}


export const useInit = async () => {
  const store = useMainStore()

  const {defaultLocale} = getSharedData()

  if (process.server) {
    const data = await useFetch('/api/base')
    if (data.data.value) {
      store.user = data.data.value.user
      defaultLocale.value = getDefaultLocale(store.user?.language)
    }
  }

  if (process.client) {
    dealWithCookies()
  }

  return {
    defaultLocale: defaultLocale.value,
  }
}
