## 2026-06-04 — Group chats, calls, cookie & org fixes

### Decision
- Added group chat creation, group calls, private 1-on-1 calls with WebRTC
- Fixed REQUEST_HEADER_TOO_LARGE (494) from cookie accumulation
- Fixed no-audio-in-calls bug (missing answer polling)
- Fixed members seeing empty org (getOrCreateOrg returning personal org)

### Reasoning
- Cookie accumulation: JWT callback `delete token.picture` ran on every session access → new cookie every chat poll → 42 cookies × 4KB → 167KB > 16KB Vercel limit. Fixed by only deleting on sign-in/update.
- WebRTC: Caller created offer but never polled for answer → `setRemoteDescription` never called → no media path established. Fixed with answer polling loop.
- Org isolation: `getOrCreateOrg` used `findFirst` on OrganizationMember → returned personal org for members who registered before being invited. Fixed by preferring orgs with >1 member.

### Context
- Non-admin team members were in their personal orgs (created during registration) instead of the shared org. They saw no other members and couldn't chat or call anyone.
