import { PrismaClient } from "../src/generated/prisma"
import { PrismaNeon } from "@prisma/adapter-neon"

async function main() {
  const url = process.env.DATABASE_URL || ""
  console.log(`Clearing all data from: ${url.includes("neon") ? "NEON (PRODUCTION)" : "LOCAL"}`)

  const prisma = new PrismaClient({ adapter: new PrismaNeon({ connectionString: url }) })

  await prisma.activity.deleteMany()
  await prisma.task.deleteMany()
  await prisma.emailLog.deleteMany()
  await prisma.emailContact.deleteMany()
  await prisma.invite.deleteMany()
  await prisma.project.deleteMany()
  await prisma.organizationMember.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.verificationToken.deleteMany()
  await prisma.user.deleteMany()

  console.log("Done! All data cleared.")
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
