# 📋 Deployment Status & Handoff (The HBM)

**Executive summary:** Site and admin are structured and working. Go-live is possible after frontend build and env setup. For full **email** setup and ESP options (Mailchimp, Bravo), see **[EMAIL_SYSTEM.md](EMAIL_SYSTEM.md)**.

---

## Status overview

| Area | Status | Notes |
|------|--------|------|
| CRM & registrations | ✅ | Events, video, newsletter → `registrations`; view/filter/export in Admin |
| Cookies & consent | ✅ | Consent logged to DB; GA4 + Clarity load only after consent |
| Live content | ✅ | Knowledge, How It Works, Site Content, Video Event, Events → API, instant on site |
| Magic Fetch (books) | ✅ | Requires `GEMINI_API_KEY`; covers, summaries, quotes |
| Email (automations + campaigns) | ⚠️ | Logic ready; **needs SMTP** (Admin or env). See [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md) |
| Admin chat agent | ✅ Removed | No action needed |

---

## 1. CRM ורישומים

| מקור | Endpoint | קובץ | מצב |
|------|----------|------|-----|
| רישום לאירוע פיזי | `POST /api/register` | NextEventHero, טופס אירוע | ✅ נשמר ל-`src/data/registrations.json` |
| רישום לאירוע וידאו | `POST /api/register` | VideoEventModal | ✅ אותו קובץ |
| הרשמה לניוזלטר | `POST /api/newsletter` | NewsletterSection (פוטר) | ✅ אותו קובץ |

- באדמין: **CRM Database** – צפייה, סינון, מיון, ייצוא CSV.

---

## 2. קוקיז ואנליטיקס

- הסכמה: באנר/דרוור; לוג ל-DB (`CookieConsentLog`).
- GA4 + Clarity (Heatmaps, Recordings) נטענים רק אחרי הסכמה.
- אדמין → Analytics: לינקים ל-GA4 ו-Clarity.

---

## 3. תוכן חי מהאדמין

| אדמין | API | דף ציבורי |
|-------|-----|-----------|
| Site Content → Knowledge | `/api/cms/knowledge-base` | `/knowledge` |
| How It Works | `/api/cms/how-it-works` | How It Works |
| Site Content (Team, Testimonials…) | `/api/site-content` | About, MeeterWho… |
| Video Event | `/api/video-event` | דף אירוע וידאו |
| Events | `/api/events` + JSON | Events, Hero |

---

## 4. Magic Fetch (ספרים)

- אדמין → Site Content → Knowledge → Magic Fetch.
- דורש `GEMINI_API_KEY`; אופציונלי `GOOGLE_BOOKS_API_KEY`.

---

## 5. מיילים

- אוטומציות (flows) ותור (EmailQueue) וקמפיינים מוכנים.
- **להפעלה:** SMTP ב-Admin (Email Architect) או במשתני סביבה. פרטים: [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md).

---

## 6. מה צריך לעלייה

- **Build:** `npm run build`
- **הרצת שרת:** `npm start` (מפעיל `tsx server/admin-server.ts`) או PM2 דרך `config/ecosystem.config.cjs`
- **משתני סביבה:** `PORT`, `DATABASE_URL`, אופציונלי SMTP, Gemini, וכו' (ראה [RENDER_ENV.md](RENDER_ENV.md), [config/.env.example](../config/.env.example))
- **תשתית:** כל התעבורה לאותו שרת (same-origin ל-API ו-dist).

---

**See also:** [EMAIL_SYSTEM.md](EMAIL_SYSTEM.md) · [ARCHITECTURE.md](ARCHITECTURE.md) · [DEPLOY_INSTRUCTIONS.md](DEPLOY_INSTRUCTIONS.md)
