// Request debouncer utility to prevent rate limiting
class RequestDebouncer {
  constructor() {
    this.pendingRequests = new Map();
    this.debounceDelay = 300; // 300ms delay
  }

  // Debounce a request by URL and method
  debounce(key, requestFn) {
    return new Promise((resolve, reject) => {
      const requestKey = key;
      
      // Clear existing timeout for this request
      if (this.pendingRequests.has(requestKey)) {
        clearTimeout(this.pendingRequests.get(requestKey).timeout);
      }

      // Set new timeout
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestKey);
        requestFn().then(resolve).catch(reject);
      }, this.debounceDelay);

      // Store the timeout reference
      this.pendingRequests.set(requestKey, { timeout });
    });
  }

  // Cancel all pending requests
  cancelAll() {
    this.pendingRequests.forEach(({ timeout }) => {
      clearTimeout(timeout);
    });
    this.pendingRequests.clear();
  }

  // Cancel specific request
  cancel(key) {
    const request = this.pendingRequests.get(key);
    if (request) {
      clearTimeout(request.timeout);
      this.pendingRequests.delete(key);
    }
  }
}

// Create a singleton instance
const requestDebouncer = new RequestDebouncer();

export default requestDebouncer; 