import { PrismaClient, Permission, Prisma } from '@prisma/client'

const prisma = new PrismaClient()

const roleNames = <const>{
  admin: 'admin',
  user: 'user',
}

async function createRoles () {
  const admin = await prisma.role.upsert({
    where: { roleName: roleNames.admin },
    update: {},
    create: {
      roleName: roleNames.admin,
      description: 'Admin role',
      permissions: [Permission.administrate],
    },
  })
  const user = await prisma.role.upsert({
    where: { roleName: roleNames.user, },
    update: {},
    create: {
      roleName: roleNames.user,
      description: 'User role',
      permissions: [],
    }
  })
}

const main = async () => {
  await createRoles()
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
