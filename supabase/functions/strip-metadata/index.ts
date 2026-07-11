// Custom Access Token hook — strips user_metadata from JWT to keep cookies small
Deno.serve(async (req: Request) => {
  const { user } = await req.json()

  return new Response(
    JSON.stringify({
      claims: {
        user_metadata: {},
      },
    }),
    { headers: { "Content-Type": "application/json" } }
  )
})
