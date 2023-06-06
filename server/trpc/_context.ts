import { initTRPC, inferAsyncReturnType } from '@trpc/server'
import superjson from 'superjson'
import type { H3Event } from 'h3'

const trpcInstance = initTRPC.context<Context>().create({
  transformer: superjson
})

export const publicProcedure = trpcInstance.procedure
export const router = trpcInstance.router
export const middleware = trpcInstance.middleware

export function createContext (_event: H3Event) {
  return {
    prisma: _event.context.prisma,
    event: _event,
  }
}

export type Context = inferAsyncReturnType<typeof createContext>
