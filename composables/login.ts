import {useStorageAsync} from '@vueuse/core'

const PROVIDERS = <const>['google']
type IProvider = typeof PROVIDERS[number]

type ILoginAction = {
  path: string,
  action: string,
}

export const useLogin = () => {
  const storage = useStorageAsync<ILoginAction | null>('afterLogin', null)
  const router = useRouter()

  const saveActionAndLoginVia = async (provider: IProvider, action?: ILoginAction) => {
    if (!PROVIDERS.includes(provider)) {
      throw new Error(`Invalid provider: ${provider}`)
    }
    console.log('action', action)
    if (action) {
      console.log('action 2', action)
      storage.value = action
      console.log('storage.value', storage.value)
    }
    if (provider === 'google') {
      location.replace('/api/auth/login/google')
    }
  }

  const restoreStateAfterLogin = async () => {
    let urlToRedirect = '/'

    console.log('storage.value', storage.value)

    const action = storage.value
    if (action) {
      console.log('in action', action)
      storage.value = null
      urlToRedirect = action.path
      if (action.action) {
        const separator = urlToRedirect.includes('?') ? '&' : '?'
        urlToRedirect += `${separator}actionAfterLogin=` + action.action
      }
    }

    console.log('urlToRedirect', urlToRedirect)
    await router.replace(urlToRedirect)
  }

  return {
    loginVia: (provider: IProvider) => saveActionAndLoginVia(provider),
    saveActionAndLoginVia,
    restoreStateAfterLogin,
  }
}
