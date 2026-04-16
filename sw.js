const CACHE = 'plantas-v1';
const ARCHIVOS = ['./index.html', './manifest.json'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ARCHIVOS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(clients.claim());
});

self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});

// Escuchar mensaje para programar notificación
self.addEventListener('message', e => {
  if (e.data && e.data.tipo === 'programar') {
    const { plantas } = e.data;
    programarNotificaciones(plantas);
  }
});

function programarNotificaciones(plantas) {
  // Guardar plantas en cache del SW para revisión diaria
  self.plantasPendientes = plantas;
}

// Notificación push (cuando el servidor la envía)
self.addEventListener('push', e => {
  const data = e.data ? e.data.json() : { titulo: '🌿 Estuqueras Garden', cuerpo: 'Hay plantas que necesitan agua hoy' };
  e.waitUntil(
    self.registration.showNotification(data.titulo, {
      body: data.cuerpo,
      icon: './icon-192.png',
      badge: './icon-192.png',
      vibrate: [200, 100, 200],
      tag: 'riego',
      renotify: true,
      actions: [{ action: 'abrir', title: 'Ver plantas' }]
    })
  );
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(clients.openWindow('./'));
});
