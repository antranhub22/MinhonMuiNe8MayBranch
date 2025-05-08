self.addEventListener('push', function(event) {
  let data = {};
  if (event.data) {
    data = event.data.json();
  }
  const title = data.title || 'Hotel Service Notification';
  const options = {
    body: data.body || 'You have a new update.',
    icon: '/vite.svg',
    badge: '/vite.svg',
    data: data.url ? { url: data.url } : {},
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  const url = event.notification.data && event.notification.data.url;
  if (url) {
    event.waitUntil(clients.openWindow(url));
  }
}); 