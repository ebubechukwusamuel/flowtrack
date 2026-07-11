import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { ChatClient } from "@/components/chat-client"

export default async function ChatPage() {
  const session = await getSession()
  if (!session?.user?.id) redirect("/login")
  return <ChatClient userId={session.user.id} />
}
