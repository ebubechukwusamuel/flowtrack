# Figma Make preview import

This is a separate Figma Make import/preview branch for FlowTrack. The default production branch is unchanged.

- Existing app UI/routes are preserved; only the public landing-page session redirect is skipped when `FIGMA_PREVIEW=1`, so the actual landing UI can render without production Supabase credentials.
- Placeholder database and Supabase settings are only fallback defaults for this Figma preview workflow. They do not contain production credentials and cannot connect to production services.
- Logged-in screens, database-backed data and server actions still require the app's real environment variables. No secrets were copied into this branch.
- Next.js standalone output is enabled only for a Figma production build (`FIGMA=1` and `NODE_ENV=production`).

Figma Make lifecycle scripts are under `.figma/make/`.
