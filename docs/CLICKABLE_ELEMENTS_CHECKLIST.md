# Clickable Elements & State Management Checklist

Quick reference for all main buttons, forms, and links and verification of their state handling.

---

## 1. Global / Layout

| Element | Location | State / Handler | Verified |
|--------|----------|------------------|----------|
| **Burger menu (mobile)** | Navbar | `mobileOpen` ↔ `setMobileOpen(true/false)`; closes on route change | OK |
| **Logo (desktop)** | Navbar | `<Link to="/">` | OK |
| **Logo (mobile)** | Navbar | `<Link to="/" onClick={() => setMobileOpen(false)}>` | OK |
| **Nav links (desktop)** | Navbar | `<Link to={path}>`; active via `isActive(path)` | OK |
| **Meeter dropdown** | Navbar | `openDropdown` ↔ `setOpenDropdown(key/null)`; outside-click close via ref | OK |
| **Language switcher** | Navbar | `open` ↔ `setOpen`; option click → `setLang(code)` + `setOpen(false)` | OK |
| **Your 8 Min (CTA)** | Navbar | `<Link to="/events#register-video">` or similar | OK |
| **WhatsApp float** | Layout | `<a href={whatsappUrl}>`; tooltip close → `setShowTooltip(false)` | OK |
| **Tooltip close (X)** | Layout | `onClick={() => setShowTooltip(false)}` | OK |

---

## 2. Footer & Newsletter

| Element | Location | State / Handler | Verified |
|--------|----------|------------------|----------|
| **Social links** | Footer | `<a href={item.url}>` (no local state) | OK |
| **Office email** | Footer | `<a href="mailto:...">` | OK |
| **Privacy / Terms** | Footer | `<Link to="/privacypolicy">` etc. | OK |
| **Newsletter input** | NewsletterSection | `email` ↔ `setEmail`; controlled input | OK |
| **Newsletter submit** | NewsletterSection | `onSubmit={handleSubmit}`; `status` (idle/loading/success/error); button disabled when loading | OK |

---

## 3. Cookie Consent

| Element | Location | State / Handler | Verified |
|--------|----------|------------------|----------|
| **Drawer open** | CookieConsent | `isOpen` from localStorage + 2s delay; `onOpenChange={setIsOpen}` | OK |
| **Accept All** | CookieConsent | `handleAcceptAll` → setSettings, updateConsent, log, close | OK |
| **Decline All** | CookieConsent | `handleDeclineAll` → minimal settings, log, close | OK |
| **Custom toggles** | CookieConsent | `settings` ↔ `setSettings` (essential/analytics/marketing) | OK |
| **Save settings** | CookieConsent | `handleSaveSettings` → updateConsent, log, close, `setShowSettings(false)` | OK |

---

## 4. Contact Page

| Element | Location | State / Handler | Verified |
|--------|----------|------------------|----------|
| **WhatsApp / Email buttons** | Contact | `<a href={...}>` | OK |
| **Type selector buttons** | Contact | `selectedType` ↔ `setSelectedType(i)` | OK |
| **Name / Email / Message inputs** | Contact | `formData` ↔ `setFormData` (controlled) | OK |
| **Send button** | Contact | `<form onSubmit={handleSubmit}>`; `submitStatus` (idle/loading); handler opens mailto with pre-filled body and clears form | OK |

*Contact submit uses mailto (opens email client) until a backend contact endpoint is added.*

---

## 5. Events & Event Details

| Element | Location | State / Handler | Verified |
|--------|----------|------------------|----------|
| **Featured event card** | Events | `onClick={() => navigate(\`/events/${event.id}\`)}` | OK |
| **Year toggle buttons** | Events | `selectedYear` ↔ `setSelectedYear(year)` | OK |
| **Past event cards** | Events | `onClick={() => openEventModal(event)}` → navigate or `setSelectedEvent` + `setIsModalOpen(true)` | OK |
| **Event modal close** | EventModal | Close handler sets modal state closed | OK |
| **Back button** | EventDetails | `onClick={() => navigate('/events')}` | OK |
| **404 Back to Events** | EventDetails | `onClick={() => navigate('/events')}` | OK |
| **Registration form (NextEventHero)** | NextEventHero | `formState`, `submitStatus`; `handleRegister` on submit; success → `setSubmitStatus("success")` | OK |

---

## 6. Knowledge (Books / Videos)

| Element | Location | State / Handler | Verified |
|--------|----------|------------------|----------|
| **Book/Video card click** | Knowledge | `setSelectedBook(book)` opens drawer | OK |
| **Drawer close (backdrop / X)** | LibraryDrawer | `onClose()` → parent `handleCloseDrawer` → `setSelectedBook(null)` | OK |
| **Body scroll lock** | Knowledge | `useEffect` when `selectedBook` set; cleanup on close | OK |

---

## 7. Admin Dashboard (CRM)

| Element | Location | State / Handler | Verified |
|--------|----------|------------------|----------|
| **Tab navigation** | AdminDashboard | Active tab state; tab click switches view | OK |
| **View profile (By Person)** | AdminDashboard | `setSelectedContactEmail(email)`; useEffect fetches profile → `setContactProfileData` / `setContactProfileError` | OK |
| **View contact (By Registration)** | AdminDashboard | Same: `setSelectedContactEmail(reg.email)` | OK |
| **Drawer close** | AdminDashboard | `onClick={() => setSelectedContactEmail(null)}`; Escape key same | OK |
| **Retry (profile error)** | AdminDashboard | Re-fetches profile; clears error on success | OK |
| **Delete contact** | AdminDashboard | Confirm → `DELETE /api/registrations/by-contact?email=...` → `refetchRegistrations()` + close drawer | OK |
| **Delete registration (row)** | AdminDashboard | Confirm → `DELETE /api/registrations/:id` → refetch + update profile data | OK |
| **Export profile** | AdminDashboard | Link to `GET /api/crm/contact/export?email=...` | OK |

*Note: Profile load depends on backend; if API is missing or wrong base URL, "Could not load profile" is expected until backend is running and routes are correct.*

---

## 8. Other Pages

| Element | Location | State / Handler | Verified |
|--------|----------|------------------|----------|
| **About – team card click** | About | `setSelectedMember(member)`; modal with bio | OK |
| **About – modal close** | About | `setSelectedMember(null)` | OK |
| **TeamMember – Back to About** | TeamMember | `onClick={() => navigate("/about")}` | OK |
| **PageErrorBoundary – Back to Home** | PageErrorBoundary | `<Link to="/">` | OK |

---

## Summary

- **Verified OK:** Navbar (menu, dropdown, lang), Layout (WhatsApp, tooltip), Footer links, Newsletter form, Cookie consent, **Contact form (submit → mailto + state)**, Events/EventDetails/NextEventHero, Knowledge drawer, Admin CRM (View profile, Delete, Retry, drawer close), About modal, TeamMember back.
- **No open issues.** Contact form submits via mailto until a backend endpoint is added.

---

## How to verify state yourself

1. **Buttons:** Ensure each has `onClick` or is `type="submit"` inside a form with `onSubmit`.
2. **Forms:** Ensure `<form onSubmit={...}>` and that submit handler updates loading/success/error state and disables submit while loading where appropriate.
3. **Modals/drawers:** Ensure open state is set on trigger and cleared on close (and optionally on Escape/backdrop).
4. **Links:** `<Link to="...">` and `<a href="...">` need no local state unless tracking active route; Navbar uses `useLocation()` for active style.
