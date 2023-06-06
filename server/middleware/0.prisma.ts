import { prisma, PrismaClient } from "~/server/utils/prisma";

declare module 'h3' {
  interface H3EventContext {
    prisma: PrismaClient
  }
}

export default eventHandler((event) => {
  event.context.prisma = prisma
})
