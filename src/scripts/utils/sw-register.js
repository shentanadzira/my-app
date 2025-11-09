const VAPID_PUBLIC_KEY =
  'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';

const swRegister = async () => {
  // Pastikan browser mendukung Service Worker dan Push API
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('❌ Browser tidak mendukung Service Worker atau Push API');
    return;
  }

  try {
    // Daftarkan Service Worker
    const registration = await navigator.serviceWorker.register('/service-worker.js');
    console.log('✅ Service Worker registered!', registration);

    // Minta izin notifikasi
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('❌ Izin notifikasi tidak diberikan');
      return;
    }
    console.log('✅ Notification permission granted');

    // Buat subscription push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    });

    console.log('✅ Push subscription berhasil dibuat:', subscription);

    // --- Kirim subscription ke server Dicoding ---
    const token = localStorage.getItem('token');
    if (!token) {
      console.warn('⚠️ Tidak ada token login — belum bisa kirim ke server Dicoding');
      return;
    }

    const { endpoint, keys } = subscription.toJSON();

    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        endpoint,
        keys: {
          p256dh: keys.p256dh,
          auth: keys.auth,
        },
      }),
    });

    const result = await response.json();
    if (result.error) {
      console.error('❌ Gagal subscribe ke server Dicoding:', result.message);
    } else {
      console.log('🎉 Berhasil subscribe ke server Dicoding:', result.message || result);
    }
  } catch (error) {
    console.error('❌ Service Worker registration failed:', error);
  }
};

// Helper untuk ubah Base64 ke Uint8Array
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return new Uint8Array([...rawData].map((c) => c.charCodeAt(0)));
}

// Fungsi untuk mematikan notifikasi
export const disableNotifications = async () => {
  const reg = await navigator.serviceWorker.getRegistration();
  if (!reg || !reg.pushManager) return;

  const subscription = await reg.pushManager.getSubscription();
  if (subscription) {
    await subscription.unsubscribe();
    console.log('🔕 Notifications disabled');
    alert('Notifikasi berhasil dimatikan.');
  } else {
    console.log('ℹ️ Tidak ada notifikasi aktif');
  }
};

export default swRegister;
