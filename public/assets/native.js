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

  // ============================================
  // ローカル通知
  // ============================================
  const LN = Plugins.LocalNotifications;

  // 通知の許可をリクエスト（初回のみダイアログ）
  window.appRequestNotificationPermission = async function () {
    try {
      if (!LN) return 'unavailable';
      const res = await LN.requestPermissions();
      return res.display; // 'granted' | 'denied' | 'prompt'
    } catch (e) { console.warn('notif permission failed', e); return 'error'; }
  };

  // 現在の許可状態を確認
  window.appCheckNotificationPermission = async function () {
    try {
      if (!LN) return 'unavailable';
      const res = await LN.checkPermissions();
      return res.display;
    } catch (e) { return 'error'; }
  };

  // 指定時刻に毎日繰り返す通知をセット
  // id: 通知の識別番号, hour/minute: 時刻, title/body: 内容
  window.appScheduleDaily = async function (id, hour, minute, title, body) {
    try {
      if (!LN) return false;
      // 既存の同IDを消してから入れ直す
      await LN.cancel({ notifications: [{ id: id }] });
      await LN.schedule({
        notifications: [{
          id: id,
          title: title,
          body: body,
          schedule: {
            on: { hour: hour, minute: minute },
            allowWhileIdle: true,
            repeats: true
          },
          smallIcon: 'ic_stat_icon',
          sound: null
        }]
      });
      return true;
    } catch (e) { console.warn('schedule failed', e); return false; }
  };

  // 指定IDの通知をキャンセル
  window.appCancelNotification = async function (id) {
    try {
      if (!LN) return false;
      await LN.cancel({ notifications: [{ id: id }] });
      return true;
    } catch (e) { return false; }
  };

  // セット済みの通知一覧
  window.appListNotifications = async function () {
    try {
      if (!LN) return [];
      const res = await LN.getPending();
      return res.notifications || [];
    } catch (e) { return []; }
  };

  console.log('[native.js] Capacitorネイティブ機能を有効化しました');
})();
