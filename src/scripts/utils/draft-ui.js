// public/scripts/Utils/Draft-ui.js
const DB_NAME = 'DraftDB';
const DB_VERSION = 1;
const STORE_NAME = 'drafts';

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function addDraft(draft) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).add(draft).onsuccess = resolve;
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllDrafts() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    tx.objectStore(STORE_NAME).getAll().onsuccess = (e) => resolve(e.target.result);
    tx.onerror = () => reject(tx.error);
  });
}

// otomatis cek DB saat di-import
(async () => {
  const drafts = await getAllDrafts();
  console.log('Drafts:', drafts);
})();

