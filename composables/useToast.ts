import type { ToastPluginApi, ToastProps, ActiveToast } from 'vue-toast-notification'
import * as pkg from 'vue-toast-notification'

const dummyForServerEnvironment = (funcName: string) => (...params: any[]): ActiveToast => {
  const stack = (new Error().stack || '').split('\n').slice(2).join('; ').trim()
  console.warn(
    `useToast().${funcName}() was called on server. ` +
    `It is ok to call useToast() on server, but you should not call useToast().${funcName}() on server. ` +
    `This is no-op function. Stack trace: ${stack}`
  )
  return { dismiss: () => undefined }
}

export const useToast = (props: Partial<ToastProps> = {}): ToastPluginApi => {
  if (process.server) {
    return {
      open: dummyForServerEnvironment('open'),
      success: dummyForServerEnvironment('success'),
      error: dummyForServerEnvironment('error'),
      info: dummyForServerEnvironment('info'),
      warning: dummyForServerEnvironment('warning'),
      default: dummyForServerEnvironment('default'),
      clear: () => undefined,
    }
  } else {
    const { useToast } = pkg

    return useToast({
      position: 'top-right',
      ...props
    })
  }
}
