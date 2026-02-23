# The HBM - Visual Sitemap & User Flow

This document visualizes the structure of the new HBM website, showing how users navigate through the experience.

## 🗺️ Strategic Architecture Map (v8.0)

```mermaid
graph TD
    %% Main Entry
    Home["🏠 HOME PAGE"]
    
    %% Product Discovery Box
    subgraph Discovery ["🔍 PRODUCT DISCOVERY"]
        Meeter["THE MEETER"]
        Who["WHO IS IT FOR"]
        Features["FEATURES"]
        
        Meeter --> Who
        Who --> Features
    end

    %% The Backstage Box
    subgraph Backstage ["✨ THE BACKSTAGE"]
        ContentManager["CONTENT MANAGER"]
        AdminDashboard["ADMIN DASHBOARD"]
        VisualEditor["VISUAL EVENT EDITOR"]
    end

    %% Brand & Authority Box
    subgraph Brand ["💡 BRAND & AUTHORITY"]
        Knowledge["KNOWLEDGE"]
        About["ABOUT US"]
    end

    %% Conversion Engine Box
    subgraph Conversion ["🔥 CONVERSION ENGINE"]
        Events["EVENTS CALENDAR"]
        Checkout["CHECKOUT"]
        
        Events --> Checkout
    end

    %% Strategic Flows
    Home --> Discovery
    Home --> Events
    
    Discovery --> Events
    
    ContentManager -- "Manages" --> Brand
    AdminDashboard -- "Controls" --> Conversion
    VisualEditor -- "Creates" --> Events
    
    Brand -.-> Events
    
    %% Styling
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
