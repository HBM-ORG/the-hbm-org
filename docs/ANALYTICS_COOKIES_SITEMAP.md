# איפה רואים: קוקיז, אנליטיקס (GA4 / Clarity), Sitemap

## 1. נתוני קוקיז (Cookie consent logs)

- **איפה:** אדמין → **Cookie Logs** (טאב ליד Analytics).
- **מה רואים:** רק רשומות **הסכמה** — תאריך, בחירה (Accept All / Decline / Custom), הגדרות (analytics, marketing), IP ממוזער. **לא** מוצג כאן מי נרשם או כמה רישומים.
- **לנתונים על נרשמים:** השתמש ב־**CRM DATABASE** (טאב למעלה) — שם רואים אנשי קשר, מספר רישומים, אירועים, ו־View profile לכל אדם.

מהדשבורד **Analytics** יש גם לינק: "→ מעבר לטאב COOKIE LOGS באדמין".

---

## 2. Google Analytics (GA4) ו-Microsoft Clarity

### חיבור לחשבון GA4

- **חשבון/נכס:** האתר מחובר ל־Google Analytics 4 עם **Measurement ID: `G-BR4CGS5B7X`** (נכס "the-hbm" / hbmFrontEnd).
- **איפה מוגדר:** התג טעון ב־`apps/site/index.html`, וה־config (שליחת נתונים) רץ מ־`apps/site/src/utils/analytics.js` **אחרי** שהמשתמש מאשר cookies (Analytics).
- **אימות:** ב־GA4 → דף הבית אמור להופיע "איסוף הנתונים פעיל"; ב־Realtime תראה משתמשים פעילים (למשל "משתמשים פעילים ב־30 הדקות האחרונות"). נתונים מלאים בדוחות יכולים להופיע עד כ־24 שעות אחרי האיסוף.

### מה מקבלים מזה שזה מחובר

| מה מקבלים | איפה ב־GA4 |
|-----------|-------------|
| **כמה אנשים נכנסו לאתר** | דוחות → Acquisition / Traffic; דף הבית (משתמשים) |
| **אילו דפים הכי נצפו** | דוחות → Engagement → Pages and screens |
| **מאיפה הגיעו (חיפוש, רשתות, קישור)** | דוחות → Acquisition → Traffic acquisition |
| **משתמשים בזמן אמת** | Realtime (משתמשים פעילים עכשיו, ארץ) |
| **אירועים (לחיצות, רישום לאירוע)** | דוחות → Engagement → Events (למשל `registration_complete`, `page_view`) |
| **משך שהייה ומעבר בין דפים** | Engagement → Engagement overview |
| **מדינות ומכשירים** | דוחות → User attributes / Tech |

האתר שולח ל־GA4 גם אירועים מותאמים (למשל `registration_start`, `registration_complete`) כשמשתמשים נרשמים לאירוע או לניוזלטר — כך אפשר לראות המרות ויעילות קמפיינים.

- **איפה לפתוח:** אדמין → **Analytics** → כפתור "Google Analytics 4" (נפתח analytics.google.com).
- **Clarity:** Heatmaps והקלטות סשן — דרך הכפתורים "Heatmaps" ו־"Session Recordings" באותו דשבורד (נפתח clarity.microsoft.com). נתונים מופיעים אחרי גלישות עם Accept cookies (עד כשעתיים).

---

## 3. Sitemap (היטמאפ של האתר)

- **קובץ XML (למנועי חיפוש):**  
  `https://www.thehbm.org/sitemap.xml`  
  (בפיתוח: `http://localhost:4200/sitemap.xml` אם האתר רץ שם.)

- **איפה מוגדר:**  
  - קובץ: `apps/site/public/sitemap.xml`  
  - סקריפט ליצירה/עדכון: `npm run generate-sitemap` (מריץ את `scripts/build/generate-sitemap.js`).

- **robots.txt:**  
  `apps/site/public/robots.txt` מפנה ל-Sitemap:  
  `Sitemap: https://www.thehbm.org/sitemap.xml`

- **מפת אתר ויזואלית:**  
  קובץ `apps/site/public/visual-sitemap.html` (מפת דפים ויזואלית לניווט פנימי).

---

## סיכום קצר

| מה | איפה |
|----|------|
| **נתוני קוקיז** | אדמין → **Cookie Logs** |
| **Google Analytics / Clarity** | אדמין → **Analytics** (לינקים לדשבורדים החיצוניים) |
| **Sitemap XML** | `/sitemap.xml` באתר (או `apps/site/public/sitemap.xml` בקוד) |
| **עדכון Sitemap** | `npm run generate-sitemap` |
