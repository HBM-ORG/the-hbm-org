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

- [ ] Extract CORS middleware
- [ ] Extract request logging middleware
- [ ] Extract admin auth helper/middleware
- [ ] Extract static asset serving helper
- [ ] Leave only app initialization and route mounting in `admin-server.ts`

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

- [ ] Create `server/routes/crm.routes.ts`
- [ ] Create `server/controllers/crm.controller.ts`
- [ ] Create `server/services/crm.service.ts`
- [ ] Move CSV export logic out of `admin-server.ts`
- [ ] Add focused request/response types for CRM payloads

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

- [ ] Create `server/routes/registration.routes.ts`
- [ ] Create `server/controllers/registration.controller.ts`
- [ ] Create `server/services/registration.service.ts`
- [ ] Separate newsletter/contact registration flows from raw HTTP handlers
- [ ] Centralize registration validation and duplicate-check logic

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

### 7. Content Editing Domain

Current endpoints still in `admin-server.ts`:

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

## Suggested Pass Order

- [ ] Pass 1: bootstrap/middleware extraction
- [ ] Pass 2: CRM + registrations
- [ ] Pass 3: email queue/tracking/SMTP
- [ ] Pass 4: campaigns + suppression
- [ ] Pass 5: content editing endpoints
- [ ] Pass 6: AI endpoints
- [ ] Pass 7: legacy upload/FTP cleanup
- [ ] Pass 8: final shrink of `admin-server.ts` to bootstrap only

## Definition Of Done

- [ ] `admin-server.ts` is primarily bootstrap and static serving
- [ ] every API domain is mounted from dedicated route modules
- [ ] controllers are thin
- [ ] services contain business logic and storage integration
- [ ] shared helpers/types are extracted
- [ ] typecheck/build remain green
