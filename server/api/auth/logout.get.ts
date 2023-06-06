import {redirectToUserSpace} from '~/server/utils/redirects'
import {SESSION_TOKEN_COOKIE_NAME} from '~/shared/constants'

export default defineEventHandler(async event => {
  const sessionToken = getCookie(event, SESSION_TOKEN_COOKIE_NAME)
  if (sessionToken) {
    await prisma.session.deleteMany({
      where: {
        name: {equals: SESSION_TOKEN_COOKIE_NAME},
        value: {equals: sessionToken},
      }
    })
    deleteCookie(event, SESSION_TOKEN_COOKIE_NAME)
  }

  return await redirectToUserSpace(event)
})
