// src/utils/sync.js
import { getAllNotes, addNote, deleteNote } from './db.js';

const API_URL = 'https://your-api.com/notes';

export async function syncOfflineData() {
  if (!navigator.onLine) return;

  const offlineNotes = await getAllNotes();

  for (const note of offlineNotes) {
    // Kirim ke API
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });

      // Hapus note offline setelah sukses
      await deleteNote(note.id);
    } catch (err) {
      console.error('Gagal sinkronisasi:', err);
    }
  }
}

// Event listener untuk reconnect
window.addEventListener('online', () => {
  console.log('Koneksi internet tersedia, mulai sinkronisasi...');
  syncOfflineData();
});
