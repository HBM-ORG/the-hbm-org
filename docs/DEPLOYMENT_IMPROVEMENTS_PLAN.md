Three-App Deployment Compromise Plan

Final Recommended Model

Yes, this is the best short-term deployment shape for your current codebase and near-term goals.

Use 3 DigitalOcean app IDs per environment:





Site app





apps/site



static site



domain: testwww.thehbm.org





Admin app





apps/admin



static site



domain: testadmin.thehbm.org





Backend app





apps/server



contains:





web component



worker component



shared resources:





managed MySQL cluster



Spaces bucket



public API domain: testapi.thehbm.org

This gives you:





independent site deployment



independent admin deployment



a single backend app boundary for API + worker + DB concerns



simpler CI/CD than splitting server and worker into separate app IDs



cleaner future backend-first migration path

Why This Is Better Than 4 App IDs

Compared with splitting server and worker into separate app IDs, this model is better for now because:





server and worker share the same codebase in [apps/server](/Users/alex/Documents/gitRepos1/nodejs-projects/HBM-git/org-site/the-hbm-org/apps/server)



they use the same DATABASE_URL



they use the same storage credentials



they use the same SMTP/AI/backend secret surface



Prisma generation belongs to the backend codebase as a whole, not to one of those runtimes specifically



you avoid duplicating backend CI and deploy logic unnecessarily

So your proposed boundary is sound:





split site and admin as independent deployables



keep backend grouped as one app ID with two runtime components

Backend App Shape

The backend app should contain:

Component 1: web service





Build command:





npm ci && npm run prisma:generate -w apps/server && npm run build -w apps/server



Run command:





npm run web -w apps/server



Public port:





3001



Public domain:





testapi.thehbm.org



Scaling:





can later scale above 1 if the web role remains stateless and queue work stays isolated from web

Component 2: worker





Build command:





npm ci && npm run prisma:generate -w apps/server && npm run build -w apps/server



Run command:





npm run worker -w apps/server



Scaling:





keep at 1 instance for now

Shared infra for backend app





Managed MySQL cluster



DO Spaces bucket



shared backend env values

Why Keeping Backend As One App ID Helps

Shared environment management

Because web and worker use the same backend env surface, one backend app ID is operationally simpler:





DATABASE_URL



storage vars



SMTP vars



AI vars



admin/security vars



domain/cors vars

You can still override per-component values if needed, but the default posture is shared backend config.

Shared Prisma lifecycle

Your Prisma concerns are backend-wide:





one schema



one generated client



one database



one migration history

That means Prisma should be handled once in the backend pipeline, not treated as two separate deployment concerns.

Shared CI surface

There is no strong value in splitting CI into separate server and worker pipelines when both are built from the same backend package root.

So backend CI should stay one pipeline, while site and admin can each get their own.

Recommended CI/CD Split

Keep separate pipelines for





site



admin



backend

Do not split further yet into





server CI



worker CI

because that would mostly duplicate backend build logic.

Workflow Shape

1. site-ci.yml





path filter for apps/site/**



also include shared files that site depends on, such as build scripts and root package metadata if needed



build only apps/site

2. admin-ci.yml





path filter for apps/admin/**



build only apps/admin

3. backend-ci.yml





path filter for apps/server/**



plus shared scripts/schema/root files it depends on



run:





install



Prisma generate



typecheck/build



backend tests if present

4. DO deploy workflows

You can either:





create three separate deploy workflows



or one generalized DO deploy workflow that maps branch -> app IDs for site, admin, and backend

The second option is often cleaner.

Prisma Recommendation

Your reasoning is correct: Prisma should be treated as a backend app concern, not something manually handled outside the backend deploy lifecycle.

What should happen automatically

In backend CI/build

Run explicitly:

npm ci
npm run prisma:generate -w apps/server
npm run build -w apps/server

Even though root postinstall may already trigger generation, keeping prisma:generate explicit in backend CI makes the process visible and reliable.

In backend deploy flow

Run schema deployment automatically:

npm run prisma:migrate:deploy -w apps/server

Recommended order:





backend CI validates



backend migration job runs against target DB



backend app deployment is triggered

The worker should deploy only after the schema is already compatible.

App IDs / GitHub Variables

For dev, the target shape becomes:





DO_APP_ID_DEV_SITE



DO_APP_ID_DEV_ADMIN



DO_APP_ID_DEV_BACKEND

For staging:





DO_APP_ID_STAGING_SITE



DO_APP_ID_STAGING_ADMIN



DO_APP_ID_STAGING_BACKEND

And keep:





DO_API_TOKEN

Environment Ownership

Site app env





VITE_SITE_URL=https://testwww.thehbm.org



VITE_ADMIN_URL=https://testadmin.thehbm.org



VITE_API_BASE=https://testapi.thehbm.org



VITE_ASSET_BASE=https://testapi.thehbm.org



optional site-only head/analytics/media vars

Admin app env





VITE_SITE_URL=https://testwww.thehbm.org



VITE_ADMIN_URL=https://testadmin.thehbm.org



VITE_API_BASE=https://testapi.thehbm.org



VITE_ASSET_BASE=https://testapi.thehbm.org



optional admin-only vars

Backend app env

Shared across web and worker:





NODE_ENV=production



BASE_URL=https://testapi.thehbm.org



SITE_PUBLIC_URL=https://testwww.thehbm.org



SITE_APP_URL=https://testwww.thehbm.org



ADMIN_APP_URL=https://testadmin.thehbm.org



DATABASE_URL=...



ADMIN_PASSWORD=...



storage vars



SMTP vars



AI vars

Web component specific:





PORT=3001



RUN_EMAIL_WORKER=false

Worker component:





same backend env surface



keep instance count at 1

Source Directory Guidance

Even with this split, keep App Platform source as repo root / and use component-specific build/run commands.

Reason:





current repo is still a workspace monorepo



site/admin/server depend on shared root install/build context



source-dir splitting would add fragility without much gain yet

Final Recommendation

So the answer is:





Yes, keep backend as a single app ID.



Yes, backend should contain both web and worker components.



Yes, Prisma generation and migrations should be automated as part of backend CI/deploy flow.



Yes, split CI/CD and app IDs at the level of:





site



admin



backend



No, do not split server and worker into separate app IDs yet.

