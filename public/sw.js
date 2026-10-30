// RDIO-GO Service Worker - v3.6 (PWA & PWABuilder 100% Compliant)
const CACHE_NAME = 'rdiogo-v3.6';

// Precache offline fallback shell and app branding
const PRECACHE_ASSETS = [
  '/',
  '/manifest.json',
  '/manifest.webmanifest',
  '/pwa-192x192.png',
  '/pwa-512x512.png',
  '/screenshot-mobile.png',
  '/screenshot-desktop.png',
  '/icon.svg',
];

// Install: Activate immediately
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch(() => {});
    })
  );
});

// Activate: Immediately purge ALL older caches (v1, v2, etc.)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('Purging legacy cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Strictly NETWORK-FIRST for all HTML/JS/CSS assets to prevent stale code
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  const url = event.request.url;

  // Never intercept live radio audio streams or remote APIs
  if (
    url.includes('.mp3') ||
    url.includes('.aac') ||
    url.includes('.ogg') ||
    url.includes('radioparadise.com') ||
    url.includes('radiofrance.fr') ||
    url.includes('cdnstream1.com') ||
    url.includes('sharp-stream.com') ||
    url.includes('bbcmedia.co.uk') ||
    url.includes('infomaniak.ch') ||
    url.includes('rockantenne.de') ||
    url.includes('somafm.com') ||
    url.includes('radio-browser.info') ||
    url.includes('googlesyndication.com') ||
    url.includes('googleads') ||
    url.includes('doubleclick.net') ||
    url.includes('/proxy/')
  ) {
    return;
  }

  // Network-First strategy: Always fetch newest code from server first!
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const resClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, resClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Only if offline, fall back to cached shell
        return caches.match(event.request).then((cached) => {
          if (cached) return cached;
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
      })
  );
});
