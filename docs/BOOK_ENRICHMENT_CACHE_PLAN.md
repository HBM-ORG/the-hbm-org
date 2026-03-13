# Book Enrichment Cache Plan

## Goal

Reduce repeated AI token usage on the public library pages while preserving rich book metadata and a good editorial workflow in admin.

## Current Problems

- [x] Public `Knowledge` page requests enrichment for many books during initial render.
- [x] A single AI failure can cascade across multiple Gemini model retries.
- [ ] Enrichment results are not persisted server-side, so cache is limited to a single browser.
- [ ] Metadata lookup and AI-generated copy are coupled in one runtime path.
- [ ] There is no queue/prewarm flow for preparing book data ahead of traffic spikes.

## Target Strategy

- [x] Keep public page requests metadata-first and AI-optional.
- [x] Fail fast on quota/rate-limit responses instead of trying every model.
- [ ] Add persistent server-side cache keyed by normalized `title + author`.
- [ ] Use Google Books and OpenLibrary as metadata providers, not as AI replacements.
- [ ] Reserve AI enrichment for admin actions, explicit refreshes, or background jobs.
- [ ] Return stale cached data when providers are degraded instead of re-querying aggressively.

## Recommended Fallback Order

1. Manual/admin-authored content already stored in knowledge data.
2. Persistent server cache for the normalized book key.
3. Google Books for title, description, page count, info link, and cover.
4. OpenLibrary cover fallback when Google Books has no usable cover.
5. Existing stale cache entry if remote providers fail.
6. Minimal placeholder response without AI fields.

## Implementation Plan

### Phase 1: Immediate Runtime Protection

- [x] Stop public card rendering from triggering AI enrichment by default.
- [x] Add `includeAi` control to `/api/ai/fetch-book`.
- [x] Short-circuit AI model fallback on quota/auth/rate-limit errors.
- [x] Fix visual sitemap preview mode so it does not create third-party request storms.

### Phase 2: Persistent Cache

- [ ] Add a Prisma model for cached book enrichment, keyed by normalized title/author.
- [ ] Store provider metadata separately from AI-generated fields for partial refreshes.
- [ ] Save `source`, `fetchedAt`, and `lastAiEnrichedAt` timestamps.
- [ ] Add TTL rules:
- [ ] Metadata TTL: 30 days.
- [ ] AI TTL: no automatic refresh unless forced by admin.

### Phase 3: API Shape

- [ ] Split the current endpoint behavior into two clear modes:
- [ ] `includeAi: false` for public/runtime metadata.
- [ ] `includeAi: true` for admin/manual enrichment.
- [ ] Add `forceRefresh` for admin-only refresh actions.
- [ ] Return cache hit/miss metadata for diagnostics.

### Phase 4: Admin Workflow

- [ ] Add "Fetch metadata" and "Generate AI copy" as separate actions in admin.
- [ ] Show cache/provider status in the admin UI.
- [ ] Allow editors to keep manual text even when refreshed metadata changes.

### Phase 5: Background Processing

- [ ] Add a one-off prewarm script for the current knowledge base.
- [ ] Optionally add a queue/worker task for batch enrichment outside web requests.
- [ ] Rate-limit provider calls and process books in small batches.

## Success Criteria

- [ ] Loading `/knowledge` does not spend AI tokens for every visible card.
- [ ] Provider/API failures do not cause prompt storms.
- [ ] Repeated traffic reuses cached book data across browsers and deployments.
- [ ] Admin can refresh a single book intentionally without affecting public traffic.
