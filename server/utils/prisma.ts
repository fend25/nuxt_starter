import {Permission, PrismaClient} from '@prisma/client'
import {SESSION_TOKEN_COOKIE_NAME} from '~/shared/constants'

export type {PrismaClient} from '@prisma/client'

export const prisma = new PrismaClient({log: ['warn', 'error']})
// export const prisma = new PrismaClient({ log: ['query', 'info', 'warn', 'error'] })

export type IGetSafeUserBy = {
  userId?: string
  email?: string
  sessionToken?: string
}

type PartialPermissionsObject = Partial<{ [K in Permission]: true }>
export type SafeUser = {
  userId: string
  email: string
  firstName: string
  lastName: string
  fullName: string
  avatarUrl: string | null
  language: string | null
  permissions: PartialPermissionsObject
}

export const getSafeUser = async (params: IGetSafeUserBy): Promise<SafeUser | null> => {
  const whereClause = params.userId
    ? {userId: params.userId}
    : params.email
      ? {email: params.email}
      : params.sessionToken
        ? {sessions: {some: {name: {equals: SESSION_TOKEN_COOKIE_NAME}, value: {equals: params.sessionToken}}}}
        : undefined

  if (!whereClause) {
    throw new Error(`IGetSafeUserBy must have one of userId, email, or sessionToken`)
  }

  const user = await prisma.user.findFirst({
    where: whereClause,
    include: {
      userRoles: {
        select: {
          role: {
            select: {
              roleName: true,
              permissions: true
            }
          }
        },
      }
    },
  })
  if (!user) {
    return null
  }

  const userPermissions = [...new Set(user.userRoles.map((ur) => ur.role.permissions).flat())]
  const permissions = userPermissions.reduce((acc, permission) => {
    acc[permission] = true
    return acc
  }, {} as PartialPermissionsObject)


  const safeUser = {
    userId: user.userId,
    email: user.email || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim() || '',
    avatarUrl: user.avatarUrl || null,
    language: user.language || null,
    permissions,
  }

  return safeUser
}
