# אופטימיזציות ביצועים — Performance Optimizations

## סיכום מה בוצע

### 1. טעינה עצלה של דפים (Route-level code splitting)
- **דף הבית (Home)** נטען מיד — הדף הראשון נשאר מהיר.
- כל שאר הדפים (About, Events, Knowledge, Admin, Contact, Meeter, וכו') נטענים **רק כשנכנסים אליהם**.
- **תוצאה:** bundle ראשוני קטן יותר, טעינה ראשונה מהירה יותר.

### 2. דחיית אנליטיקס
- `initAnalytics()` (GA4 + Clarity) רץ ב-**requestIdleCallback** (או אחרי 500ms).
- לא חוסם את הציור הראשון של הדף.

### 3. טעינה עצלה בדף הבית (Home)
- **QuoteCarousel** (רשימת ציטוטים גדולה + אנימציות) — נטען ב-chunk נפרד.
- **Guidelines** — נטען ב-chunk נפרד.
- **תוצאה:** ה-bundle הראשי של דף הבית ירד מ־~195 KB ל־~144 KB (gzip: ~47 KB).

### 4. הסרת ייבוא לא בשימוש (Home)
- הוסרו ייבואי `MacbookScroll`, `ManifestoSection`, `HowItWorks`, `PhilosophyQuote`, `ui` מדף הבית (לא היו בשימוש שם).

### 5. EventsContext
- ערך ה-context עטוף ב-**useMemo** — מפחית רינדורים מיותרים.

### 6. Vite
- **build.target: "es2020"** — קוד מקומט יותר לדפדפנים מודרניים.
- **manualChunks** — React, Three.js, three-globe, אנימציות, אייקונים ו-Clarity ב-chunks נפרדים.
- **chunkSizeWarningLimit: 2100** — מניעת אזהרה על vendor-three (נטען רק בדף About).

### 7. אנליטיקס (Clarity) ב-chunk נפרד
- **analytics-clarity.js** — Microsoft Clarity נטען דינמית רק אחרי `initAnalytics()` ובהתאם להסכמת cookies.
- ה-bundle הראשי לא כולל את `@microsoft/clarity` — טעינה ראשונה קלה יותר.

### 8. פונטים
- **אין ייבוא פונטים ב-CSS** — הפונטים נטענים רק מ-`index.html` עם `display=swap`, בלי חסימת רינדור כפולה.

---

## איך להמשיך לייעל (אופציונלי)

- **תמונות:** שימוש ב-`loading="lazy"` ו־`decoding="async"`; שיקול ל-WebP/AVIF.
- **פונטים:** `font-display: swap` ו־subset לפונטים.
- **דף About (גלובוס):** הגלובוס כבר נטען עצלן ב-GlobeDemo; דף About עצמו נטען עצלן בכניסה לרוט.
- **מדידות:** להשתמש ב-Lighthouse / WebPageTest לבדיקת LCP, TBT, CLS.
