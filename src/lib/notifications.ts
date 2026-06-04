import { prisma } from "@/lib/db"

export async function createNotification({
  userId,
  type,
  title,
  message,
  link,
}: {
  userId: string
  type: string
  title: string
  message: string
  link?: string
}) {
  try {
    const notification = await prisma.notification.create({
      data: { userId, type, title, message, link },
    })
    return notification
  } catch (err) {
    console.error("[NOTIFICATION]", err)
    return null
  }
}
