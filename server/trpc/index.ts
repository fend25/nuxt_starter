import {settingsTrpcRouter} from '~/server/trpc/settings'
import {createContext, router} from '~/server/trpc/_context'
import {createNuxtApiHandler} from 'trpc-nuxt'

export const appRouter = router({
  ...settingsTrpcRouter,
})

export const nuxtApiHandler = createNuxtApiHandler({
  router: appRouter,
  createContext,
})

export type AppRouter = typeof appRouter

