// Service Worker for パラノイズ攻略
// バージョン管理：キャッシュ仕様変更時にここを更新するとクライアントが新キャッシュに切替
const VERSION = 'v11';
const APP_CACHE = `paranoize-app-${VERSION}`;
const IMG_CACHE = `paranoize-images-${VERSION}`;

// Supabase の card-images だけ永続キャッシュする
const SUPABASE_HOST = 'hpyaocrnmvnnbltbazrx.supabase.co';

self.addEventListener('install', (event) => {
  // 新SWは即時に有効化（旧SWの待機をスキップ）
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  // 旧バージョンのキャッシュを削除
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== APP_CACHE && k !== IMG_CACHE)
          .map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);

  // ① Supabase card-images: Cache-First（永続）
  // ヒットしたら絶対にネットワークに行かない = egress 0
  if (url.hostname === SUPABASE_HOST && url.pathname.includes('/card-images/')) {
    event.respondWith(
      caches.open(IMG_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        if (cached) return cached;
        try {
          const res = await fetch(req);
          if (res.ok || res.type === 'opaque') {
            cache.put(req, res.clone());
          }
          return res;
        } catch (e) {
          // ネット失敗時、もし古いキャッシュがあればそれを返す
          return (await cache.match(req)) || new Response('', { status: 504 });
        }
      })
    );
    return;
  }

  // ② 自分のオリジン（HTML/CSS/JS/icons）: Stale-While-Revalidate
  // 即座にキャッシュを返しつつ、裏でネットからも取りに行き次回更新
  // ただし API はキャッシュしない
  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith('/api/')) return; // APIは素通し

    event.respondWith(
      caches.open(APP_CACHE).then(async (cache) => {
        const cached = await cache.match(req);
        const networkFetch = fetch(req)
          .then((res) => {
            if (res.ok) cache.put(req, res.clone());
            return res;
          })
          .catch(() => cached);
        return cached || networkFetch;
      })
    );
  }
});
