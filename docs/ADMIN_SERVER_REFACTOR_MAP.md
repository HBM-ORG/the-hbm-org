# Admin Server Refactor Map

Track the migration from `server/admin-server.ts` into a normal REST structure:

- `server/routes/*`
- `server/controllers/*`
- `server/services/*`
- shared helpers/types in focused modules

## Goals

- [ ] Keep route files declarative only
- [ ] Move HTTP logic to controllers
- [ ] Move business logic and persistence to services
- [ ] Shrink `server/admin-server.ts` to app bootstrap, middleware, static serving, and route mounting
- [ ] Preserve current runtime behavior while refactoring
- [ ] Keep `npm run typecheck` and `npm run build` green after each pass

## Already Extracted

- [x] Upload API mounted via `server/routes/upload.routes.ts`
- [x] Core CMS API mounted via `server/routes/cms.routes.ts`
- [x] Storage adapter abstraction for Spaces and GCS
- [x] TypeScript-first server runtime

## Remaining Domains

### 1. App Bootstrap And Middleware

- [x] Extract CORS middleware
- [x] Extract request logging middleware
- [x] Extract admin auth helper/middleware
- [x] Extract static asset serving helper
- [x] Leave only app initialization and route mounting in `admin-server.ts`

### 2. CRM Domain

Current endpoints:

- `/api/crm/contact`
- `/api/crm/contact/`
- `/api/crm/ping`
- `/api/crm/contact/export`
- `/api/crm/leads`
- `/api/crm/leads/:id/status`
- `/api/crm/leads/:id/note`

Tasks:

- [x] Create `server/routes/crm.routes.ts`
- [x] Create `server/controllers/crm.controller.ts`
- [x] Create `server/services/crm.service.ts`
- [x] Move CSV export logic out of `admin-server.ts`
- [x] Add focused request/response types for CRM payloads

### 3. Registration Domain

Current endpoints:

- `/api/register`
- `/api/newsletter`
- `/api/contact`
- `/api/registrations`
- `/api/registrations/:id`
- `/api/registrations/by-contact`
- `/api/registrations/stats`

Tasks:

- [x] Create `server/routes/registration.routes.ts`
- [x] Create `server/controllers/registration.controller.ts`
- [x] Create `server/services/registration.service.ts`
- [x] Separate newsletter/contact registration flows from raw HTTP handlers
- [x] Centralize registration validation and duplicate-check logic

### 4. Email Automation Domain

Current responsibilities:

- queue processing
- SMTP normalization/check
- template rendering
- automation trigger handling
- engagement logging
- tracking pixel and click redirect

Current endpoints:

- `/api/email-queue`
- `/api/smtp-check`
- `/api/automation/trigger`
- `/api/test-flow`
- `/api/track/open/:id`
- `/api/track/click/:id`
- `/api/engagement`

Tasks:

- [ ] Create `server/routes/email.routes.ts`
- [ ] Create `server/controllers/email.controller.ts`
- [ ] Create `server/services/email-queue.service.ts`
- [ ] Create `server/services/email-template.service.ts`
- [ ] Create `server/services/email-tracking.service.ts`
- [ ] Move `processQueue`, `deliverEmail`, and tracking helpers out of `admin-server.ts`
- [ ] Replace file-backed engagement helpers with a dedicated module
Current progress:

- [x] Create `server/routes/email.routes.ts`
- [x] Create `server/controllers/email.controller.ts`
- [x] Create email queue/admin service module (`server/services/email-admin.service.ts`)
- [x] Create `server/services/email-template.service.ts` via `server/services/email-support.service.ts`
- [x] Create `server/services/email-tracking.service.ts`
- [x] Move `processQueue` fully out of `admin-server.ts`
- [x] Move `deliverEmail` and tracking helpers out of `admin-server.ts`
- [x] Replace file-backed engagement helpers with a dedicated module

### 5. Campaigns And Suppression Domain

Current endpoints:

- `/api/campaigns`
- `/api/campaigns/save-all`
- `/api/campaigns/send`
- `/api/unsubscribe`
- `/api/suppression`
- `/api/suppression/toggle`

Tasks:

- [ ] Create `server/routes/campaign.routes.ts`
- [ ] Create `server/controllers/campaign.controller.ts`
- [ ] Create `server/services/campaign.service.ts`
- [ ] Create `server/services/suppression.service.ts`
- [ ] Isolate file-backed campaign and suppression storage behind services
Current progress:

- [x] Create `server/routes/campaign.routes.ts`
- [x] Create `server/controllers/campaign.controller.ts`
- [x] Create `server/services/campaign.service.ts`
- [x] Create `server/services/suppression.service.ts`
- [x] Isolate file-backed campaign and suppression storage behind services

### 6. Legacy Upload / Asset Domain

Current endpoints:

- `/api/upload-email-image`
- `/api/upload-cms-image`
- `/api/images/:folderName`
- `/api/upload-asset`
- `/api/delete-image`

