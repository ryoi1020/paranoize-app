// ============================================
// Capacitor ネイティブ機能ヘルパー
// アプリ内（Capacitor）でのみ動作。ブラウザでは何もしない。
// 全ページで <script src="/assets/native.js" defer></script> で読み込む
// ============================================
(function () {
  // Capacitorが存在するか（＝アプリ内で動いているか）
  const isApp = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  window.IS_NATIVE_APP = isApp;
  if (!isApp) return; // ブラウザでは何もしない

  const Plugins = window.Capacitor.Plugins || {};

  // ---- ステータスバー：アプリのテーマ色に馴染ませる ----
  try {
    if (Plugins.StatusBar) {
      Plugins.StatusBar.setStyle({ style: 'LIGHT' }); // 明るい背景なので濃い文字
      if (Plugins.StatusBar.setBackgroundColor) {
        Plugins.StatusBar.setBackgroundColor({ color: '#fdfaff' });
      }
    }
  } catch (e) { /* noop */ }

  // ---- 触覚フィードバック：タップ時に軽いバイブ ----
  function haptic(style) {
    try {
      if (Plugins.Haptics) {
        Plugins.Haptics.impact({ style: style || 'LIGHT' });
      }
    } catch (e) { /* noop */ }
  }
  window.appHaptic = haptic;

  // アプリ内では、主要なタップ要素に触覚を自動付与
  document.addEventListener('DOMContentLoaded', function () {
    const tappables = document.querySelectorAll('a.app-tile, .p-tab, button, .mode-tab, .gbtn, .support-btn');
    tappables.forEach(function (el) {
      el.addEventListener('click', function () { haptic('LIGHT'); }, { passive: true });
    });
  });

  // ---- ネイティブ共有：テキスト/URLを共有シートで ----
  window.appShare = async function (opts) {
    try {
      if (Plugins.Share) {
        await Plugins.Share.share({
          title: opts.title || 'パラノイズ攻略',
          text: opts.text || '',
          url: opts.url || '',
          dialogTitle: opts.dialogTitle || '共有'
        });
        return true;
      }
    } catch (e) { console.warn('native share failed', e); }
    return false;
  };

  console.log('[native.js] Capacitorネイティブ機能を有効化しました');
})();
