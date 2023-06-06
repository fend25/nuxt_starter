import {oAuth} from '~/server/utils/oauth'
import {redirectToUserSpace} from '~/server/utils/redirects'

export default defineEventHandler(async event => {
  const loginVia = event.context.params?.loginVia

  if (loginVia === 'google') {
    const {auth} = useRuntimeConfig()
    const authenticateUrl = oAuth.google.getAuthenticateUrl(auth.google.callbackUrl, auth.google.clientId)

    return await sendRedirect(event, authenticateUrl, 302)
  }
  
  return await redirectToUserSpace(event)
})
