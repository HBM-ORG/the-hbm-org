import { useState, useEffect } from 'react';
import { getApiBase } from '../utils/api';
import { isEmbedPreview } from '../utils/embed';

const CACHE_KEY = 'hbm_library_cache_v4';
const CACHE_DURATION = 1000 * 60 * 60 * 24 * 7; // 7 days

// CRITICAL: High-Res Covers for Flagship Books to prevent "Holes"
// CRITICAL: High-Res Covers for Flagship Books
// Removed m.media-amazon.com links as they are unreliable (Anti-Hotlinking 404s)
const HARDCODED_COVERS = {
    "Meditations": "https://covers.openlibrary.org/b/id/12711090-L.jpg",
    "Homo Deus": "https://test-org-site-media-files.nyc3.digitaloceanspaces.com/legacy/book-covers/homo-deus.png",
    "Deep Work": "https://covers.openlibrary.org/b/id/12745300-L.jpg"
};

export const useBookData = (
  title,
  author,
  type,
  manualCoverUrl,
  options = {},
) => {
  const { includeAi = false } = options;
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

    if (!title) {
      setLoading(false);
      return;
    }

    if (isEmbedPreview()) {
      setBookData(null);
      setLoading(false);
      return;
    }

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
        // 3. Server-side book enrichment
        const response = await fetch(`${getApiBase()}/api/ai/fetch-book`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ title, author, includeAi }),
        });

        if (!response.ok) {
          const text = await response.text();
          throw new Error(text || `Book lookup failed: ${response.status}`);
        }

        const json = await response.json();
        const cover =
          typeof json.coverUrl === 'string' && json.coverUrl.trim()
            ? json.coverUrl
            : '';
        const pageCount = Number(json.pageCount);

        // 4. Final decision
        if (cover) {
            const processed = {
                cover,
                description: typeof json.description === 'string' && json.description.length > 50 ? json.description : null,
                rating: 4.7,
                ratingsCount: 0,
                pageCount: Number.isFinite(pageCount) && pageCount > 0 ? pageCount : 250,
                publishedDate: '',
                infoLink: typeof json.infoLink === 'string' && json.infoLink
                  ? json.infoLink
                  : `https://archive.org/search.php?query=${encodeURIComponent(title + ' ' + author)}`,
            };
            
            // Update Cache
            cache[cacheId] = { timestamp: Date.now(), data: processed };
            localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
            setBookData(processed);
        } else {
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
  }, [title, author, manualCoverUrl, includeAi]);

  return { ...bookData, isLoading: loading, error };
}
