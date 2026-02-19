# The HBM - Visual Sitemap & User Flow

This document visualizes the structure of the new HBM website, showing how users navigate through the experience.

## 🗺️ Site Architecture Diagram

```mermaid
graph TD
    %% Main Nodes
    Home["🏠 Home<br/>(Landing Page)"]
    
    %% Core Sections
    Meeter["🧩 The Meeter<br/>(Product Core)"]
    Events["📅 Events<br/>(Community)"]
    Knowledge["🧠 Knowledge<br/>(Wisdom Base)"]
    About["👋 About Us<br/>(Manifesto & Mission)"]
    
    %% Sub-Sections: Meeter
    MeeterWhat["What is it?<br/>/meeter"]
    MeeterWho["Who is it for?<br/>/meeter/who"]
    MeeterFeatures["Features<br/>/meeter/features"]
    
    %% Sub-Sections: Events
    EventList["Events List<br/>/events"]
    EventDetail["Event Details<br/>/events/:id"]
    EventReg["Registration<br/>/events/register"]
    
    %% Sub-Sections: Misc
    B2B["🏢 B2B / Corporate<br/>(Redirects to Who)"]
    Gallery["📷 Gallery<br/>(Redirects to Events)"]
    FAQ["❓ FAQ<br/>(Redirects to Meeter)"]

    %% Connections
    Home --> Meeter
    Home --> Events
    Home --> Knowledge
    Home --> About
    
    %% Meeter Flow
    Meeter --> MeeterWhat
    MeeterWhat --> MeeterWho
    MeeterWho --> MeeterFeatures
    
    %% Event Flow
    Events --> EventList
    EventList --> EventDetail
    EventDetail --> EventReg
    
    %% Cross-Links
    B2B -.-> MeeterWho
    Gallery -.-> EventList
    FAQ -.-> MeeterWhat
    
    %% Call to Actions (CTAs)
    RegisterCTA("🚀 Register Now")
    style RegisterCTA fill:#F07B3C,stroke:#F07B3C,color:white
    
    EventList --> RegisterCTA
    EventDetail --> RegisterCTA
    Home --> RegisterCTA
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
