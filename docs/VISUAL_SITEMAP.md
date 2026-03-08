# 🗺️ Visual Sitemap & User Flow

High-level structure of the HBM site and how users move through it.

## 🗺️ Strategic Architecture Map (v8.0)

**Main flows & CTAs:**
- **Home** → Hero CTA "What Is It?" → `/meeter` · Nav CTA "Your 8 Min" → `/events#register-video` · Scroll to explore → Meeter section
- **Discovery:** What Is It? (`/meeter`) → Click Next → Who Is It For? (`/meeter/who`) → Click Next → Features (`/meeter/features`) → CTA "Start Your 8 Minutes" → **Events**
- **Events** (`/events`) → Click Upcoming → Event Details (`/events/:id`) → CTA "Reserve My Spot" → Registration Form / WhatsApp · Click Past → Event Gallery Modal
- **Trust:** Knowledge (`/knowledge`) → Read Full → External Book · About (`/about`) · Contact (`/contact`)

```mermaid
graph TD
    Home["🏠 HOME PAGE"]
    NavCTA["Nav CTA: Your 8 Min → /events#register-video"]
    HeroCTA["Hero CTA: What Is It? → /meeter"]
    
    subgraph Discovery ["🔍 PRODUCT DISCOVERY (THE MEETER)"]
        Meeter["1. WHAT IS IT? /meeter"]
        Who["2. WHO IS IT FOR? /meeter/who"]
        Features["3. FEATURES /meeter/features"]
        DiscoveryCTA["CTA: Start Your 8 Minutes → Events"]
    end

    subgraph Brand ["🌟 BRAND & AUTHORITY"]
        Knowledge["KNOWLEDGE /knowledge"]
        About["ABOUT US /about"]
        Contact["CONTACT /contact"]
    end
    ExtBook["External Full Book / PDF"]

    subgraph Conversion ["🔥 CONVERSION ENGINE"]
        Events["EVENTS LIST /events"]
        EventDetails["EVENT DETAILS /events/:id"]
        ReserveCTA["CTA: Reserve My Spot"]
        Form["Registration Form / WhatsApp"]
        PastGallery["Event Gallery Modal"]
    end

    subgraph Backstage ["✨ THE BACKSTAGE"]
        ContentManager["CONTENT MANAGER"]
        AdminDashboard["ADMIN DASHBOARD /admin-dashboard"]
    end

    Home -->|Scroll to explore| Meeter
    Home -->|Click What Is It?| HeroCTA
    HeroCTA --> Meeter
    Home --> NavCTA
    NavCTA --> Events
    
    Meeter -->|Click Next| Who
    Who -->|Click Next| Features
    Features --> DiscoveryCTA
    DiscoveryCTA --> Events

    Events -->|Click Upcoming| EventDetails
    Events -->|View Past| PastGallery
    EventDetails --> ReserveCTA
    ReserveCTA --> Form
    
    Knowledge -.->|Read Full| ExtBook
    About --> Contact
    
    ContentManager -- "Manages Events & Media" --> Events
    ContentManager -- "Updates" --> Knowledge
    AdminDashboard -- "Controls Config" --> EventDetails
    
    style Discovery fill:#f0f7ff,stroke:#007bff,stroke-width:2px
    style Backstage fill:#f8f9fe,stroke:#6160AB,stroke-width:2px
    style Brand fill:#fdfaff,stroke:#a855f7,stroke-width:2px
    style Conversion fill:#fff9f5,stroke:#f97316,stroke-width:2px
    style Home fill:#fff,stroke:#333,stroke-width:3px
```

## 📑 Page Breakdown

### 1. **Core Experience (The Meeter)**
The heart of the new site, explaining the 8-minute connection engine.
*   **`/meeter` (What)**: The "Zero Small Talk" concept, the psychology, and the "Why".
*   **`/meeter/who` (Who)**: Targeted solutions for **Universities**, **Offices**, **Hotels**, etc. (The visual "Atmosphere" section).
*   **`/meeter/features` (How)**: The technical features (Matching, Prompts, Feedback).

### 2. **Community & Action (Events)**
Where users convert from visitors to participants.
*   **`/events`**: Visual calendar of upcoming and past events (Hero video interaction).
*   **`/events/:id`**: Specific event details, venue info, and specific agenda.
*   **`/events/register`**: The final conversion point to buy tickets/sign up.

### 3. **Wisdom (Knowledge)**
The educational pillar.
*   **`/knowledge`**: A library of books, articles, and figures that inspire the HBM philosophy.

### 4. **Brand (About)**
*   **`/about`**: The story, the team, and the "Human Being Movement" manifesto.

### 5. **Shortcuts & Redirects**
Quick links for marketing purposes:
*   `/b2b` → Goes to **Who Is It For?**
*   `/gallery` → Goes to **Events**
*   `/faq` → Goes to **The Meeter**

---

**See also:** [ARCHITECTURE.md](ARCHITECTURE.md) · [README](../README.md)
