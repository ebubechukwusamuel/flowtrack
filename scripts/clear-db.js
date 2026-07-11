require("dotenv").config({ path: ".env" })

const { PrismaClient } = require("../src/generated/prisma")

async function safeDelete(prisma, name, fn) {
  try {
    const count = await fn()
    console.log(`  ${name}: ${count} deleted`)
    return true
  } catch (e) {
    if (e.message?.includes("does not exist")) {
      console.log(`  ${name}: table does not exist, skipping`)
      return false
    }
    console.log(`  ${name}: error:`, e.message?.substring(0, 100))
    return false
  }
}

async function main() {
  const url = process.env.DATABASE_URL || ""
  console.log(`Database: ${url.includes("supabase") ? "SUPABASE" : "OTHER"}`)

  const prisma = new PrismaClient()

  console.log("Clearing all tables...\n")
  await safeDelete(prisma, "CallICECandidate", () => prisma.callICECandidate.deleteMany())
  await safeDelete(prisma, "Call", () => prisma.call.deleteMany())
  await safeDelete(prisma, "MessageAttachment", () => prisma.messageAttachment.deleteMany())
  await safeDelete(prisma, "Message", () => prisma.message.deleteMany())
  await safeDelete(prisma, "ChatParticipant", () => prisma.chatParticipant.deleteMany())
  await safeDelete(prisma, "Chat", () => prisma.chat.deleteMany())
  await safeDelete(prisma, "Notification", () => prisma.notification.deleteMany())
  await safeDelete(prisma, "Activity", () => prisma.activity.deleteMany())
  await safeDelete(prisma, "Task", () => prisma.task.deleteMany())
  await safeDelete(prisma, "EmailLog", () => prisma.emailLog.deleteMany())
  await safeDelete(prisma, "EmailContact", () => prisma.emailContact.deleteMany())
  await safeDelete(prisma, "Invite", () => prisma.invite.deleteMany())
  await safeDelete(prisma, "Project", () => prisma.project.deleteMany())
  await safeDelete(prisma, "OrganizationMember", () => prisma.organizationMember.deleteMany())
  await safeDelete(prisma, "Organization", () => prisma.organization.deleteMany())
  await safeDelete(prisma, "User", () => prisma.user.deleteMany())

  console.log("\nDone!")
  await prisma.$disconnect()
}

main().catch((e) => console.error("Fatal:", e))
