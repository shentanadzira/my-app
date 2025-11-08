import { getAllNotes, addNote, deleteNote } from './db.js';

const API_URL = 'https://your-api.com/notes';

export async function syncOfflineData() {
  if (!navigator.onLine) return;

  const offlineNotes = await getAllNotes();

  for (const note of offlineNotes) {
    try {
      await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(note),
      });

      await deleteNote(note.id);
    } catch (err) {
      console.error('Gagal sinkronisasi:', err);
    }
  }
}

window.addEventListener('online', () => {
  console.log('Koneksi internet tersedia, mulai sinkronisasi...');
  syncOfflineData();
});
