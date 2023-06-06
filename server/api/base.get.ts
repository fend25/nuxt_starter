import { oAuth } from '~/server/utils/oauth'
import { getUser } from '~/server/utils/user'

export default defineEventHandler(async event => {
  const user = await getUser(event)

  return {
    user,
  }
})
