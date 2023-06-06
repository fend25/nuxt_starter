import { H3Event } from 'h3'
import { SafeUser, getSafeUser } from '~/server/utils/prisma'
import { Permission } from '@prisma/client'
import {SESSION_TOKEN_COOKIE_NAME} from '~/shared/constants'

declare module 'h3' {
  interface H3EventContext {
    user?: SafeUser | null
  }
}

export const getUser = async (event: H3Event): Promise<SafeUser | null> => {
  if (event.context.user) {
    return event.context.user
  }

  const sessionToken = getCookie(event, SESSION_TOKEN_COOKIE_NAME)
  const user = sessionToken ? await getSafeUser({ sessionToken }) : null

  if (sessionToken && !user) {
    deleteCookie(event, SESSION_TOKEN_COOKIE_NAME)
  }

  event.context.user = user || null
  return user
}

export const checkIsLoggedIn = async (event: H3Event): Promise<SafeUser> => {
  const user = event.context.user || await getUser(event)
  if (!user) {
    const error = new Error('Not logged in')
    // @ts-ignore
    error.status = 403
    throw error;
  }
  return user
}

export const checkHasPermission = async (event: H3Event, permission: Permission): Promise<true> => {
  const user = event.context.user || await getUser(event)
  if (!user) {
    throw new Error('Not logged in')
  }
  if (user.permissions[permission]) {
    return true
  } else {
    throw new Error(`Not authorized to perform this action: ${permission}`)
  }
}

export const checkHasPermissionSafe = async (event: H3Event, permission: Permission): Promise<boolean> => {
  try {
    await checkHasPermission(event, permission)
    return true
  } catch (e) {
    return false
  }
}
