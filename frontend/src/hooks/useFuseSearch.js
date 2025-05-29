import { useState, useMemo } from 'react';
import Fuse from 'fuse.js';

/**
 * Custom hook to perform fuzzy search using fuse.js
 * @param {Array} data - The array of data to search
 * @param {Object} options - Fuse.js options including keys to search
 * @returns {Object} - { query, setQuery, results }
 */
export default function useFuseSearch(data, options) {
  const [query, setQuery] = useState('');

  const fuse = useMemo(() => {
    return new Fuse(data, options);
  }, [data, options]);

  const results = useMemo(() => {
    if (!query) {
      return data;
    }
    const fuseResults = fuse.search(query);
    return fuseResults.map(result => result.item);
  }, [data, fuse, query]);

  return { query, setQuery, results };
}
