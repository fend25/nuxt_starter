import {publicProcedure} from '~/server/trpc/_context'
import {z} from 'zod'
import {TRPCError} from '@trpc/server'
import {SUPPORTED_LOCALES} from '~/translations/supportedLocales'
import {getUser} from '~/server/utils/user'

const saveSettings = publicProcedure
  .input(z.object({
    locale: z.string().nullish(),
  }))
  .mutation(async ({input, ctx}) => {
    const user = await getUser(ctx.event)
    if (!user) {
      throw new TRPCError({
        code: 'UNAUTHORIZED',
        message: 'You must be logged in to save settings',
      })
    }
    let message = '';

    if (typeof input.locale === 'string') {
      if (!SUPPORTED_LOCALES.includes(input.locale)) {
        throw new TRPCError({
          code: 'BAD_REQUEST',
          message: `Invalid locale, must be one of ${SUPPORTED_LOCALES.join(', ')}`,
        })
      }
      await ctx.prisma.user.update({
        where: {userId: user.userId},
        data: {language: input.locale},
      })
      message += `Saved locale: "${input.locale}"; `
    }

    return {success: true, message: message.trim()}
  })

export const settingsTrpcRouter = {
  saveSettings,
}
