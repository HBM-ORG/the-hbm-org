/**
 * Professional Gallery Management (The 1% Method)
 * Instead of hardcoding arrays everywhere, we manage all event assets here.
 */

export const GALLERIES_DATA = [
  {
    id: "community-night-2026",
    title: { en: "HBM Community Night", he: "ערב קהילת HBM" },
    folder: "/assets/events/community",
    images: [
      "img1.jpg", "img2.jpg", "img3.jpg", "img4.jpg", "img5.jpg", "img6.jpg"
    ],
    description: { 
      en: "An unforgettable night of connection and stories.", 
      he: "ערב בלתי נשכח של חיבור וסיפורים." 
    }
  },
  {
    id: "tech-connections-2025",
    title: { en: "Tech & Networking", he: "טכנולוגיה ונטוורקינג" },
    folder: "/assets/events/tech",
    images: [
      "tech1.jpg", "tech2.jpg", "tech3.jpg"
    ],
    description: { 
      en: "Connecting the innovators of tomorrow.", 
      he: "מחברים את החדשנים של המחר." 
    }
  }
  // Add more events here as they happen
];

/**
 * Helper to get gallery by event ID or slug
 */
export const getGalleryForEvent = (eventId) => {
  return GALLERIES_DATA.find(g => g.id === eventId);
};
