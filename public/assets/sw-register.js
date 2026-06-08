// Service Worker 登録スクリプト
// 各HTMLページから <script src="/assets/sw-register.js" defer></script> で読み込む
(function () {
  if (!('serviceWorker' in navigator)) return;
  window.addEventListener('load', function () {
    navigator.serviceWorker.register('/sw.js').catch(function (err) {
      // 登録失敗してもアプリは動く（無視）
      console.warn('SW登録失敗:', err);
    });
  });
})();
