// ZenTap Lightweight Offline & Standee Fast-Tap Service Worker
const CACHE_NAME = "zentap-v1.54.23";
const PRECACHE_ASSETS = [
  "/favicon.ico",
  "/icon.svg",
  "/icon.png",
  "/manifest.json"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  // Only handle GET requests
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Skip API routes and Chrome extensions
  if (url.pathname.startsWith("/api/") || !url.protocol.startsWith("http")) {
    return;
  }

  // Network-first strategy for standee pages (/r/*), with cache fallback
  event.respondWith(
    fetch(event.request)
      .then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(async () => {
        const cachedResponse = await caches.match(event.request);
        if (cachedResponse) return cachedResponse;

        // If an HTML navigation request failed completely, return cached fallback
        if (event.request.headers.get("accept")?.includes("text/html")) {
          const fallback = await caches.match("/");
          if (fallback) return fallback;
        }

        return new Response("Offline - Please check your internet connection.", {
          status: 503,
          headers: { "Content-Type": "text/plain" },
        });
      })
  );
});
