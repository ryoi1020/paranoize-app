import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.paranoize.guide',
  appName: 'パラノイズ攻略',
  // webDir はローカル同梱用。ハイブリッド構成では server.url を使うが、
  // cap add ios 時に空でないディレクトリが必要なので public を指定しておく。
  webDir: 'public',
  server: {
    // Vercel本番を読み込む（ハイブリッド方式）
    url: 'https://paranoize-app.vercel.app',
    cleartext: false,
    // iOSのWKWebViewでVercelドメインを許可
    allowNavigation: [
      'paranoize-app.vercel.app',
      '*.vercel.app',
      '*.supabase.co',
      'qr.paypay.ne.jp'
    ]
  },
  ios: {
    // ステータスバーがコンテンツに重ならないように
    contentInset: 'always',
    // スクロールの跳ね返り
    scrollEnabled: true,
    backgroundColor: '#fdfaff'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 1500,
      launchAutoHide: true,
      backgroundColor: '#fdfaff',
      showSpinner: false,
      iosSpinnerStyle: 'small',
      splashImmersive: false
    },
    StatusBar: {
      style: 'DARK',
      backgroundColor: '#fdfaff'
    }
  }
};

export default config;
