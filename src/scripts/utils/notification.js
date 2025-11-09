import swRegister, { disableNotifications } from './sw-register.js';

const toggleBtn = document.getElementById('toggleNotification');
let enabled = false;

const updateButton = () => {
  toggleBtn.textContent = enabled ? 'Disable Notification' : 'Enable Notification';
};

toggleBtn.addEventListener('click', async () => {
  toggleBtn.disabled = true;

  if (!enabled) {
    await swRegister(); // registrasi SW + subscribe push
    enabled = true;
  } else {
    await disableNotifications(); // unsubscribe push
    enabled = false;
  }

  updateButton();
  toggleBtn.disabled = false;
});

// Cek status subscription saat load
(async () => {
  toggleBtn.disabled = true;
  if ('serviceWorker' in navigator && 'PushManager' in window) {
    const reg = await navigator.serviceWorker.getRegistration();
    if (reg) {
      const sub = await reg.pushManager.getSubscription();
      enabled = !!sub;
    }
  }
  updateButton();
  toggleBtn.disabled = false;
})();
