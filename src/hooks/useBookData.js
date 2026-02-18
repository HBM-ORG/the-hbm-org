import { useState, useEffect } from 'react';

const CACHE_KEY = 'hbm_library_cache_v3'; // Version bump
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days

// CRITICAL: High-Res Covers for Flagship Books to prevent "Holes"
const HARDCODED_COVERS = {
    "Atomic Habits": "https://m.media-amazon.com/images/I/81F90H7hnML._SL1500_.jpg",
    "Can't Hurt Me": "https://m.media-amazon.com/images/I/81gTRv2HXrL._SL1500_.jpg",
    "The Psychology of Money": "https://m.media-amazon.com/images/I/81Dky+tD+pL._SL1500_.jpg",
    "Deep Work": "https://m.media-amazon.com/images/I/719mJ-sLzTL.jpg", // Verified
    "Meditations": "https://m.media-amazon.com/images/I/517fH0zIdfL.jpg", // Verified (Gregory Hays)
    "Why We Sleep": "https://m.media-amazon.com/images/I/8125di58M+L._SL1500_.jpg",
    "Thinking, Fast and Slow": "https://m.media-amazon.com/images/I/61fdrEuPJwL._SL1500_.jpg",
    "Extreme Ownership": "https://m.media-amazon.com/images/I/71+jNdtM3TL._SL1500_.jpg",
    "Man's Search for Meaning": "https://m.media-amazon.com/images/I/81E1iJjFmvL._SL1500_.jpg",
    "Tools of Titans": "https://m.media-amazon.com/images/I/814pC+5eXGL._SL1500_.jpg",
    "Sapiens": "https://m.media-amazon.com/images/I/713jIoMO3UL._SL1500_.jpg",
    "Homo Deus": "https://www.ynharari.com/wp-content/uploads/2017/01/homo_deus.png", // Verified (Author Site)
    "The Gene": "https://m.media-amazon.com/images/I/91T212D1eLL._SL1500_.jpg",
    "Breath": "https://m.media-amazon.com/images/I/71Un-2JEeNL._SL1500_.jpg",
    "The Alchemist": "https://m.media-amazon.com/images/I/71aFt4+OTOL._SL1500_.jpg",
    "Rich Dad Poor Dad": "https://m.media-amazon.com/images/I/81bsw6fnUiL._SL1500_.jpg",
    "The 4-Hour Workweek": "https://m.media-amazon.com/images/I/81qW97ndkvL._SL1500_.jpg",
    "The Power of Now": "https://m.media-amazon.com/images/I/714FbKtXS+L._SL1500_.jpg",
    "Daring Greatly": "https://m.media-amazon.com/images/I/817gXox+x9L._SL1500_.jpg",
    "Start with Why": "https://m.media-amazon.com/images/I/71O3vC+tFdL._SL1500_.jpg"
};

export const useBookData = (title, author, type, manualCoverUrl) => {
  const [bookData, setBookData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Manual Override / Hardcoded Map (Highest Priority)
    // This ensures checking "Atomic Habits" always returns a valid cover.
    const hardcodedCover = HARDCODED_COVERS[title] || manualCoverUrl;
    
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
