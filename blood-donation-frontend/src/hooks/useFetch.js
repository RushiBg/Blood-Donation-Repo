import { useState, useEffect, useRef } from 'react';

export default function useFetch(fetchFn, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setLoading(true);
    setError(null);
    
    fetchFn()
      .then(res => { 
        if (mounted) setData(res); 
      })
      .catch(err => { 
        if (mounted && err.name !== 'AbortError') {
          // Handle rate limiting specifically
          if (err.response?.status === 429) {
            setError(new Error('Too many requests. Please wait a moment and try again.'));
          } else {
            setError(err); 
          }
        }
      })
      .finally(() => { 
        if (mounted) setLoading(false); 
      });
      
    return () => { 
      mounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, deps);

  return { data, loading, error };
} 