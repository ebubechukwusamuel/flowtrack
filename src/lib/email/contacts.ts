import { prisma } from "@/lib/db"

export async function addContact(email: string, name?: string | null, organizationId?: string) {
  if (!organizationId || !email) return
  try {
    await prisma.emailContact.upsert({
      where: { organizationId_email: { organizationId, email } },
      update: { name: name || undefined },
      create: { email, name, organizationId },
    })
  } catch {
    // fail silently
  }
}

export async function getContacts(organizationId: string) {
  return prisma.emailContact.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
  })
}

export async function deleteContact(id: string) {
  await prisma.emailContact.delete({ where: { id } })
}
