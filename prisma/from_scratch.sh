mkdir -p prisma/migrations/0_init
npx prisma generate
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > prisma/migrations/0_init/migration.sql
npx prisma migrate reset --force