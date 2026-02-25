# סקירת מצב האתר והאדמין – The HBM

## סיכום מנהלים
- **האתר והאדמין מסודרים ועובדים.** אפשר לעלות לאוויר אחרי בניית ה-frontend והגדרת משתני סביבה.
- **CRM:** כל רישום (אירוע פיזי, וידאו, ניוזלטר) נשמר ב-`registrations.json` ומופיע באדמין.
- **קוקיז ואנליטיקס:** איסוף הסכמה ל-SQLite, GA4 + Clarity (כולל Heatmaps) נטענים רק אחרי הסכמה.
- **תוכן חי:** ספרים, יוטיוב, How It Works, Site Content – נשמרים ב-API ומעודכנים מיד בדף הציבורי.
- **Magic Fetch (ספרים):** עובד עם שם ספר + אופציונלי סופר; מחזיר כריכה, תיאור, ציטוטים וסיכומים (דורש GEMINI_API_KEY).
- **סוכן האדמין (צ'אט):** הוסר מהמערכת – אין צורך בפעולה.

---

## 1. CRM ורישומים
| מקור | Endpoint | קובץ | מצב |
|------|----------|------|-----|
| רישום לאירוע פיזי | `POST /api/register` | NextEventHero, טופס אירוע | ✅ נשמר ל-`src/data/registrations.json` |
| רישום לאירוע וידאו | `POST /api/register` | VideoEventModal | ✅ אותו קובץ |
| הרשמה לניוזלטר | `POST /api/newsletter` | NewsletterSection (פוטר) | ✅ אותו קובץ |

- כל הרישומים עם: שם, אימייל, טלפון, מקור, eventId, תאריך, היסטוריה.
- באדמין: **CRM Database** – צפייה, סינון (אירוע, מקור, תאריך), מיון, ייצוא CSV, צפייה "לפי אדם" (כמה פעמים נרשם).

---

## 2. קוקיז ואיסוף נתונים
- **הסכמה:** באתר מופיע באנר/דרוור; המשתמש בוחר Accept / Decline / Custom (אנליטיקה, שיווק).
- **לוג:** `POST /api/cookie-consent-log` שומר ל-SQLite (טבלת `CookieConsentLog`: choice, settings, hashedIp, timestamp).
- **אדמין:** טאב **Cookie Logs** – רשימת בחירות, ספירות (accept_all / decline_all / custom).

---

## 3. אנליטיקס ו-Heatmaps
- **GA4:** מזהה מ-`VITE_GA_ID` (ברירת מחדל: G-BR4CGS5B7X). נטען רק אם המשתמש אישר אנליטיקה.
- **Microsoft Clarity:** מזהה מ-`VITE_CLARITY_ID` (ברירת מחדל: vjvlklwjdb). משמש ל:
  - Heatmaps (מפות חום)
  - Session Recordings (הקלטות)
  - AI Insights
- **Consent Mode v2:** ברירת מחדל "דחייה"; סקריפטים נטענים רק אחרי הסכמה.
- **אדמין → Analytics:** לינקים ל-GA4 ול-Clarity (כולל Heatmaps). הנתונים מופיעים ב-clarity.microsoft.com אחרי שיש גלישה באתר **עם** הסכמה לאנליטיקה.

---

## 4. עדכון תוכן חי מהאדמין
| אזור באדמין | API | דף ציבורי | עדכון |
|--------------|-----|-----------|--------|
| Site Content → Knowledge (ספרים/וידאו) | GET/POST `/api/cms/knowledge-base` | `/knowledge` | ✅ מיד אחרי Save |
| Site Content → How It Works | GET/POST `/api/cms/how-it-works` | How It Works | ✅ מיד |
| Site Content → Team, Testimonials, וכו' | GET/POST `/api/site-content` | About, MeeterWho, וכו' | ✅ מיד |
| Video Event | GET/POST `/api/video-event` | דף אירוע וידאו | ✅ מיד |
| Events | `/api/events` + קבצי JSON | Events, Hero | ✅ לפי טעינת הדף |

כל מה שאתה שומר באדמין (ספרים, יוטיוב, טקסטים) משתקף בדפים הציבוריים בלי ריענון מיוחד – הדפים טוענים מה-API.

---

## 5. AI Magic Fetch – ספרים
- **איפה:** אדמין → Site Content → Knowledge → כפתור "Magic Fetch" ליד כל ספר.
- **קלט:** **חובה** – כותרת ספר; **אופציונלי** – סופר (משפר דיוק).
- **מה קורה:**  
  1. חיפוש ב-Google Books (אופציונלי: `GOOGLE_BOOKS_API_KEY` ב-.env).  
  2. כריכה: Google Books או Open Library.  
  3. GEMINI (או OpenAI כ-fallback) מייצר: authorQuote, threeKeySentences, shortSummary, fullSummary, finalQuote, author.
- **תוצאה:** כריכה (coverUrl), תיאור, סיכומים, ציטוטים – מתמלאים בשדות הספר באדמין; אחרי "Save Content" זה עובר ל-API ומופיע ב-Knowledge.
- **דרישה:** `GEMINI_API_KEY` ב-.env (או `OPENAI_API_KEY` כ-fallback). בלי מפתח – הכריכה והמטא-דאטה מ-Google Books עדיין יכולים לעבוד; החלק של הסיכומים/ציטוטים לא ימולא.

---

## 6. מיילים אוטומטיים (מה לא מוכן)
- **מצב:** לוגיקת אוטומציה קיימת (trigger אחרי רישום/ניוזלטר), תור מיילים, קמפיינים ב-Email Architect.
- **חסר להפעלה:** הגדרת SMTP אמיתית ב-.env:
  - `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- בלי SMTP מוגדר – האוטומציות לא ישלחו מייל בפועל (האתר והאדמין ימשיכו לעבוד).

---

## 7. באגים ובדיקות
- **סוכן האדמין (צ'אט):** הוסר – אין קומפוננטה ולא API.
- **EmailEngine:** `textareaRef` קיים (תוקן בעבר).
- **AnalyticsDashboard:** אין `<a>` מקונן (תוקן).
- **NewsletterSection:** משתמש ב-`getApiBase()` כמו שאר האתר.
- **רישום:** `console.log` של CRM שלם; אין שגיאת תחביר ב-handler של `/api/register` או `/api/newsletter`.

---

## 8. מה צריך ממך כדי לעלות לאוויר

### חובה
1. **בניית Frontend:**  
   `npm run build`  
   יוצר את התיקייה `dist/` – השרת מגיש ממנה קבצים סטטיים.

2. **הרצת השרת:**  
   `node admin-server.js`  
   (או דרך process manager כמו PM2). השרת רץ על `PORT` (ברירת מחדל 3001), מגיש את `dist/` וכל ה-API.

3. **משתני סביבה (.env):**
   - `PORT` – פורט השרת (אם המארח מגדיר, להשתמש בו).
   - `ADMIN_PASSWORD` – סיסמת כניסה לאדמין.
   - `DATABASE_URL` – אם אתה משתמש ב-SQLite: `file:./dev.db` או נתיב ל-production DB.

4. **תשתית:**  
   להגדיר (או אצל המארח) ש־**כל התעבורה** (כולל דומיין האתר) מגיעה לשרת שרץ את `admin-server.js` – כך ש-`/api/*` ו-`/` (קבצים מ-dist) מאותו מקור (same-origin).

### אופציונלי אבל מומלץ
- **GEMINI_API_KEY** – ל-Magic Fetch ספרים ול-Email Architect (שיפור טקסט).
- **GOOGLE_BOOKS_API_KEY** – לשיפור חיפוש ספרים (לא חובה; Google Books עובד בלי עם מגבלת קצב).
- **SMTP_*** ** – כשאתה מוכן לשלוח מיילים אוטומטיים מהמערכת.
- **VITE_GA_ID**, **VITE_CLARITY_ID** – אם אתה משנה מזהה GA4 או פרויקט Clarity (נבנה ב-build).

---

## 9. פקודות שימושיות
```bash
# פיתוח (פרונט + שרת)
npm run dev

# בנייה לעלייה
npm run build

# הרצת שרת בלבד (אחרי build)
node admin-server.js
```

---

**עדכון אחרון:** פברואר 2025. סוכן האדמין הוסר; CRM, קוקיז, אנליטיקס, תוכן חי ו-Magic Fetch ספרים פעילים ומוכנים לעלייה.
