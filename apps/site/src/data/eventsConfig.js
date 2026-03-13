// ==================================================================================
// EVENT MANAGEMENT ENGINE - CONFIGURATION FILE
// ==================================================================================
//
// HOW TO USE THIS FILE:
// 1. To add a new event, copy one of the "Event Block" templates below.
// 2. Paste it at the TOP of the relevant section (Future or Past).
// 3. Update the fields as described.
// 4. IMPORTANT: Do NOT change the variable name `eventsConfig`.
// 5. Dates MUST be in YYYY-MM-DD format (e.g., '2026-03-21').
//
// ==================================================================================

export const eventsConfig = [
  {
    "id": "next-1",
    "title": {
      "en": "The HBM Community Night",
      "he": "אירוע הקהילה של HBM"
    },
    "date": "2026-03-24T19:00",
    "description": {
      "en": "Join us for meaningful 8-minute conversations that create lasting bonds.",
      "he": "הצטרפו אלינו לשיחות משמעותיות בנות 8 דקות שיוצרות קשרים מתמשכים."
    },
    "location": "Raanana",
    "locationParams": {
      "addressText": "Dolev 4, Raanana",
      "googleMapsEmbedUrl": "<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3376.1397762227984!2d34.883918923593654!3d32.20046407390997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d39533fcfa2f7%3A0xa1c863c1f34dd66e!2z15PXldec15EgNCwg16jXoteg16DXlA!5e0!3m2!1siw!2sil!4v1771946116433!5m2!1siw!2sil\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>"
    },
    "type": "Face to Face",
    "image": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
    "registration": {
      "status": "open",
      "externalUrl": "/events/register",
      "whatsappLink": "https://wa.me/1234567890"
    },
    "promoBubbles": [
      { "title": { "en": "8-Minute Rounds", "he": "סבבים של 8 דקות" }, "desc": { "en": "Perfect timing.", "he": "הזמן המדויק לחיבור עמוק." } },
      { "title": { "en": "Curated Matches", "he": "שידוכים מדויקים" }, "desc": { "en": "Quality over quantity.", "he": "איכות לפני כמות." } },
      { "title": { "en": "Intimate Atmosphere", "he": "אווירה אינטימית" }, "desc": { "en": "Small and focused.", "he": "קבוצה קטנה וממוקדת." } }
    ],
    "whatToExpect": {
      "boldTitle": { "en": "A night of meaningful connections.", "he": "לילה של חיבורים משמעותיים." },
      "points": [
          { "title": { "en": "Ice-Breaking", "he": "שבירת קרח" }, "desc": { "en": "We start with soft interactions.", "he": "מתחילים באינטראקציות רכות ונעימות." } },
          { "title": { "en": "Deep Conversations", "he": "שיחות עומק" }, "desc": { "en": "3 rounds of 8 minutes each.", "he": "3 סבבים של 8 דקות כל אחד." } },
          { "title": { "en": "Open Networking", "he": "נטוורקינג חופשי" }, "desc": { "en": "Finish with a drink and a chat.", "he": "מסיימים עם דרינק ושיחה חופשית." } }
      ]
    },
    "showPartnership": false,
    "partnership": {
        "title": { "en": "In Collaboration with MIXER", "he": "בשיתוף פעולה עם MIXER" },
        "text": { "en": "We are excited to host this event at the beautiful MIXER Campus.", "he": "אנחנו נרגשים לארח את האירוע בקמפוס המעוצב של מיקסר." },
        "link": "https://mixer.work"
    },
    "freeText": { "en": "Additional details about the event will be sent to registered guests.", "he": "פרטים נוספים לגבי האירוע יישלחו לנרשמים במייל ובסמס." },
    "imageBubbles": [
      { "title": { "en": "The Space", "he": "החלל שלנו" }, "image": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop" },
      { "title": { "en": "The People", "he": "האנשים" }, "image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop" },
      { "title": { "en": "The Vibe", "he": "האווירה" }, "image": "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop" }
    ],
    "socialProof": {
      "capacity": 50,
      "attendingCount": 32
    },
    "tags": [
      "#Offline",
      "#Networking"
    ],
    "highlights": [
      {
        "title": "8-Minute Rounds",
        "description": "Perfect timing to go deep without getting stuck.",
        "icon": "Clock"
      }
    ],
    "partners": [
      {
        "name": "MIXER",
        "logo": "",
        "website": "https://mixer.work"
      }
    ],
    "faqs": [
      {
        "question": "Do I need to prepare anything?",
        "answer": "Just bring yourself and an open mind."
      },
      {
        "question": "What is the dress code?",
        "answer": "Smart casual. Be comfortable."
      }
    ],
    "hostNote": {
      "message": "Can't wait to see you there!",
      "author": "The HBM Team",
      "avatar": ""
    },
    "folderName": "march-26",
    "imageCount": 1,
    "visuals": {
      "brightness": 70,
      "blur": 0,
      "videoScale": 1,
      "overlayOpacity": 30
    }
  },
  {
    "id": "march-27",
    "title": {
      "en": "The HBM Community Night",
      "he": "אירוע הקהילה של HBM"
    },
    "date": "2026-03-27T19:00",
    "description": {
      "en": "Join us for meaningful 8-minute conversations that create lasting bonds.",
      "he": "הצטרפו אלינו לשיחות משמעותיות בנות 8 דקות שיוצרות קשרים מתמשכים."
    },
    "location": "Raanana",
    "locationParams": {
      "addressText": "Dolev 4, Raanana",
      "googleMapsEmbedUrl": "<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3376.1397762227984!2d34.883918923593654!3d32.20046407390997!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x151d39533fcfa2f7%3A0xa1c863c1f34dd66e!2z15PXldec15EgNCwg16jXoteg16DXlA!5e0!3m2!1siw!2sil!4v1771946116433!5m2!1siw!2sil\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>"
    },
    "type": "Face to Face",
    "image": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
    "registration": {
      "status": "open",
      "externalUrl": "/events/register",
      "whatsappLink": "https://wa.me/972587073136"
    },
    "promoBubbles": [
      { "title": { "en": "8-Minute Rounds", "he": "סבבים של 8 דקות" }, "desc": { "en": "Perfect timing.", "he": "הזמן המדויק לחיבור עמוק." } },
      { "title": { "en": "Curated Matches", "he": "שידוכים מדויקים" }, "desc": { "en": "Quality over quantity.", "he": "איכות לפני כמות." } },
      { "title": { "en": "Intimate Atmosphere", "he": "אווירה אינטימית" }, "desc": { "en": "Small and focused.", "he": "קבוצה קטנה וממוקדת." } }
    ],
    "whatToExpect": {
      "boldTitle": { "en": "A night of meaningful connections.", "he": "לילה של חיבורים משמעותיים." },
      "points": [
          { "title": { "en": "Ice-Breaking", "he": "שבירת קרח" }, "desc": { "en": "We start with soft interactions.", "he": "מתחילים באינטראקציות רכות ונעימות." } },
          { "title": { "en": "Deep Conversations", "he": "שיחות עומק" }, "desc": { "en": "3 rounds of 8 minutes each.", "he": "3 סבבים של 8 דקות כל אחד." } },
          { "title": { "en": "Open Networking", "he": "נטוורקינג חופשי" }, "desc": { "en": "Finish with a drink and a chat.", "he": "מסיימים עם דרינק ושיחה חופשית." } }
      ]
    },
    "showPartnership": false,
    "partnership": {
        "title": { "en": "In Collaboration with MIXER", "he": "בשיתוף פעולה עם MIXER" },
        "text": { "en": "We are excited to host this event at the beautiful MIXER Campus.", "he": "אנחנו נרגשים לארח את האירוע בקמפוס המעוצב של מיקסר." },
        "link": "https://mixer.work"
    },
    "freeText": { "en": "Additional details about the event will be sent to registered guests.", "he": "פרטים נוספים לגבי האירוע יישלחו לנרשמים במייל ובסמס." },
    "imageBubbles": [
      { "title": { "en": "The Space", "he": "החלל שלנו" }, "image": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop" },
      { "title": { "en": "The People", "he": "האנשים" }, "image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop" },
      { "title": { "en": "The Vibe", "he": "האווירה" }, "image": "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop" }
    ],
    "socialProof": { "capacity": 50, "attendingCount": 32 },
    "tags": ["#Offline", "#Networking"],
    "highlights": [{ "title": "8-Minute Rounds", "description": "Perfect timing to go deep without getting stuck.", "icon": "Clock" }],
    "partners": [{ "name": "MIXER", "logo": "", "website": "https://mixer.work" }],
    "faqs": [
      { "question": "Do I need to prepare anything?", "answer": "Just bring yourself and an open mind." },
      { "question": "What is the dress code?", "answer": "Smart casual. Be comfortable." }
    ],
    "hostNote": { "message": "Can't wait to see you there!", "author": "The HBM Team", "avatar": "" },
    "folderName": "march-27",
    "imageCount": 3,
    "visuals": { "brightness": 70, "blur": 0, "videoScale": 1, "overlayOpacity": 30 }
  },
  {
    "id": 16,
    "title": {
      "en": "Copy of Love & Connection"
    },
    "date": "2026-02-17",
    "description": "Celebrating human connection in all its forms.",
    "type": "Face to Face",
    "location": "Jerusalem Center",
    "image": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
    "gallery": [
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop"
    ],
    "participants": 52,
    "locationParams": {
      "addressText": "Jerusalem Center, King George St 22",
      "googleMapsEmbedUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13559.8860555987!2d35.21371!3d31.77667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDQ2JzM2LjAiTiAzNcKwMTInNDkuNCJF!5e0!3m2!1sen!2sil!4v1625647823456!5m2!1sen!2sil"
    },
    "registration": {
      "status": "open",
      "externalUrl": "/events/register-love",
      "whatsappLink": "https://wa.me/972501234567"
    },
    "socialProof": {
      "capacity": 80,
      "attendingCount": 52
    },
    "highlights": [
      {
        "title": "Deep Listening",
        "description": "Guidelines on how to truly hear others.",
        "icon": "MessageCircle"
      },
      {
        "title": "Heart-Centered Pairs",
        "description": "Curated dyad matched for deep connection.",
        "icon": "Users"
      },
      {
        "title": "Live Music",
        "description": "Acoustic vibes to set the mood.",
        "icon": "Star"
      }
    ],
    "partners": [
      {
        "name": "Jerusalem Soul",
        "logo": "",
        "website": ""
      },
      {
        "name": "The Love Lab",
        "logo": "",
        "website": ""
      }
    ],
    "faqs": [
      {
        "question": "Is this a dating event?",
        "answer": "It's about human connection first, but romance often blooms!"
      },
      {
        "question": "Is food provided?",
        "answer": "Light refreshments and wine will be served."
      }
    ],
    "hostNote": {
      "message": "Let's open our hearts together.",
      "author": "Sarah from HBM",
      "avatar": ""
    },
    "status": "draft",
    "heroStyle": {
      "overlayOpacity": 16,
      "brightness": 73
    },
    "imageCount": 0
  },
  {
    "id": 14,
    "title": {
      "0": "L",
      "1": "o",
      "2": "v",
      "3": "e",
      "4": " ",
      "5": "&",
      "6": " ",
      "7": "C",
      "8": "o",
      "9": "n",
      "10": "n",
      "11": "e",
      "12": "c",
      "13": "t",
      "14": "i",
      "15": "o",
      "16": "n",
      "en": "Love & Connection66"
    },
    "date": "2026-02-17",
    "description": "Celebrating human connection in all its forms.",
    "type": "Face to Face",
    "location": "Jerusalem Center",
    "image": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
    "gallery": [
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop"
    ],
    "participants": 52,
    "locationParams": {
      "addressText": "Jerusalem Center, King George St 22",
      "googleMapsEmbedUrl": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d13559.<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3022.1!2d-73.98!3d40.75!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%8860555987!2d35.21371!3d31.77667!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMzHCsDQ2JzM2LjAiTiAzNcKwMTInNDkuNCJF!5e0!3m2!1sen!2sil!4v1625647823456!5m2!1sen!2sil"
    },
    "registration": {
      "status": "open",
      "externalUrl": "/events/register-love",
      "whatsappLink": "https://wa.me/972501234567"
    },
    "socialProof": {
      "capacity": 80,
      "attendingCount": 52
    },
    "highlights": [
      {
        "title": "Deep Listening",
        "description": "Guidelines on how to truly hear others.",
        "icon": "MessageCircle"
      },
      {
        "title": "Heart-Centered Pairs",
        "description": "Curated dyad matched for deep connection.",
        "icon": "Users"
      },
      {
        "title": "Live Music",
        "description": "Acoustic vibes to set the mood.",
        "icon": "Star"
      }
    ],
    "partners": [
      {
        "name": "Jerusalem Soul",
        "logo": "",
        "website": ""
      },
      {
        "name": "The Love Lab",
        "logo": "",
        "website": ""
      }
    ],
    "faqs": [
      {
        "question": "Is this a dating event?",
        "answer": "It's about human connection first, but romance often blooms!"
      },
      {
        "question": "Is food provided?",
        "answer": "Light refreshments and wine will be served."
      }
    ],
    "hostNote": {
      "message": "Let's open our hearts together.",
      "author": "Sarah from HBM",
      "avatar": ""
    },
    "imageCount": 0,
    "folderName": "event-14-1771493558757",
    "visuals": {
      "videoScale": 1.8
    }
  },
  {
    "id": 13,
    "title": {
      "0": "N",
      "1": "e",
      "2": "w",
      "3": " ",
      "4": "B",
      "5": "e",
      "6": "g",
      "7": "i",
      "8": "n",
      "9": "n",
      "10": "i",
      "11": "n",
      "12": "g",
      "13": "s",
      "en": "סוף חודש ינואר "
    },
    "date": "2026-01-20",
    "description": {
      "0": "S",
      "1": "t",
      "2": "a",
      "3": "r",
      "4": "t",
      "5": " ",
      "6": "2",
      "7": "0",
      "8": "2",
      "9": "6",
      "10": " ",
      "11": "w",
      "12": "i",
      "13": "t",
      "14": "h",
      "15": " ",
      "16": "m",
      "17": "e",
      "18": "a",
      "19": "n",
      "20": "i",
      "21": "n",
      "22": "g",
      "23": "f",
      "24": "u",
      "25": "l",
      "26": " ",
      "27": "c",
      "28": "o",
      "29": "n",
      "30": "n",
      "31": "e",
      "32": "c",
      "33": "t",
      "34": "i",
      "35": "o",
      "36": "n",
      "37": "s",
      "38": " ",
      "39": "a",
      "40": "n",
      "41": "d",
      "42": " ",
      "43": "e",
      "44": "x",
      "45": "c",
      "46": "i",
      "47": "t",
      "48": "i",
      "49": "n",
      "50": "g",
      "51": " ",
      "52": "p",
      "53": "o",
      "54": "s",
      "55": "s",
      "56": "i",
      "57": "b",
      "58": "i",
      "59": "l",
      "60": "i",
      "61": "t",
      "62": "i",
      "63": "e",
      "64": "s",
      "65": ".",
      "en": "Start 2026 with meaningful connections and exciting possibilities. שלום שלום "
    },
    "type": "Face to Face",
    "location": "Tel Aviv Hub",
    "image": "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop",
    "gallery": [
      "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop"
    ],
    "participants": 48
  },
  {
    "id": 17,
    "title": {
      "en": "New Event",
      "he": "אירוע חדש"
    },
    "date": "2026-01-01",
    "location": "TBD",
    "description": {
      "en": "Description here...",
      "he": "תיאור כאן..."
    },
    "image": "",
    "folderName": "event-1771494140494",
    "imageCount": 0,
    "registrationLink": "",
    "gallery": [],
    "participants": 0,
    "tags": [],
    "status": "draft",
    "heroVideo": "",
    "partners": [
      {
        "name": "New PartnerTest Partner",
        "logo": "",
        "link": ""
      }
    ],
    "faqs": [],
    "highlights": [],
    "socialProof": {
      "capacity": 50,
      "attendingCount": 0
    },
    "hostNote": {
      "message": "",
      "author": "The HBM Team"
    },
    "locationParams": {
      "addressText": "",
      "googleMapsEmbedUrl": ""
    },
    "registration": {
      "status": "open",
      "externalUrl": "",
      "whatsappLink": ""
    },
    "visuals": {
      "brightness": 100,
      "blur": 0,
      "videoScale": 1
    }
  },
  {
    "id": 12,
    "title": "Celebration",
    "date": "2025-12-19",
    "description": "Honoring a year of connection and community.",
    "type": "Face to Face",
    "location": "Jerusalem Center",
    "image": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
    "participants": 58,
    "gallery": [
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop"
    ]
  },
  {
    "id": 11,
    "title": "Reflection",
    "date": "2025-11-21",
    "description": "Looking back to move forward with intention.",
    "type": "Face to Face",
    "location": "Tel Aviv Hub",
    "image": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop",
    "participants": 46,
    "gallery": [
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop"
    ]
  },
  {
    "id": 10,
    "title": "Growth",
    "date": "2025-10-17",
    "description": "Evolving together through shared experiences.",
    "type": "Face to Face",
    "location": "Haifa Community Space",
    "image": "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
    "participants": 51,
    "gallery": [
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop"
    ]
  },
  {
    "id": 9,
    "title": "Vulnerability",
    "date": "2025-09-19",
    "description": "The courage to be open and authentic with others.",
    "type": "Face to Face",
    "location": "Jerusalem Center",
    "image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
    "participants": 49,
    "gallery": [
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop"
    ]
  },
  {
    "id": 8,
    "title": "Trust",
    "date": "2025-08-15",
    "description": "Building foundations of trust in our community.",
    "type": "Face to Face",
    "location": "Tel Aviv Hub",
    "image": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
    "participants": 43,
    "gallery": [
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop"
    ]
  },
  {
    "id": 7,
    "title": "Self-Actualization",
    "date": "2025-07-18",
    "description": "Becoming the best version of yourself through connection.",
    "type": "Face to Face",
    "location": "Haifa Community Space",
    "image": "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop",
    "participants": 55,
    "gallery": [
      "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop"
    ]
  },
  {
    "id": 6,
    "title": "Habits",
    "date": "2025-06-20",
    "description": "Building better routines for meaningful relationships.",
    "type": "Face to Face",
    "location": "Jerusalem Center",
    "image": "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
    "participants": 47,
    "gallery": [
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop"
    ]
  },
  {
    "id": 5,
    "title": "Gratitude",
    "date": "2025-05-16",
    "description": "Celebrating appreciation and the power of thankfulness.",
    "type": "Face to Face",
    "location": "Tel Aviv Hub",
    "image": "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop",
    "participants": 41,
    "gallery": [
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop"
    ]
  },
  {
    "id": 4,
    "title": "No Meeting",
    "date": "2025-04-14",
    "description": "Sometimes the best connection is reconnecting with yourself.",
    "type": "Face to Face",
    "location": "Everywhere",
    "image": "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop",
    "participants": 0,
    "isSkipped": true,
    "gallery": []
  },
  {
    "id": 3,
    "title": "Belonging",
    "date": "2025-03-18",
    "description": "Finding your tribe and creating lasting bonds.",
    "type": "Face to Face",
    "location": "Haifa Community Space",
    "image": "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
    "participants": 52,
    "gallery": [
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop"
    ]
  },
  {
    "id": 2,
    "title": "Why?",
    "date": "2025-02-12",
    "description": "Exploring the deeper reasons behind meaningful connections.",
    "type": "Face to Face",
    "location": "Jerusalem Center",
    "image": "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
    "participants": 38,
    "gallery": [
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop"
    ]
  },
  {
    "id": 1,
    "title": "Beginning/Start",
    "date": "2025-01-15",
    "description": "Kicking off the year with new connections and fresh perspectives.",
    "type": "Face to Face",
    "location": "Tel Aviv Hub",
    "image": "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
    "participants": 45,
    "gallery": [
      "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1543269865-cbf427effbad?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1528605105345-5344ea20e269?w=800&h=600&fit=crop"
    ]
  }
];