Tasks:

- [ ] Decide which legacy upload endpoints remain needed after object-storage rollout
- [ ] Create `server/routes/legacy-upload.routes.ts` if they must stay
- [ ] Move Multer setup into dedicated upload modules
- [ ] Remove dead FTP/legacy upload code once object storage fully replaces it

Current progress:

- [x] Decide which legacy upload endpoints remain needed after object-storage rollout
- [x] Create `server/routes/legacy-upload.routes.ts` because the admin UI still uses legacy endpoints
- [x] Create `server/controllers/legacy-upload.controller.ts`
- [x] Create `server/services/legacy-upload.service.ts`
- [x] Move Multer setup into `server/middleware/legacy-upload.ts`
- [x] Remove inline legacy upload/FTP handlers from `admin-server.ts`
- [x] Update frontend callers away from `/api/upload-asset`, `/api/upload-cms-image`, `/api/upload-email-image`, and `/api/delete-image`
- [x] Remove dead FTP/legacy upload code after switching all active callers to object storage
- [x] Remove temporary legacy upload route/controller/service/middleware modules

### 7. Content Editing Domain

Current endpoints previously in `admin-server.ts`:

- `/api/video-event`
- `/api/cms/how-it-works`
- `/api/cms/how-it-works/staging`
- `/api/cms/how-it-works/publish`
- `/api/cms/knowledge-base`
- `/api/cms/lock-toggle`

Tasks:

- [ ] Create `server/routes/content.routes.ts`
- [ ] Create `server/controllers/content.controller.ts`
- [ ] Create `server/services/content.service.ts`
- [ ] Extract staging/publish workflow logic for CMS sections
- [ ] Add typed models for how-it-works and knowledge-base payloads

Current progress:

- [x] Create `server/routes/content.routes.ts`
- [x] Create `server/controllers/content.controller.ts`
- [x] Create `server/services/content.service.ts`
- [x] Extract staging/publish workflow logic for CMS sections
- [x] Add typed models for how-it-works and knowledge-base payloads
- [x] Remove duplicate inline `site-content` and `automation-settings` handlers from `admin-server.ts`

### 8. AI / Enrichment Domain

Current endpoints:

- `/api/ai/ping`
- `/api/ai/improve-copy`
- `/api/ai/fetch-book`
- `/api/ai/fetch-video`

Tasks:

- [ ] Create `server/routes/ai.routes.ts`
- [ ] Create `server/controllers/ai.controller.ts`
- [ ] Create `server/services/ai.service.ts`
- [ ] Create `server/services/book-enrichment.service.ts`
- [ ] Create `server/services/video-enrichment.service.ts`
- [ ] Isolate provider fallback logic and response parsing

Current progress:

- [x] Create `server/routes/ai.routes.ts`
- [x] Create `server/controllers/ai.controller.ts`
- [x] Create `server/services/ai.service.ts`
- [x] Create `server/services/book-enrichment.service.ts`
- [x] Create `server/services/video-enrichment.service.ts`
- [x] Isolate provider fallback logic and response parsing

## Suggested Pass Order

- [x] Pass 1: bootstrap/middleware extraction
Current progress: shared admin auth, CORS, request logging, subdomain routing, static serving, queue bootstrap wiring, and the final cookie-consent extraction have left `admin-server.ts` focused on initialization, route mounting, runtime startup, and shutdown only.
- [x] Pass 2: CRM + registrations
- [x] Pass 3: email queue/tracking/SMTP
- [x] Pass 4: campaigns + suppression
- [x] Pass 5: content editing endpoints
Current progress: video-event, how-it-works, knowledge-base, and lock-toggle routes are extracted into `content.routes.ts` / `content.controller.ts` / `content.service.ts`, typed CMS payload models are in place, and duplicate inline content handlers have been removed from `admin-server.ts`.
- [x] Pass 6: AI endpoints
- Current progress: `ai/ping`, `ai/improve-copy`, `ai/fetch-book`, and `ai/fetch-video` are extracted into dedicated route/controller/service modules, with shared AI provider logic in `ai.service.ts` and enrichment-specific logic split into book/video services.
- [x] Pass 7: legacy upload/FTP cleanup
- Current progress: frontend upload/delete callers now use the object-storage flow, legacy FTP/local upload handlers have been removed from the runtime, and the temporary legacy upload modules have been deleted from the repo.
- [x] Pass 8: final shrink of `admin-server.ts` to bootstrap only
- Current progress: duplicate inline endpoints have been removed, cookie consent is mounted from dedicated modules, and `admin-server.ts` now contains bootstrap wiring rather than domain handlers.

## Definition Of Done

- [x] `admin-server.ts` is primarily bootstrap and static serving
- [x] every API domain is mounted from dedicated route modules
- [x] controllers are thin
- [x] services contain business logic and storage integration
- [x] shared helpers/types are extracted
- [x] typecheck/build remain green
