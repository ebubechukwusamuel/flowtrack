import { PrismaClient } from "../src/generated/prisma"

async function main() {
  const url = process.env.DATABASE_URL || ""

  const prisma = new PrismaClient()

  await prisma.callICECandidate.deleteMany()
  await prisma.call.deleteMany()
  await prisma.messageAttachment.deleteMany()
  await prisma.message.deleteMany()
  await prisma.chatParticipant.deleteMany()
  await prisma.chat.deleteMany()
  await prisma.notification.deleteMany()
  await prisma.activity.deleteMany()
  await prisma.task.deleteMany()
  await prisma.emailLog.deleteMany()
  await prisma.emailContact.deleteMany()
  await prisma.invite.deleteMany()
  await prisma.project.deleteMany()
  await prisma.organizationMember.deleteMany()
  await prisma.organization.deleteMany()
  await prisma.user.deleteMany()

  console.log("Done! All data cleared.")
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
