// service-worker.js
self.addEventListener('install', function(event) {
  console.log('Service Worker installed');
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  console.log('Service Worker activated');
  return self.clients.claim();
});

// Ngăn chặn cache của các API requests
self.addEventListener('fetch', function(event) {
  const url = new URL(event.request.url);
  
  // Chỉ can thiệp vào các API requests
  if (url.pathname.includes('/api/')) {
    // Thêm timestamp vào API requests để tránh cache
    if (event.request.method === 'GET') {
      const timestampedUrl = new URL(event.request.url);
      timestampedUrl.searchParams.set('_sw_time', Date.now());
      
      const newRequest = new Request(timestampedUrl.toString(), {
        method: event.request.method,
        headers: event.request.headers,
        mode: 'cors',
        credentials: 'include',
        cache: 'no-store'
      });
      
      event.respondWith(fetch(newRequest));
      return;
    }
  }
});

// Listen for messages from the client
self.addEventListener('message', function(event) {
  console.log('Service Worker received message:', event.data);
  
  if (event.data.action === 'skipWaiting') {
    self.skipWaiting();
  }
}); 