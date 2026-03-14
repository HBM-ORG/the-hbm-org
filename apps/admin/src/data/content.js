import { PUBLIC_BRAND } from "../config/public-brand";

const LEGACY_MEDIA_BASE =
  "https://test-org-site-media-files.nyc3.digitaloceanspaces.com/legacy/wordpress-media";

export const siteContent = {
  global: {
    siteName: "The HBM",
    tagline: { en: "Bringing People Together", he: "מחברים אנשים" },
    logo: "/assets/how-it-works/theHBM LOGO@3x.png",
    logoTagline: "/assets/logo.png",
    favicon: "/assets/logo.png",
    ctaUrl: "/events#register-video",
    whatsappUrl: PUBLIC_BRAND.inquiryWhatsappUrl,
    socialLinks: PUBLIC_BRAND.socialLinks,
    nav: [
      { label: "Home", path: "/" },
      { label: "Meeter", path: "/meeter" },
      { label: "About Us", path: "/about" },
      { label: "For B2B", path: "/b2b" },
      { label: "Events", path: "/events" },
      { label: "Gallery", path: "/gallery" },
      { label: "Contact", path: "/contact" },
    ],
    footer: {
      copyright: "© The HBM 2026 All rights reserved",
      socialCards: [
        {
          platform: "Instagram",
          text: "Here we try to look cooler than we are. Come for the visuals, stay for the behind-the-scenes chaos.",
          url: PUBLIC_BRAND.socialLinks.instagram,
        },
        {
          platform: "WhatsApp",
          text: "A direct line to the team! Questions, feedback, or just a hello—we're here.",
          url: PUBLIC_BRAND.socialLinks.whatsapp,
        },
        {
          platform: "Facebook",
          text: "Yes, we still use Facebook. And no, we're not here for the drama.",
          url: PUBLIC_BRAND.socialLinks.facebook,
        },
        {
          platform: "LinkedIn",
          text: 'Our "we\'re professional, promise" face. For updates, partnerships, and sentences that use the word "synergy".',
          url: PUBLIC_BRAND.socialLinks.linkedin,
        },
        {
          platform: "YouTube",
          text: "Where we share stories, events, and the magic behind 8-minute connections.",
          url: PUBLIC_BRAND.socialLinks.youtube,
        },
      ],
    },
    // Client/partner logos - PLACEHOLDER: replace URLs when ready
    clientLogos: [
      { name: "Client 1", logo: "" },
      { name: "Client 2", logo: "" },
      { name: "Client 3", logo: "" },
      { name: "Client 4", logo: "" },
      { name: "Client 5", logo: "" },
      { name: "Client 6", logo: "" },
    ],
  },

  // ============================================================
  // HOMEPAGE
  // ============================================================
  home: {
    hero: {
      titlePrefix: { en: "Bringing ", he: "מחברים " },
      titleSuffix: { en: "Together", he: "ביחד" },
      rotatingWords: [
        "People",
        "Employees",
        "Organizations",
        "Neighbors",
        "Communities",
        "Athletes",
        "Colleagues",
        "Friends",
        "Families",
        "Students",
        "Tourists",
        "Residents",
        "Consumers",
        "Customers",
        "Knowledge",
        "Interests",
        "Feelings",
        "Cultures",
        "Thoughts",
        "Ideas",
        "Emotions",
        "Stories",
        "Inspiration",
        "Creativity",
        "Understanding",
        "Memories",
        "Perspectives",
        "Experiences",
        "Curiosity",
        "Authenticity",
        "Empathy",
        "Energy",
        "Harmony",
        "Insight",
        "Learning",
        "Sharing",
        "Bonding",
        "Wisdom",
        "Expressions",
        "Openness",
      ],
      rotatingWordsHe: [
        "אנשים",
        "עובדים",
        "ארגונים",
        "שכנים",
        "קהילות",
        "ספורטאים",
        "עמיתים",
        "חברים",
        "משפחות",
        "סטודנטים",
        "תיירים",
        "תושבים",
        "צרכנים",
        "לקוחות",
        "ידע",
        "תחומי עניין",
        "רגשות",
        "תרבויות",
        "מחשבות",
        "רעיונות",
        "רגשות",
        "סיפורים",
        "השראה",
        "יצירתיות",
        "הבנה",
        "זיכרונות",
        "נקודות מבט",
        "חוויות",
        "סקרנות",
        "אותנטיות",
        "אמפתיה",
        "אנרגיה",
        "הרמוניה",
        "תובנות",
      ],
      ctaText: { en: "Start Your 8 Min", he: "התחילו 8 דקות" },
      imagePairs: [
        { unit: "/assets/hero/people/Bringing People Together Images.png" },
      ],
    },

    conversationCards: {
      titleLines: {
        en: ["The Oasis", "A Human Space in a Noisy World"],
        he: ["ה-Oasis", "מרחב אנושי בעולם רועש"],
      },
      ctaText: { en: "See for yourself", he: "תראו בעצמכם" },
      cards: [
        {
          icon: "💬",
          title: {
            en: "So many good people out there who just want to live and let live.",
            he: "יש כל כך הרבה אנשים טובים שרק רוצים לחיות ולתת לאחרים לחיות.",
          },
          text: { en: "", he: "" },
          bgColor: "#fbd5c1",
          iconBg: "#F07B3C",
        },
        {
          icon: "🌿",
          title: {
            en: "If you're tired of the constant pressure of the news, the noise of social media, and the weight of difficult conversations — Meeter is your sanctuary.",
            he: "אם אתם עייפים מהלחץ המתמיד של החדשות, הרעש של הרשתות החברתיות ומשקל השיחות הקשות — Meeter הוא המקלט שלכם.",
          },
          text: { en: "", he: "" },
          bgColor: "#bbc0ff",
          iconBg: "#6160AB",
        },
        {
          icon: "✨",
          title: {
            en: "We're here for the light, genuine, and heart-opening connections that give you the energy to face whatever the day brings. No agendas, no stress. Just 8 minutes of pure human soul.",
            he: "אנחנו כאן בשביל החיבורים הקלים, האמיתיים ופותחי הלב שנותנים לכם אנרגיה להתמודד עם כל מה שהיום מביא. ללא אג'נדות, ללא לחץ. רק 8 דקות של נשמה אנושית טהורה.",
          },
          text: { en: "", he: "" },
          bgColor: "#d8eecf",
          iconBg: "#73C154",
        },
      ],
    },

    banner: {
      title: { en: "Why 8 Minutes?", he: "למה 8 דקות?" },
      textHtml: {
        en: "Short enough <strong>to say YES</strong>, yet long enough <strong>to feel GOOD</strong>",
        he: "קצר מספיק <strong>כדי להגיד כן</strong>, ארוך מספיק <strong>כדי להרגיש טוב</strong>",
      },
      description: {
        en: "It's the perfect amount of time to open up, form a real connection, and walk away with something meaningful",
        he: "זה הזמן המושלם להיפתח, ליצור חיבור אמיתי, ולצאת עם משהו משמעותי",
      },
      ctaText: { en: "It's Just 8-Minutes", he: "זה רק 8 דקות" },
      video: `${LEGACY_MEDIA_BASE}/2025/05/banner-video.mp4`,
      // PLACEHOLDER: Replace with Elad's YouTube video URL
      eladYoutubeUrl: "https://www.youtube.com/watch?v=R7smYF02Kjo",
      eladVideoTitle: {
        en: "Watch: Why 8 Minutes Changes Everything",
        he: "צפו: למה 8 דקות משנות הכל",
      },
    },

    // PLACEHOLDER: Eli's video section
    eliVideo: {
      title: { en: "Eli's Story", he: "הסיפור של אלי" },
      // PLACEHOLDER: Replace with Eli's video URL
      videoUrl: "PLACEHOLDER_ELI_VIDEO_URL",
      description: {
        en: "Watch how one conversation changed everything.",
        he: "ראו איך שיחה אחת שינתה הכל.",
      },
    },

    howItWorks: {
      title: { en: "How It Works", he: "איך זה עובד" },
      subtitle: {
        en: "It’s a New Way to Connect.",
        he: "דרכים חדשות ליצור חיבור.",
      },
      videoSteps: [
        {
          title: { en: "Scan & Set Your Vibe", he: "בחרו את האווירה" },
          desc: {
            en: "No app download needed. Scan the QR code to enter Meeter. Pick your interests and choose an emoji to get started.",
            he: "בחרו תחומי עניין ואימוג׳י להתחלה.",
          },
          image: "/assets/how-it-works/videopath1.png",
        },
        {
          title: { en: "Enter the Lobby", he: "לובי מיינדסט" },
          desc: {
            en: "Get tips to prepare for a great conversation while we find your match.",
            he: "קבלו טיפים לשיחה מעולה בזמן שאנחנו מוצאים התאמה.",
          },
          image: "/assets/how-it-works/videopath2.png",
        },
        {
          title: { en: "8-Minutes", he: "8 דקות מונחות" },
          desc: {
            en: "Connect through guided icebreakers that make online interaction natural and fun.",
            he: "שיחה עמוקה עם שוברי קרח בזמן אמת.",
          },
          image: "/assets/how-it-works/videopath3.png",
        },
        {
          title: { en: "Stay in Touch", he: "כרטיס חיבור" },
          desc: {
            en: "Decide what details to share and keep the connection alive beyond the experience.",
            he: "המזכרת הדיגיטלית שלכם. החליפו פרטים מיד.",
          },
          image: "/assets/how-it-works/videopath4.png",
        },
      ],
      physicalSteps: [
        {
          title: { en: "Scan & Set Your Vibe", he: "בחרו את האווירה" },
          desc: {
            en: "No app download needed. Scan the QR code, select your interests, and pick an emoji to start.",
            he: "בחרו תחומי עניין כדי לאותת לחדר.",
          },
          image: "/how-it-works/f2f-step-3.png",
        },
        {
          title: { en: "Go To Your Matching Zone", he: "לובי מיינדסט" },
          desc: {
            en: "Meeter guides you to the specific zone where you’ll meet your match.",
            he: "קבלו טיפים לשיחה מעולה בזמן שאנחנו מוצאים התאמה.",
          },
          image: "/how-it-works/f2f-step-2.png",
        },
        {
          title: { en: "Flip To Find", he: "8 דקות מונחות" },
          desc: {
            en: "Hold your phone up like an airport sign to instantly spot your match.",
            he: "החזיקו את הטלפון כמו שלט בשדה תעופה כדי לזהות מיד את ההתאמה שלכם.",
          },
          image: "/how-it-works/f2f-step-4.png",
        },
        {
          title: { en: "8 Minutes", he: "8 דקות מונחות" },
          desc: {
            en: "Enjoy live guided icebreakers and tips that make conversation effortless and fun.",
            he: "השיחה מתנהלת עם שאלות מנחות בזמן אמת.",
          },
          image: "/how-it-works/f2f-step-1.png",
        },
        {
          title: { en: "Stay In Touch", he: "כרטיס חיבור" },
          desc: {
            en: "Choose which details to share and continue the connection beyond the event.",
            he: "החליפו כרטיסים דיגיטליים מיד לשמירה על קשר.",
          },
          image: "/how-it-works/f2f-step-5.png",
        },
      ],
    },

    guidelines: {
      title: { en: "What Makes This Work:", he: "מה גורם לזה לעבוד:" },
      subtitle: {
        en: "Wherever people come together, clear guidelines help create a safe, respectful, and meaningful space.",
        he: "בכל מקום שאנשים מתחברים, כללים ברורים עוזרים ליצור מרחב בטוח, מכבד ומשמעותי.",
      },
      items: [
        {
          icon: `${LEGACY_MEDIA_BASE}/2025/06/Show-up-as-yourself.svg`,
          title: { en: "Show up as yourself.", he: "הגיעו כמו שאתם." },
          text: {
            en: 'Not your LinkedIn bio. Not your "I\'m totally fine" voice. Just you.',
            he: 'לא הפרופיל שלכם בלינקדאין. לא הקול של "הכל בסדר". פשוט אתם.',
          },
        },
        {
          icon: `${LEGACY_MEDIA_BASE}/2025/06/Show-up-as-yourself.-1.svg`,
          title: {
            en: "Give your full attention.",
            he: "תנו את מלוא תשומת הלב.",
          },
          text: {
            en: "One screen. One person. One moment. Be all in — it's only 8 minutes.",
            he: "מסך אחד. אדם אחד. רגע אחד. תהיו שם — זה רק 8 דקות.",
          },
        },
        {
          icon: `${LEGACY_MEDIA_BASE}/2025/06/Lead-with-curiosity.svg`,
          title: { en: "Lead with curiosity.", he: "הובילו עם סקרנות." },
          text: {
            en: "Ask real questions. Listen like you mean it.",
            he: "שאלו שאלות אמיתיות. הקשיבו ברצינות.",
          },
        },
        {
          icon: `${LEGACY_MEDIA_BASE}/2025/06/Be-generous.svg`,
          title: { en: "Be generous.", he: "היו נדיבים." },
          text: {
            en: "With your words, your time, your kindness.",
            he: "עם המילים שלכם, הזמן שלכם, החביבות שלכם.",
          },
        },
        {
          icon: `${LEGACY_MEDIA_BASE}/2025/06/Respect-every-vibe.svg`,
          title: { en: "Respect every vibe.", he: "כבדו כל אווירה." },
          text: {
            en: "Quiet? Loud? Awkward? It's all welcome here.",
            he: "שקט? רועש? מביך? הכל מוזמן לכאן.",
          },
        },
        {
          icon: `${LEGACY_MEDIA_BASE}/2025/06/Keep-it-light-when-needed.svg`,
          title: {
            en: "Talk Light. Talk Deep. Talk Real.",
            he: "דברו קל. דברו לעומק. דברו אמיתי.",
          },
          text: {
            en: "You never know where 8 minutes will take you.",
            he: "אף פעם לא יודעים לאן 8 דקות ייקחו אתכם.",
          },
        },
        {
          icon: `${LEGACY_MEDIA_BASE}/2025/06/Celebrate-different-perspectives.svg`,
          title: {
            en: "Celebrate different perspectives.",
            he: "חגגו נקודות מבט שונות.",
          },
          text: {
            en: "Connection doesn't require agreement, just curiosity.",
            he: "חיבור לא דורש הסכמה, רק סקרנות.",
          },
        },
        {
          icon: `${LEGACY_MEDIA_BASE}/2025/06/End-strong.svg`,
          title: { en: "End strong.", he: "סיימו חזק." },
          text: {
            en: "A kind word, a smile, a thank you.",
            he: "מילה טובה, חיוך, תודה.",
          },
        },
      ],
    },

    features: {
      sectionTitle: {
        en: "Design & Connection",
        he: "עיצוב וחיבור",
      },

      iceBreakers: {
        title: {
          en: "Ice-Breakers That Actually Work",
          he: "שוברי קרח שבאמת עובדים",
        },
        description: {
          en: "No awkward silence. No forced small talk. Just real questions that spark real conversations.",
          he: "בלי שתיקה מביכה. בלי שיחת חולין מאולצת. רק שאלות אמיתיות שמצתות שיחות אמיתיות.",
        },
        bullets: [
          {
            en: "Curated questions designed by conversation experts",
            he: "שאלות מעוצבות על ידי מומחי שיחה",
          },
          { en: "Fresh prompts every session", he: "שאלות חדשות בכל מפגש" },
          { en: "From light to deep in 8 minutes", he: "מקל לעמוק ב-8 דקות" },
        ],
        questions: [
          {
            en: "What kind of superhero would you like to be?",
            he: "איזה גיבור על היית רוצה להיות?",
          },
          {
            en: "What's a skill you'd love to master overnight?",
            he: "איזה כישרון היית רוצה לשלוט בו בן לילה?",
          },
          {
            en: "If you could have dinner with anyone, who would it be?",
            he: "אם היית יכול לאכול ארוחת ערב עם מישהו, מי זה היה?",
          },
          {
            en: "What's the best advice you've ever received?",
            he: "מה העצה הכי טובה שקיבלת?",
          },
          {
            en: "What's something you're proud of but rarely talk about?",
            he: "על מה אתה גאה אבל לא מדבר עליו?",
          },
          {
            en: "If you could time travel, where would you go?",
            he: "אם היית יכול לנסוע בזמן, לאן היית הולך?",
          },
          {
            en: "What's a small thing that makes your day better?",
            he: "מה דבר קטן שעושה את היום שלך טוב יותר?",
          },
          {
            en: "What are you most looking forward to this year?",
            he: "למה אתה מחכה הכי הרבה השנה?",
          },
        ],
        tips: [
          {
            en: "Take your time. Listen actively. Let the conversation flow naturally.",
            he: "קחו את הזמן שלכם. הקשיבו באופן פעיל. תנו לשיחה לזרום באופן טבעי.",
          },
          {
            en: "Be genuinely curious about the other person.",
            he: "היו סקרנים באמת כלפי האדם השני.",
          },
          {
            en: "Remember, it’s not an interview. It’s a connection.",
            he: "זכרו, זה לא ראיון. זה חיבור אמיתי.",
          },
          {
            en: "Maintain eye contact and smile. It goes a long way.",
            he: "שמרו על קשר עין וחייכו. זה עושה פלאים.",
          },
          {
            en: "Don’t be afraid of brief pauses. Silence can be comfortable.",
            he: "אל תפחדו משניות של שקט. שתיקה יכולה להיות נעימה.",
          },
          {
            en: "Share a brief personal story to build rapport.",
            he: "שתפו סיפור אישי קצר כדי לבנות קרבה.",
          },
          {
            en: "If you get stuck, simply ask them to elaborate on their last point.",
            he: "אם נתקעתם, פשוט בקשו מהם להרחיב על הנקודה הקודמת.",
          },
          {
            en: "End the conversation on a positive, encouraging note.",
            he: "סיימו את השיחה בנימה חיובית ומעודדת.",
          },
        ],
      },

      liveData: {
        title: { en: "Live Data on the Spot", he: "נתונים חיים במקום" },
        description: {
          en: "Don't guess. Know exactly what happened at your event. Track connections made, top interests, satisfaction scores - all in real time.",
          he: "אל תנחשו. דעו בדיוק מה קרה באירוע שלכם. עקבו אחרי חיבורים שנוצרו, תחומי עניין מובילים, ציוני שביעות רצון - הכל בזמן אמת.",
        },
        bullets: [
          {
            en: "Real-time connection analytics",
            he: "אנליטיקה של חיבורים בזמן אמת",
          },
          { en: "Engagement heatmaps", he: "מפות חום של מעורבות" },
          { en: "Export reports instantly", he: "ייצוא דוחות מיידי" },
        ],
      },

      matchingZone: {
        title: {
          en: "Smart Matching That Feels Human",
          he: "התאמה חכמה שמרגישה אנושית",
        },
        description: {
          en: "Our algorithm pairs people based on shared interests, conversation style, and energy — not just random chance.",
          he: "האלגוריתם שלנו מתאים אנשים על בסיס תחומי עניין משותפים, סגנון שיחה ואנרגיה — לא רק מזל.",
        },
        bullets: [
          { en: "Interest-based pairing", he: "התאמה מבוססת תחומי עניין" },
          { en: "Conversation style matching", he: "התאמת סגנון שיחה" },
          { en: "Balanced energy levels", he: "רמות אנרגיה מאוזנות" },
        ],
      },

      emotionMatrix: {
        title: {
          en: "Before & After: The Emotion Matrix",
          he: "לפני ואחרי: מטריצת הרגשות",
        },
        description: {
          en: "Track your emotional shift. Select how you feel before and after your 8-minute session. We use a 36-emotion matrix to visualize the power of human connection, plus easy contact exchange when you click.",
          he: "עקבו אחרי שינוי מצב הרוח שלכם. בחרו איך אתם מרגישים לפני ואחרי ה-8 דקות שלכם. אנחנו משתמשים במטריצה של 36 רגשות כדי להמחיש את העוצמה של חיבור אנושי, בנוסף להחלפת פרטי קשר בקליק.",
        },
        bullets: [
          {
            en: "36 precise emotions mapped by energy and positivity",
            he: "36 רגשות מדויקים ממופים לפי אנרגיה וחיוביות",
          },
          {
            en: "Visual proof of how 8 minutes shifts your mindset",
            he: "הוכחה חזותית לאיך 8 דקות משנות את מצב הרוח",
          },
          {
            en: "Seamless contact exchange directly from the platform",
            he: "החלפת פרטי קשר חלקה ישירות מהפלטפורמה",
          },
        ],
      },

      customLocations: {
        title: {
          en: "Customized Matching Locations",
          he: "מיקומי מפגש מותאמים אישית",
        },
        description: {
          en: "Personalize the matching experience by renaming the physical zones where participants meet. It’s a great way to highlight special spaces, sponsor areas, or distinct vibes for each specific event.",
          he: "התאימו אישית את חווית החיבור דרך שינוי השמות של אזורי המפגש. זו דרך מעולה להבליט מקומות מיוחדים לכל אירוע או קהילה, וששם ימצאו את המאצ׳.",
        },
        bullets: [
          {
            en: "Easily change location names & images",
            he: "שינוי שמות אזורים בקלות & תמונות",
          },
          {
            en: "Highlight special spaces per event",
            he: "הדגשת מקומות מיוחדים לכל אירוע",
          },
          {
            en: "Make the experience feel customized",
            he: "הפיכת החוויה לאישית ומותאמת לקהילה",
          },
        ],
      },

      bridge: {
        text: {
          en: "Ready to experience it in real life?",
          he: "מוכנים לחוות את זה במציאות?",
        },
        buttonText: { en: "View Upcoming Events", he: "צפו באירועים הקרובים" },
      },
    },
  },

  // ============================================================
  // ABOUT PAGE
  // ============================================================
  about: {
    hero: {
      title: { en: "Who We Are?", he: "מי אנחנו" },
      subtitle: {
        en: "The HBM – The Human Being Movement",
        he: "The HBM – תנועת בני האדם",
      },
      bigText: {
        en: "WE HAVE ONE JOB — TO HELP PEOPLE CONNECT",
        he: "יש לנו עבודה אחת — לחבר",
      },
      description: {
        en: "We are a team of real-life humans (yes, with flaws and coffee addictions) who believe that connection isn't a luxury, it's a need.\n\nWe come from different places – design, tech, psychology, community-building – but we share one big belief: the world's better when people talk to each other like people.",
        he: "אנחנו צוות של בני אדם אמיתיים (כן, עם פגמים והתמכרות לקפה) שמאמינים שחיבור הוא לא מותרות, הוא צורך.\n\nאנחנו באים ממקומות שונים – עיצוב, טכנולוגיה, פסיכולוגיה, בניית קהילות – אבל חולקים אמונה אחת גדולה: העולם טוב יותר כשאנשים מדברים אחד עם השני כבני אדם.",
      },
    },
    // PLACEHOLDER: Replace handholding video with event footage
    vision: {
      title: { en: "Our Vision", he: "החזון שלנו" },
      video: `${LEGACY_MEDIA_BASE}/2025/06/vision-video.mp4`, // PLACEHOLDER: Replace with event video
      textOnVideo: {
        en: "We imagine a future where HBM isn't just an app—it's a part of everyday life.",
        he: "אנחנו מדמיינים עתיד שבו HBM הוא לא רק אפליקציה — הוא חלק מהחיים.",
      },
      bigTextBelow: {
        en: "<strong>We're here</strong> to build a world that feels like it belongs to everyone.",
        he: "<strong>אנחנו כאן</strong> כדי לבנות עולם שמרגיש שהוא שייך לכולם.",
      },
      cards: [
        {
          text: {
            en: "We imagine a future where HBM isn't just an app – it's a part of everyday life.",
            he: "אנחנו מדמיינים עתיד שבו HBM הוא חלק מהחיים.",
          },
          bgColor: "#fbd5c1",
        },
        {
          text: {
            en: "Physical HBM centers in cities or even airport booths around the world.",
            he: "מרכזי HBM פיזיים בערים ואפילו דוכנים בשדות תעופה.",
          },
          bgColor: "#bbc0ff",
        },
        {
          text: {
            en: "We see HBM in schools, in companies and in neighborhoods.",
            he: "אנחנו רואים את HBM בבתי ספר, בחברות ובשכונות.",
          },
          bgColor: "#d8eecf",
        },
      ],
    },
    // Word of the month
    wordOfMonth: {
      title: { en: "Word of the Month", he: "מילת החודש" },
      word: { en: "Connection", he: "חיבור" },
      description: {
        en: "The invisible thread that makes us all human.",
        he: "החוט הבלתי נראה שהופך את כולנו לבני אדם.",
      },
    },
    // Guiding principles
    guidingPrinciples: {
      title: { en: "What Guides Us", he: "מה מוביל אותנו" },
      items: [
        {
          en: "Real conversations change real lives.",
          he: "שיחות אמיתיות משנות חיים אמיתיים.",
        },
        {
          en: "Technology should bring people closer, not further apart.",
          he: "טכנולוגיה צריכה לקרב אנשים, לא להרחיק.",
        },
        {
          en: "Every person has a story worth hearing.",
          he: "לכל אדם יש סיפור ששווה לשמוע.",
        },
        {
          en: "8 minutes can change everything.",
          he: "8 דקות יכולות לשנות הכל.",
        },
      ],
    },
    team: {
      title: { en: "Meet The Team", he: "הכירו את הצוות" },
      members: [
        {
          name: "Elad Maor Hefets",
          role: { en: "Founder & CEO", he: 'מייסד ומנכ"ל' },
          image: "/assets/team/1764669004079.png",
          nickname: { en: "The Visionary", he: "החזון" },
          linkedin: "https://www.linkedin.com/in/elad-hefets/",
          bio: {
            en: "The heart behind it all. Elad is the one who saw the possibility before anyone else did—and then made it happen. A family-first kind of guy with a mind full of ideas and a whiteboard always nearby. He's the glue, the dreamer, and the reason we're all here.",
            he: "הלב מאחורי הכל. אלעד הוא זה שראה את האפשרות לפני כולם — ואז הפך אותה למציאות. איש משפחה עם ראש מלא ברעיונות ולוח מחיק תמיד בקרבת מקום. הוא הדבק, החולם, והסיבה שכולנו כאן.",
          },
          funFact: {
            en: "Came up with HBM's entire vision during a long meditation. We're not saying he's a prophet, but we're not not saying it either.",
            he: "הגה את כל החזון של HBM במהלך מדיטציה ארוכה. אנחנו לא אומרים שהוא נביא, אבל אנחנו גם לא לא אומרים את זה.",
          },
        },
        {
          name: "Alex Shraibman",
          role: { en: "CTO", he: 'סמנכ"ל טכנולוגיות' },
          image: "/assets/team/alex.jpg",
          nickname: { en: "The Architect", he: "האדריכל" },
          linkedin: "https://www.linkedin.com/in/shraalex/",
          bio: {
            en: "The technical mastermind behind The HBM. Alex transforms complex visions into seamless, scalable reality. With a razor-sharp focus on architecture and user experience, he's the one making sure the magic happens reliably and beautifully.",
            he: "המוח הטכנולוגי מאחורי HBM. אלכס הופך חזון מורכב למציאות חלקה וניתנת להרחבה. עם מיקוד חד בארכיטקטורה וחווית משתמש, הוא מוודא שהקסם קורה בצורה אמינה ויפה.",
          },
          funFact: {
            en: "Can debug code in his sleep, and probably builds servers as a hobby. If it's technical, Alex has the answer.",
            he: "יכול לדבג קוד מתוך שינה, וכנראה בונה שרתים כתחביב. אם זה טכני, לאלכס יש את התשובה.",
          },
        },
        {
          name: "Tal Zohar",
          role: { en: "CFO", he: 'סמנכ"לית כספים' },
          image: "/assets/team/1688974168644.jpeg",
          nickname: {
            en: "The Real CEO (Don’t tell Elad)",
            he: 'המנכ"לית האמיתית (אל תגלו לאלעד)',
          },
          linkedin: "https://www.linkedin.com/in/tal-zohar-1807311ab/",
          bio: {
            en: "Tal’s the force that keeps everything grounded, on track, and somehow still smiling. While we joke that she’s the CEO in practice, no one’s arguing. With a calm presence and sharp instincts, she quietly (but powerfully) makes sure things actually get done.",
            he: 'טל היא הכוח שמחזיק הכל על הקרקע, במסלול, ואיכשהו עדיין מחייכת. בזמן שאנחנו מתבדחים שהיא המנכ"לית בפועל, אף אחד לא מתווכח. עם נוכחות רגועה ואינסטינקטים חדים, היא דואגת (בשקט אך בעוצמה) שהדברים באמת יקרו.',
          },
          funFact: {
            en: "Technically CFO. Spiritually? CEO, HR, and probably building maintenance too.",
            he: 'טכנית CFO. רוחנית? מנכ"לית, HR, וכנראה גם תחזוקת מבנים.',
          },
        },
        {
          name: "Michal Merjan",
          role: { en: "Office Manager", he: "מנהלת משרד" },
          image: "/assets/team/1764586531367.jpeg",
          nickname: {
            en: "Office Manager & Team Cat Whisperer",
            he: "מנהלת המשרד והלוחשת לחתולים",
          },
          linkedin: "https://www.linkedin.com/in/michal-merjan-996004352/",
          bio: {
            en: "More than just our office manager—Michal is the pulse, the hug, the one who remembers your birthday and your caffeine preference. Her love for cats is legendary, and honestly, we suspect they help her run the place behind the scenes.",
            he: "יותר ממנהלת משרד — מיכל היא הדופק, החיבוק, זו שזוכרת את יום ההולדת שלכם ואת העדפת הקפאין שלכם. האהבה שלה לחתולים היא אגדית, ובכנות, אנחנו חושדים שהם עוזרים לה לנהל את המקום מאחורי הקלעים.",
          },
          funFact: {
            en: "Knows something’s up before you do. It’s kind of spooky, but in a comforting way.",
            he: "יודעת שמשהו קורה לפניכם. זה קצת מפחיד, אבל בצורה מנחמת.",
          },
        },
        {
          name: "Yuval Hefets",
          role: { en: "Data Analyst", he: "מנתח נתונים" },
          image: "/assets/team/1755082475456.jpeg",
          nickname: {
            en: "Turbo #1 (by 17 minutes and proud of it)",
            he: "טורבו מס' 1 (ב-17 דקות וגאה בזה)",
          },
          linkedin: "https://www.linkedin.com/in/yuval-meir-hefetz/",
          bio: {
            en: "The older twin, Yuval brings sharp focus and fresh curiosity into everything he does. Recently diving into data analysis, he's all about finding the hidden patterns behind how people connect. Equal parts thoughtful and turbocharged, he's proof that energy and insight make a powerful combo.",
            he: "התאום הבכור (טכנית, לא מבחינת בגרות), יובל מביא מיקוד חד וסקרנות רעננה לכל מה שהוא עושה. לאחרונה צלל לניתוח נתונים, והוא כולו מציאת התבניות הנסתרות שמאחורי איך שאנשים מתחברים. שילוב של מחשבה וטורבו.",
          },
          funFact: {
            en: "Born 17 minutes before Liad, which he brings up exactly every 17 days.",
            he: "נולד 17 דקות לפני ליעד, מה שהוא מזכיר בדיוק כל 17 ימים.",
          },
        },
        {
          name: "Liad Hefets",
          role: { en: "Marketing Manager", he: "מנהל שיווק" },
          image: "/assets/team/WhatsApp Image 2026-02-24 at 10.14.53.jpeg",
          nickname: {
            en: "Turbo #2 (but definitely the louder one)",
            he: "טורבו מס' 2 (אבל בהחלט היותר רועש)",
          },
          linkedin: "https://www.linkedin.com/in/liad-hefets/",
          bio: {
            en: "If marketing had a hype squad, Liad would lead it. Bold, warm, and always two steps ahead, he's got a gift for opening doors—and conversations. While Yuval dives into data, Liad dives into people. Together, they’re a force. Separately? Still unstoppable.",
            he: "אם לשיווק הייתה יחידת עידוד, ליעד היה מוביל אותה. נועז, חם ותמיד שני צעדים קדימה, יש לו כישרון לפתוח דלתות — ושיחות. בזמן שיובל צולל לנתונים, ליעד צולל לאנשים. יחד הם כוח.",
          },
          funFact: {
            en: "Once pitched HBM to a stranger in an elevator. It wasn’t a short building.",
            he: "פעם הציג את HBM לזר במעלית. זה לא היה בניין קצר.",
          },
        },
        {
          name: "Shon Hazan",
          role: { en: "Head of Business Development", he: "ראש פיתוח עסקי" },
          image: "/assets/team/1757250848728.jpeg",
          imagePosition: "center 20%",
          imageScale: 1.4,
          nickname: { en: "The Connector From the North", he: "המחבר מהצפון" },
          linkedin: "https://www.linkedin.com/in/shon-hazan-8b2046270/",
          bio: {
            en: "Shon came to us from Canada with a smile that feels like a warm welcome and a network that seems to span half the planet. After years in clean energy and international business, he randomly showed up at one of our Friday events and walked out with a job offer from Elad. Since then, he has been our door opener, deal starter, and the person who can turn any conversation into an opportunity.",
            he: "שון הגיע אלינו מקנדה עם חיוך שמרגיש כמו קבלת פנים חמה ורשת קשרים שנראה שמשתרעת על חצי כדור הארץ. אחרי שנים באנרגיה נקייה ועסקים בינלאומיים, הוא הופיע במקרה באחד מאירועי יום השישי שלנו ויצא עם הצעת עבודה מאלעד. מאז, הוא פותח הדלתות שלנו, מתניע עסקאות, והאדם שיכול להפוך כל שיחה להזדמנות.",
          },
          funFact: {
            en: "He got hired before he figured out where the snacks were. Rumor has it he is still not sure how it happened.",
            he: "הוא הועסק לפני שהספיק להבין איפה נמצאים החטיפים. השמועה אומרת שהוא עדיין לא בטוח איך זה קרה.",
          },
        },
      ],
    },
    values: {
      title: { en: "Our Values", he: "הערכים שלנו" },
      groups: [
        {
          bgVideo: `${LEGACY_MEDIA_BASE}/2025/06/0_Blue-Sky_Clouds_1920x1080-1.mp4`,
          items: [
            {
              title: { en: "Generosity", he: "נדיבות" },
              text: {
                en: "Time, attention, care—we give these freely.",
                he: "זמן, תשומת לב, אכפתיות — אנחנו נותנים בחופשיות.",
              },
              image: `${LEGACY_MEDIA_BASE}/2025/06/64b98af75218168718545305b74f140db8fdf320.jpg`,
            },
            {
              title: { en: "Transparency", he: "שקיפות" },
              text: {
                en: "No secrets, no smoke and mirrors.",
                he: "בלי סודות, בלי עשן ומראות.",
              },
              image: `${LEGACY_MEDIA_BASE}/2025/06/add7278ee0a03cd074c76a1e5065f3b8eb071b8d-min.jpg`,
            },
            {
              title: { en: "Positivity", he: "חיוביות" },
              text: {
                en: 'Optimism isn\'t naive— positivity is a big "+"!',
                he: "אופטימיות היא לא נאיבית — חיוביות זה פלוס גדול!",
              },
              image: `${LEGACY_MEDIA_BASE}/2025/06/64b98af75218168718545305b74f140db8fdf320.jpg`,
            },
            {
              title: { en: "Acceptance", he: "קבלה" },
              text: {
                en: "Every story, every person, every feeling is welcome.",
                he: "כל סיפור, כל אדם, כל רגש מוזמן.",
              },
              image: `${LEGACY_MEDIA_BASE}/2025/06/f85d08655c800c423fc2b7c577e95bd8a1541397-min.jpg`,
            },
            {
              title: { en: "Responsibility", he: "אחריות" },
              text: {
                en: "We own our words, our actions, and the space we're shaping.",
                he: "אנחנו אחראים למילים שלנו, לפעולות שלנו, ולמרחב שאנחנו מעצבים.",
              },
              image: `${LEGACY_MEDIA_BASE}/2025/06/df61281a9cb4e8a73b2ea532dd3ea9eaf0754d77-min.jpg`,
            },
          ],
        },
        {
          bgColor: "#bbc0ff",
          items: [
            {
              title: { en: "Balance", he: "איזון" },
              text: {
                en: "Between speaking and listening, giving and receiving.",
                he: "בין דיבור להקשבה, נתינה לקבלה.",
              },
              image: `${LEGACY_MEDIA_BASE}/2025/06/3e9a2f16dffdd7c84f9c8b3050635f8572aa90d2.jpg`,
            },
            {
              title: { en: "Mental Flexibility", he: "גמישות מחשבתית" },
              text: {
                en: "Growth means being open to change.",
                he: "צמיחה זה להיות פתוח לשינוי.",
              },
              image: `${LEGACY_MEDIA_BASE}/2025/06/df61281a9cb4e8a73b2ea532dd3ea9eaf0754d77-min.jpg`,
            },
            {
              title: { en: "Honesty", he: "כנות" },
              text: {
                en: "We say the real thing, even when it's hard.",
                he: "אנחנו אומרים את האמת, גם כשזה קשה.",
              },
              image: `${LEGACY_MEDIA_BASE}/2025/06/fa6fdd033d2e5c63c227f0f5b0e0ed1b966f4f1e.jpg`,
            },
            {
              title: { en: "Compassion", he: "חמלה" },
              text: {
                en: "We show up with warmth, not judgment.",
                he: "אנחנו מגיעים עם חום, לא עם שיפוט.",
              },
              image: `${LEGACY_MEDIA_BASE}/2025/06/c9e281bfd1b044faaa101d5cfd29bf2c896deb94.jpg`,
            },
            {
              title: { en: "Modesty", he: "צניעות" },
              text: {
                en: "We don't pretend to have all the answers.",
                he: "אנחנו לא מתיימרים שיש לנו את כל התשובות.",
              },
              image: `${LEGACY_MEDIA_BASE}/2025/06/df61281a9cb4e8a73b2ea532dd3ea9eaf0754d77-min.jpg`,
            },
          ],
        },
      ],
    },
    closingStatement: {
      en: "We're here to make the world better. Bold? Perhaps… But we truly mean it!\n\nHBM exists to spark real, genuine, human conversations — the kind that can't be swiped past or skipped.\nIf we can make the world better, one 8-minute conversation at a time — we'll take it.",
      he: "אנחנו כאן כדי לעשות את העולם טוב יותר. נועז? אולי… אבל אנחנו באמת מתכוונים לזה!\n\nHBM קיים כדי להצית שיחות אמיתיות, כנות, אנושיות — מהסוג שאי אפשר להחליק מעליו.\nאם אנחנו יכולים לשפר את העולם, שיחה אחת של 8 דקות בכל פעם — אנחנו לוקחים את זה.",
    },
  },

  // ============================================================
  // MEETER (was FAQ)
  // ============================================================
  meeter: {
    title: { en: "The Meeter", he: "The Meeter" },
    subtitle: {
      en: "Everything you need to know about connecting with HBM.",
      he: "כל מה שצריך לדעת על חיבור עם HBM.",
    },
    items: [
      {
        question: {
          en: "What is The HBM and how does it work?",
          he: "מה זה The HBM ואיך זה עובד?",
        },
        answer: {
          en: "The Human Being Movement is a social platform built for real connection. Whether you're in your neighborhood, workplace, or just somewhere on planet Earth, HBM gives you tools to talk, share, and feel a little more connected.",
          he: "תנועת בני האדם היא פלטפורמה חברתית שנבנתה לחיבור אמיתי. בין אם אתם בשכונה, בעבודה, או סתם איפשהו על כדור הארץ.",
        },
      },
      {
        question: {
          en: "Why are conversations limited to 8 minutes?",
          he: "למה שיחות מוגבלות ל-8 דקות?",
        },
        answer: {
          en: "Because 7 minutes is in heaven and 9 is just showing off. Research shows 8 minutes is the sweet spot for genuine connections.",
          he: "כי 7 דקות זה בגן עדן ו-9 זה כבר התחכמות. מחקרים מראים ש-8 דקות זה הנקודה המתוקה לחיבור אמיתי.",
        },
      },
      {
        question: {
          en: "Can I extend a conversation?",
          he: "אפשר להאריך שיחה?",
        },
        answer: {
          en: "We're building it with care. For now: enjoy the mystery.",
          he: "אנחנו בונים את זה בזהירות. בינתיים: תהנו מהמסתורין.",
        },
      },
      {
        question: {
          en: "Do I need to turn on my camera?",
          he: "צריך להדליק מצלמה?",
        },
        answer: {
          en: "Nope. Comfort first. But video helps with connection—a blank screen doesn't smile back.",
          he: "לא. נוחות קודם. אבל וידאו עוזר לחיבור — מסך ריק לא מחייך בחזרה.",
        },
      },
      {
        question: { en: "Are conversations recorded?", he: "השיחות מוקלטות?" },
        answer: {
          en: "No. We use peer-to-peer technology. Your conversation exists only between you and the other person.",
          he: "לא. אנחנו משתמשים בטכנולוגיית peer-to-peer. השיחה קיימת רק ביניכם.",
        },
      },
      {
        question: { en: "Is The HBM free to use?", he: "HBM בחינם?" },
        answer: {
          en: "Free. Zero. Nada! We plan optional Freemium features soon.",
          he: "חינם. אפס. נאדה! אנחנו מתכננים פיצ'רים פרימיום אופציונליים בקרוב.",
        },
      },
      {
        question: {
          en: "Isn't this just another social media?",
          he: "זה לא עוד רשת חברתית?",
        },
        answer: {
          en: "Not even close. HBM is designed for depth, not dopamine.",
          he: "אפילו לא קרוב. HBM מעוצב לעומק, לא לדופמין.",
        },
      },
      {
        question: {
          en: "I'm in. How do I get started?",
          he: "אני בפנים. איך מתחילים?",
        },
        answer: {
          en: "Sign up, and start your first 8 minutes. No pitch, no pressure. Just real connection.",
          he: "הירשמו, והתחילו את 8 הדקות הראשונות שלכם. בלי פיץ', בלי לחץ. רק חיבור אמיתי.",
        },
      },
    ],
  },

  // ============================================================
  // B2B PAGE
  // ============================================================
  b2b: {
    headline: {
      en: "Enter The Meeter Experience.",
      he: "היכנסו לחוויית The Meeter.",
    },
    description: {
      en: "Events bring people together, but HBM offers the platform that actually connects them. We create a clear invitation to connect, removing fear, hesitation, and the anxiety of the first move.",
      he: "אירועים מפגישים אנשים, אבל HBM מציע את הפלטפורמה שבאמת מחברת אותם. אנחנו יוצרים הזמנה ברורה להתחבר, מסירים פחד, היסוס ואת החרדה מהצעד הראשון.",
    },
    tabs: [
      {
        label: { en: "Companies and Businesses", he: "חברות ועסקים" },
        bgVideo: `${LEGACY_MEDIA_BASE}/2025/06/scene-theme-companies-businessesa.mp4`,
        cards: [
          {
            title: {
              en: "Break the routine with 8-minute sessions",
              he: "שברו את השגרה עם מפגשים של 8 דקות",
            },
            text: {
              en: "A simple way for employees to create new connections, building trust and belonging.",
              he: "דרך פשוטה לעובדים ליצור קשרים חדשים, לבנות אמון ושייכות.",
            },
          },
          {
            title: {
              en: "Stronger connections lead to stronger teams.",
              he: "חיבורים חזקים יותר מובילים לצוותים חזקים יותר.",
            },
            text: {
              en: "When people feel seen and included, collaboration improves.",
              he: "כשאנשים מרגישים שרואים אותם ומכלילים אותם, שיתוף הפעולה משתפר.",
            },
          },
          {
            title: {
              en: "HBM becomes your company's social heartbeat.",
              he: "HBM הופך לדופק החברתי של החברה שלכם.",
            },
            text: {
              en: "A central place for HR to spark connection and nurture culture.",
              he: "מקום מרכזי ל-HR להצית חיבור ולטפח תרבות.",
            },
          },
        ],
      },
      {
        label: { en: "Shared Workspaces", he: "חללי עבודה משותפים" },
        bgVideo: `${LEGACY_MEDIA_BASE}/2025/07/20250703_1555_Heartfelt-Office-Conversation_simple_compose_01jz85pbtyee3v7wkazg6vqgr1.mp4`,
        cards: [
          {
            title: {
              en: "Break the routine with 8-minute sessions",
              he: "שברו את השגרה עם מפגשים של 8 דקות",
            },
            text: {
              en: "Building trust and belonging in shared spaces.",
              he: "בניית אמון ושייכות בחללים משותפים.",
            },
          },
          {
            title: {
              en: "Stronger connections lead to stronger teams",
              he: "חיבורים חזקים מובילים לצוותים חזקים",
            },
            text: {
              en: "Collaboration improves when people feel included.",
              he: "שיתוף פעולה משתפר כשאנשים מרגישים מוכלים.",
            },
          },
          {
            title: {
              en: "HBM becomes your space's social heartbeat",
              he: "HBM הופך לדופק החברתי של המרחב שלכם",
            },
            text: {
              en: "Spark connection, share updates, nurture culture.",
              he: "הציתו חיבור, שתפו עדכונים, טפחו תרבות.",
            },
          },
        ],
      },
      {
        label: { en: "Communities and Organizations", he: "קהילות וארגונים" },
        bgVideo: `${LEGACY_MEDIA_BASE}/2025/06/vision-video.mp4`,
        cards: [
          {
            title: {
              en: "From members to meaningful connections.",
              he: "מחברים ליחסים משמעותיים.",
            },
            text: {
              en: "Move beyond 1-way communication into real conversations.",
              he: "עברו מתקשורת חד-כיוונית לשיחות אמיתיות.",
            },
          },
          {
            title: {
              en: "Build trust, not just attendance.",
              he: "בנו אמון, לא רק נוכחות.",
            },
            text: {
              en: "Members get to know each other, not just the group name.",
              he: "חברים מכירים אחד את השני, לא רק את שם הקבוצה.",
            },
          },
          {
            title: {
              en: "Everything in one place, built for belonging.",
              he: "הכל במקום אחד, בנוי לשייכות.",
            },
            text: {
              en: "All in a branded space your members actually want to visit.",
              he: "הכל במרחב ממותג שהחברים שלכם באמת רוצים לבקר בו.",
            },
          },
        ],
      },
    ],
    // Admin flow for events
    adminFlow: {
      title: {
        en: "How It Works for Event Managers",
        he: "איך זה עובד למנהלי אירועים",
      },
      subtitle: {
        en: "As an admin, you create and manage the entire experience.",
        he: "כאדמין, אתם יוצרים ומנהלים את כל החוויה.",
      },
      steps: [
        {
          title: { en: "Create an Event", he: "צרו אירוע" },
          text: {
            en: "Set up your event in minutes with our admin dashboard.",
            he: "הקימו אירוע בדקות עם לוח הבקרה שלנו.",
          },
          image: `${LEGACY_MEDIA_BASE}/2025/06/11.png`,
        },
        {
          title: { en: "Send the Link", he: "שלחו את הקישור" },
          text: {
            en: "Share the invitation with all participants.",
            he: "שתפו את ההזמנה עם כל המשתתפים.",
          },
          image: `${LEGACY_MEDIA_BASE}/2025/06/22.png`,
        },
        {
          title: { en: "Run the Event", he: "הריצו את האירוע" },
          text: {
            en: "Watch the magic happen as people connect.",
            he: "צפו בקסם כשאנשים מתחברים.",
          },
          image: `${LEGACY_MEDIA_BASE}/2025/06/33.png`,
        },
        {
          title: { en: "Get the Data", he: "קבלו נתונים" },
          text: {
            en: "Receive insights and analytics from the event.",
            he: "קבלו תובנות ואנליטיקות מהאירוע.",
          },
          image: `${LEGACY_MEDIA_BASE}/2025/06/44.png`,
        },
      ],
    },
    thriveStatement: {
      bigTitle: {
        en: "When people thrive, business follows.",
        he: "כשאנשים משגשגים, העסק עוקב.",
      },
      smallTitle: {
        en: "Tailored to your goals, your identity, and your community.",
        he: "מותאם למטרות שלכם, לזהות שלכם, ולקהילה שלכם.",
      },
    },
    steps: {
      title: { en: "How will this help you?", he: "איך זה יעזור לכם?" },
      subtitle: { en: "See what awaits you", he: "ראו מה מחכה לכם" },
      items: [
        {
          image: `${LEGACY_MEDIA_BASE}/2025/06/22.png`,
          title: {
            en: "A branded platform that feels like yours",
            he: "פלטפורמה ממותגת שמרגישה שלכם",
          },
          text: {
            en: "White-label space tailored to your identity.",
            he: "מרחב white-label מותאם לזהות שלכם.",
          },
        },
        {
          image: `${LEGACY_MEDIA_BASE}/2025/06/44.png`,
          title: {
            en: "Tools that make managing easy",
            he: "כלים שמקלים על הניהול",
          },
          text: {
            en: "Update content, view members, manage engagement.",
            he: "עדכנו תוכן, צפו בחברים, נהלו מעורבות.",
          },
        },
        {
          image: `${LEGACY_MEDIA_BASE}/2025/06/22.png`,
          title: {
            en: "Hands-on support from our team",
            he: "תמיכה צמודה מהצוות שלנו",
          },
          text: {
            en: "From setup to strategy, we're here to help.",
            he: "מהקמה ועד אסטרטגיה, אנחנו כאן לעזור.",
          },
        },
        {
          image: `${LEGACY_MEDIA_BASE}/2025/06/11.png`,
          title: {
            en: "A foundation for future collaboration",
            he: "בסיס לשיתוף פעולה עתידי",
          },
          text: {
            en: "From workshops to custom events, let's co-create.",
            he: "מסדנאות ועד אירועים מותאמים, בואו ניצור ביחד.",
          },
        },
      ],
      phoneMockup: `${LEGACY_MEDIA_BASE}/2025/05/Settings-3.png`,
    },
    cta: {
      title: { en: "You don't need more tools", he: "אתם לא צריכים עוד כלים" },
      subtitle: { en: "You need the right one!", he: "אתם צריכים את הנכון!" },
      ctaText: { en: "Let's talk", he: "בואו נדבר" },
    },
  },

  // ============================================================
  // EVENTS PAGE
  // ============================================================
  events: {
    title: { en: "Events", he: "אירועים" },
    subtitle: {
      en: "Join our community events and experience real connections",
      he: "הצטרפו לאירועי הקהילה שלנו וחוו חיבורים אמיתיים",
    },
    upcoming: [
      {
        id: "emotion-mastery-apr-2026",
        title: {
          en: "Emotion Mastery for Stronger Connection",
          he: "שליטה רגשית לחיבור חזק יותר",
        },
        description: {
          en: "Emotional control strengthens communication and connections.",
          he: "שליטה רגשית מחזקת תקשורת וחיבורים.",
        },
        date: "2026-04-14",
        type: "#Offline",
        location: { en: "TBD", he: "יעודכן" },
        coverImage: "",
        registerUrl: "#",
        gallery: [],
      },
      {
        id: "building-bridges-apr-2026",
        title: {
          en: "Building Bridges: The Art of Social Connection",
          he: "בניית גשרים: אמנות החיבור החברתי",
        },
        description: {
          en: "Strong relationships need trust, communication, and real engagement.",
          he: "מערכות יחסים חזקות דורשות אמון, תקשורת ומעורבות אמיתית.",
        },
        date: "2026-04-14",
        type: "#Offline",
        location: { en: "TBD", he: "יעודכן" },
        coverImage: "",
        registerUrl: "#",
        gallery: [],
      },
      {
        id: "power-of-listening-apr-2026",
        title: {
          en: "The Power of Listening: Connecting Beyond Words",
          he: "כוח ההקשבה: חיבור מעבר למילים",
        },
        description: {
          en: "Listening builds understanding, empathy, and meaningful connections.",
          he: "הקשבה בונה הבנה, אמפתיה, וחיבורים משמעותיים.",
        },
        date: "2026-04-14",
        type: "#Offline",
        location: { en: "TBD", he: "יעודכן" },
        coverImage: "",
        registerUrl: "#",
        gallery: [],
      },
    ],
    past: [
      {
        id: "mixer-jan-2026",
        title: {
          en: "Friday Connections @ MIXER Work & Lounge",
          he: "חיבורי שישי @ MIXER Work & Lounge",
        },
        description: {
          en: "Our first event at MIXER in Herzliya. An amazing evening of real connections.",
          he: "האירוע הראשון שלנו ב-MIXER בהרצליה. ערב מדהים של חיבורים אמיתיים.",
        },
        date: "2026-01-19",
        type: "#Offline",
        location: {
          en: "MIXER Work & Lounge, Herzliya",
          he: "MIXER Work & Lounge, הרצליה",
        },
        coverImage: "",
        gallery: [],
      },
      {
        id: "connections-evening-dec-2025",
        title: { en: "Connections Evening", he: "ערב חיבורים" },
        description: {
          en: "A special evening dedicated to meaningful one-on-one conversations.",
          he: "ערב מיוחד המוקדש לשיחות משמעותיות אחד על אחד.",
        },
        date: "2025-12-15",
        type: "#Offline",
        location: { en: "Tel Aviv", he: "תל אביב" },
        coverImage: "",
        gallery: [],
      },
      {
        id: "this-moment-nov-2025",
        title: {
          en: "This Moment, A New Perspective",
          he: "הרגע הזה, פרספקטיבה חדשה",
        },
        description: {
          en: "Exploring how a single moment of connection can shift your entire perspective.",
          he: "חוקרים איך רגע אחד של חיבור יכול לשנות את כל הפרספקטיבה.",
        },
        date: "2025-11-20",
        type: "#Offline",
        location: { en: "Ra'anana", he: "רעננה" },
        coverImage: "",
        gallery: [],
      },
    ],
  },

  // ============================================================
  // GALLERY PAGE - PLACEHOLDER
  // ============================================================
  gallery: {
    title: { en: "Gallery", he: "גלריה" },
    subtitle: {
      en: "Moments from our recent events",
      he: "רגעים מהאירועים האחרונים שלנו",
    },
    // PLACEHOLDER: Add event photos when ready
    images: [
      // { src: 'URL', alt: 'Event description', date: '2026-01-10' },
    ],
  },

  // ============================================================
  // CONTACT PAGE
  // ============================================================
  contact: {
    title: {
      en: "Contact Us",
      he: "צרו קשר",
      es: "Contáctanos",
      fr: "Contactez-nous",
      de: "Kontakt",
      ar: "اتصل بنا",
    },
    subtitle: {
      en: "We'd love to hear from you",
      he: "נשמח לשמוע מכם",
      es: "Nos encantaría saber de ti",
      fr: "Nous serions ravis de vous entendre",
      de: "Wir freuen uns von euch zu hören",
      ar: "يسعدنا الاستماع إليك",
    },
    whatsappText: {
      en: "Message us on WhatsApp",
      he: "שלחו לנו הודעה בוואטסאפ",
      es: "Escríbenos por WhatsApp",
      fr: "Écrivez-nous sur WhatsApp",
      de: "Schreib uns auf WhatsApp",
      ar: "راسلنا على واتساب",
    },
    emailText: {
      en: "Email us",
      he: "שלחו לנו מייל",
      es: "Envíanos un correo",
      fr: "Envoyez-nous un e-mail",
      de: "Schreib uns eine E-Mail",
      ar: "راسلنا بالبريد الإلكتروني",
    },
    formLabels: {
      name: {
        en: "Name",
        he: "שם",
        es: "Nombre",
        fr: "Nom",
        de: "Name",
        ar: "الاسم",
      },
      email: {
        en: "Email",
        he: "אימייל",
        es: "Correo electrónico",
        fr: "E-mail",
        de: "E-Mail",
        ar: "البريد الإلكتروني",
      },
      message: {
        en: "Message",
        he: "הודעה",
        es: "Mensaje",
        fr: "Message",
        de: "Nachricht",
        ar: "الرسالة",
      },
      send: {
        en: "Send Message",
        he: "שלחו הודעה",
        es: "Enviar mensaje",
        fr: "Envoyer le message",
        de: "Nachricht senden",
        ar: "إرسال الرسالة",
      },
      type: {
        en: "What describes you best?",
        he: "מה מתאר אתכם הכי טוב?",
        es: "¿Qué te describe mejor?",
        fr: "Qu’est-ce qui vous décrit le mieux ?",
        de: "Was beschreibt dich am besten?",
        ar: "ما الذي يصفك بشكل أفضل؟",
      },
      typeOptions: [
        {
          en: "Hotel",
          he: "מלון",
          es: "Hotel",
          fr: "Hôtel",
          de: "Hotel",
          ar: "فندق",
        },
        {
          en: "Company",
          he: "חברה",
          es: "Empresa",
          fr: "Entreprise",
          de: "Unternehmen",
          ar: "شركة",
        },
        {
          en: "Non-profit",
          he: "עמותה",
          es: "Sin fines de lucro",
          fr: "Association",
          de: "Gemeinnützig",
          ar: "منظمة غير ربحية",
        },
        {
          en: "University",
          he: "אוניברסיטה",
          es: "Universidad",
          fr: "Université",
          de: "Universität",
          ar: "جامعة",
        },
        {
          en: "Community",
          he: "קהילה",
          es: "Comunidad",
          fr: "Communauté",
          de: "Gemeinschaft",
          ar: "مجتمع",
        },
        {
          en: "Other",
          he: "אחר",
          es: "Otro",
          fr: "Autre",
          de: "Sonstiges",
          ar: "آخرى",
        },
      ],
    },
  },
};

export default siteContent;
