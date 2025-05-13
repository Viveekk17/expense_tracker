3/**
 * Web Worker for background data fetching and caching
 */

// List of endpoints to prefetch
const ENDPOINTS_TO_PREFETCH = [
  '/users',
  '/expenses'
];

// Cache expiration times (in milliseconds)
const CACHE_EXPIRATION = {
  '/users': 10 * 60 * 1000, // 10 minutes
  '/expenses': 5 * 60 * 1000, // 5 minutes
  default: 15 * 60 * 1000 // 15 minutes (default)
};

// In-memory cache
const cache = {};

// Listen for messages from the main thread
self.addEventListener('message', (event) => {
  const { type, payload } = event.data;
  
  switch (type) {
    case 'prefetch':
      prefetchData(payload.userId, payload.endpoint, payload.options);
      break;
    case 'prefetchAll':
      prefetchAllData(payload.userId);
      break;
    case 'get':
      getCachedData(payload.userId, payload.endpoint);
      break;
    case 'clear':
      clearCache();
      break;
    default:
      console.error('Unknown message type:', type);
  }
});

// Prefetch a specific endpoint
const prefetchData = async (userId, endpoint, options = {}) => {
  try {
    const url = typeof endpoint === 'string' 
      ? `https://i6nn3gptzh.execute-api.us-east-1.amazonaws.com/dev${endpoint}${endpoint.includes('?') ? '&' : '?'}userId=${userId}`
      : endpoint;
      
    // Check if we already have fresh data in the cache
    const cacheKey = `${userId}:${url}`;
    const cachedEntry = cache[cacheKey];
    const now = Date.now();
    
    if (cachedEntry && now < cachedEntry.expires) {
      // Data is still fresh, no need to fetch
      self.postMessage({
        type: 'cached',
        payload: {
          endpoint,
          data: cachedEntry.data,
          fromCache: true,
          timestamp: cachedEntry.timestamp
        }
      });
      return;
    }
    
    // Fetch fresh data
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      },
      ...options
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Calculate expiration time for this endpoint
    const expiresIn = CACHE_EXPIRATION[endpoint] || CACHE_EXPIRATION.default;
    
    // Cache the data
    cache[cacheKey] = {
      data,
      timestamp: now,
      expires: now + expiresIn
    };
    
    // Send data back to main thread
    self.postMessage({
      type: 'prefetched',
      payload: {
        endpoint,
        data,
        fromCache: false,
        timestamp: now
      }
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      payload: {
        endpoint,
        error: error.message
      }
    });
  }
};

// Prefetch all configured endpoints
const prefetchAllData = (userId) => {
  ENDPOINTS_TO_PREFETCH.forEach(endpoint => {
    prefetchData(userId, endpoint);
  });
};

// Get data from cache or fetch if not available
const getCachedData = async (userId, endpoint) => {
  const cacheKey = `${userId}:${endpoint}`;
  const cachedEntry = cache[cacheKey];
  const now = Date.now();
  
  if (cachedEntry && now < cachedEntry.expires) {
    // Return cached data
    self.postMessage({
      type: 'data',
      payload: {
        endpoint,
        data: cachedEntry.data,
        fromCache: true,
        timestamp: cachedEntry.timestamp
      }
    });
    return;
  }
  
  // If not in cache or expired, fetch it
  prefetchData(userId, endpoint);
};

// Clear all cache
const clearCache = () => {
  Object.keys(cache).forEach(key => {
    delete cache[key];
  });
  
  self.postMessage({
    type: 'cleared',
    payload: null
  });
};

// Initialize worker
self.postMessage({
  type: 'ready',
  payload: {
    timestamp: Date.now()
  }
}); 