import { eventsConfig } from '../data/eventsConfig';

// Helper to parse date string (YYYY-MM-DD)
const parseDate = (dateStr) => new Date(dateStr);

// Helper to get today's date at midnight for comparison
const getToday = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return today;
};

/**
 * Returns all upcoming events (including today), sorted by closest date first.
 */
export const getUpcomingEvents = () => {
    const today = getToday();
    return eventsConfig
        .filter(event => parseDate(event.date) >= today)
        .sort((a, b) => parseDate(a.date) - parseDate(b.date));
};

/**
 * Returns the single next upcoming event.
 * If no future events exist, returns null.
 */
export const getNextEvent = () => {
    const upcoming = getUpcomingEvents();
    return upcoming.length > 0 ? upcoming[0] : null;
};

/**
 * Returns all past events, sorted by most recent first.
 */
export const getPastEvents = () => {
    const today = getToday();
    return eventsConfig
        .filter(event => parseDate(event.date) < today)
        .sort((a, b) => parseDate(b.date) - parseDate(a.date)); // Newest first
};

/**
 * Groups past events by year.
 * Returns an object like: { '2025': [...], '2026': [...] }
 */
export const getEventsByYear = () => {
    const pastEvents = getPastEvents();
    const grouped = {};

    pastEvents.forEach(event => {
        const year = parseDate(event.date).getFullYear().toString();
        if (!grouped[year]) {
            grouped[year] = [];
        }
        grouped[year].push(event);
    });

    return grouped;
};

/**
 * Getting formatted Month and Day from date string
 * @param {string} dateStr - YYYY-MM-DD
 * @returns {object} { month: 'JAN', day: '15', year: '2025' }
 */
export const getEventDateParts = (dateStr) => {
    const date = parseDate(dateStr);
    const month = date.toLocaleString('en-US', { month: 'short' }).toUpperCase();
    const day = date.getDate().toString();
    const year = date.getFullYear().toString();
    return { month, day, year };
};

/**
 * Generates the gallery array for an event.
 * Priority: 
 * 1. event.gallery (Manual list)
 * 2. event.folderName + event.imageCount (Auto-generated)
 */
export const getEventGallery = (event) => {
    // 1. If manual gallery exists and has items, use it
    if (Array.isArray(event.gallery) && event.gallery.length > 0) {
        return event.gallery;
    }

    // 2. If folderName and imageCount are provided, generate paths
    if (event.folderName && event.imageCount > 0) {
        const images = [];
        // Assuming images are named 1.jpg, 2.jpg, etc.
        // We can support jpg/png by checking or defaulting to one. 
        // For simplicity, we'll try .jpg or .png or assume valid paths if they exist
        // Standardizing on 'n.jpg' for auto-gallery seems safest for a non-dev instructions
        for (let i = 1; i <= event.imageCount; i++) {
            // Path: /assets/events/[folderName]/[i].jpg
            images.push(`/assets/events/${event.folderName}/${i}.jpg`);
        }
        return images;
    }

    // 3. Start empty
    return [];
};
