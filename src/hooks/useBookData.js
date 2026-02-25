import { useState, useEffect } from 'react';

const CACHE_KEY = 'hbm_library_cache_v3'; // Version bump
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days

// CRITICAL: High-Res Covers for Flagship Books to prevent "Holes"
// CRITICAL: High-Res Covers for Flagship Books
// Removed m.media-amazon.com links as they are unreliable (Anti-Hotlinking 404s)
const HARDCODED_COVERS = {
    "Meditations": "https://covers.openlibrary.org/b/id/12711090-L.jpg",
    "Homo Deus": "https://www.ynharari.com/wp-content/uploads/2017/01/homo_deus.png",
    "Deep Work": "https://covers.openlibrary.org/b/id/12745300-L.jpg"
};

export const useBookData = (title, author, type, manualCoverUrl) => {
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Manual Override / Hardcoded Map (Highest Priority)
    // This ensures checking "Atomic Habits" always returns a valid cover.
    let hardcodedCover = HARDCODED_COVERS[title] || manualCoverUrl;
    
    // Safety check: Avoid using known broken amazon links from CMS
    if (hardcodedCover && hardcodedCover.includes('m.media-amazon.com')) {
        hardcodedCover = null;
    }

    if (hardcodedCover) {
        setBookData({
            cover: hardcodedCover,
            rating: 4.8,
            pageCount: 300,
            publisher: 'HBM Library',
            publishedDate: '2024',
            description: '', // Will use fallback in UI
            infoLink: `https://archive.org/search.php?query=${encodeURIComponent(title + ' ' + author)}`
        });
        setLoading(false);
        return;
    }

    if (!title) return;

    const fetchData = async () => {
      setLoading(true);
      setError(null);

      // 2. Check Cache
      const cache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
      const cacheId = `${title}-${author}`.toLowerCase().replace(/[^a-z0-9]/g, '');
      
      if (cache[cacheId] && cache[cacheId].timestamp > Date.now() - CACHE_DURATION) {
        setBookData(cache[cacheId].data);
        setLoading(false);
        return;
      }

      try {
        // 3. Google Books API
        const apiKey = import.meta.env.VITE_GOOGLE_BOOKS_API_KEY || '';
        const keyParam = apiKey ? `&key=${apiKey}` : '';
        const query = `intitle:${encodeURIComponent(title)}+inauthor:${encodeURIComponent(author)}`;
        
        let cover = '';
        let info = {};

        const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${query}&langRestrict=en&maxResults=1${keyParam}`);
        const json = await response.json();
        
        if (json.items && json.items.length > 0) {
           info = json.items[0].volumeInfo;
           cover = getGoogleCover(info);
        }

        // 4. OpenLibrary API Fallback
        if (!cover) {
           const olQuery = `title=${encodeURIComponent(title)}&author=${encodeURIComponent(author)}`;
           const olResponse = await fetch(`https://openlibrary.org/search.json?${olQuery}&limit=1`);
           const olJson = await olResponse.json();
           
           if (olJson.docs && olJson.docs.length > 0) {
               const doc = olJson.docs[0];
               if (doc.cover_i) {
                   cover = `https://covers.openlibrary.org/b/id/${doc.cover_i}-L.jpg`;
                   if (!info.pageCount) info.pageCount = doc.number_of_pages_median;
               }
           }
        }

        // 5. Final Decision
        if (cover) {
            const processed = {
                cover,
                description: (info.description && info.description.length > 50) ? info.description : null,
                rating: info.averageRating || 4.7,
                ratingsCount: info.ratingsCount || 0,
                pageCount: info.pageCount || 250,
                publishedDate: info.publishedDate,
                infoLink: info.previewLink || `https://archive.org/search.php?query=${encodeURIComponent(title + ' ' + author)}`
            };
            
            // Update Cache
            cache[cacheId] = { timestamp: Date.now(), data: processed };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            setBookData(processed);
        } else {
            // STRICT MODE: No cover -> Error
            setError("No cover found");
            setBookData(null); 
        }

      } catch (err) {
        console.warn(`Error fetching data for ${title}:`, err);
        setError(err.message);
        setBookData(null); 
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [title, author, manualCoverUrl]);

  return { ...bookData, isLoading: loading, error };
}

// Helper to extract best Google cover
function getGoogleCover(info) {
    let cover = info.imageLinks?.extraLarge || info.imageLinks?.large || info.imageLinks?.medium || info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
    if (cover) {
        cover = cover.replace('http:', 'https:').replace('&edge=curl', '');
        if (cover.includes('&zoom=')) {
           cover = cover.replace(/&zoom=\d/, '&zoom=0'); // Try for original/largest
        }
    }
    return cover;
}
