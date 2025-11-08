// Public VAPID key dari Dicoding
const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

const swRegister = async () => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

  try {
    // Registrasi Service Worker
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('✅ Service Worker registered!', registration);

    // Minta izin notifikasi
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('❌ Notification permission not granted');
      return;
    }
    console.log('✅ Notification permission granted');

    // Subscribe push dengan VAPID key publik
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    });
    console.log('✅ Push subscription:', subscription);

    // TODO: Kirim subscription ke server Dicoding sesuai dokumentasi
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
  }
};

// Helper: konversi base64 VAPID key ke Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

// Fungsi disable notifikasi
export const disableNotifications = async () => {
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg || !reg.pushManager) return;

  const subscription = await reg.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    console.log('❌ Notifications disabled');
  }
};

export default swRegister;
