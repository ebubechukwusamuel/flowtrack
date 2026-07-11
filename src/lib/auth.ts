import { createClient } from "./supabase/server"

export async function getSession() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) return null

  return {
    user: {
      id: session.user.id,
      name: session.user.user_metadata?.name ?? session.user.email?.split("@")[0] ?? null,
      email: session.user.email ?? null,
      image: session.user.user_metadata?.avatar_url ?? session.user.user_metadata?.picture ?? null,
    },
  }
}

export async function getUser() {
  const session = await getSession()
  return session?.user ?? null
}
