import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const body = await request.json()
  const user = body.user as {
    id: string
    email?: string
    user_metadata?: Record<string, unknown>
    app_metadata?: Record<string, unknown>
  } | undefined

  if (!user?.id) {
    return NextResponse.json({ claims: {} })
  }

  const { user_metadata, ...rest } = user
  const claims: Record<string, unknown> = {
    ...rest,
    user_metadata: {},
  }

  return NextResponse.json({ claims })
}
