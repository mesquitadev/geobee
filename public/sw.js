// Service Worker para melhorar a experiência mobile
const CACHE_NAME = 'geobee-v1'
const urlsToCache = [
  '/',
  '/index.html',
  '/src/main.tsx',
  '/src/assets/logo-geobee.svg',
]

// Instalação do Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Cache aberto')
      return cache.addAll(urlsToCache)
    }),
  )
})

// Estratégia de cache: Stale-While-Revalidate
// Retorna rapidamente do cache enquanto atualiza o cache para a próxima vez
self.addEventListener('fetch', (event) => {
  // Pulamos requisições não GET como POST, etc.
  if (event.request.method !== 'GET') return

  // Para requisições de API, não usamos cache
  if (event.request.url.includes('/api/')) {
    return
  }

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.match(event.request).then((cachedResponse) => {
        const fetchedResponse = fetch(event.request)
          .then((networkResponse) => {
            // Atualiza o cache se a resposta for válida
            if (networkResponse && networkResponse.status === 200) {
              cache.put(event.request, networkResponse.clone())
            }
            return networkResponse
          })
          .catch(() => {
            // Se não conseguir acessar a rede e não tivermos no cache, retornamos a página offline
            if (event.request.headers.get('accept').includes('text/html')) {
              return caches.match('/offline.html')
            }
            return new Response(
              'Erro de rede, não foi possível carregar o recurso',
              {
                status: 408,
                headers: new Headers({ 'Content-Type': 'text/plain' }),
              },
            )
          })

        // Retorna do cache imediatamente enquanto atualiza em segundo plano
        return cachedResponse || fetchedResponse
      })
    }),
  )
})

// Limpa caches antigos quando uma nova versão do service worker é ativada
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME]
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName)
          }
        }),
      )
    }),
  )
})
