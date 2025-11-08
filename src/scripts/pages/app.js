import routes from '../routes/routes';
import { sleep } from '../utils/index.js';
import swRegister from '../utils/sw-register.js'; // ✅ PWA
import { addNote, getAllNotes, deleteNote } from '../utils/db.js'; // ✅ IndexedDB
import { syncOfflineData } from '../utils/sync.js'; // ✅ Sync offline → online

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;
  #notesCache = []; // Cache untuk filter/sorting

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
    this._setupInstallPrompt();
    this._registerServiceWorker();

    window.addEventListener('hashchange', () => this.renderPage());
    this.renderPage();
  }

  // ================= Drawer =================
  _setupDrawer() {
    this.#drawerButton.addEventListener('click', () => {
      this.#navigationDrawer.classList.toggle('open');
    });

    document.body.addEventListener('click', (event) => {
      if (!this.#navigationDrawer.contains(event.target) && !this.#drawerButton.contains(event.target)) {
        this.#navigationDrawer.classList.remove('open');
      }

      this.#navigationDrawer.querySelectorAll('a').forEach((link) => {
        if (link.contains(event.target)) {
          this.#navigationDrawer.classList.remove('open');
        }
      });
    });
  }

  // ================= Auth Links =================
  _updateAuthLinks() {
    const loginLink = document.getElementById('nav-login');
    const logoutLink = document.getElementById('nav-logout');

    if (localStorage.getItem('token')) {
      if (loginLink) loginLink.style.display = 'none';
      if (logoutLink) logoutLink.style.display = 'inline-block';
    } else {
      if (loginLink) loginLink.style.display = 'inline-block';
      if (logoutLink) logoutLink.style.display = 'none';
    }

    if (logoutLink) {
      logoutLink.addEventListener('click', () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        this._updateAuthLinks();
        window.location.hash = '/login';
      });
    }
  }

  // ================= PWA =================
  async _registerServiceWorker() {
    try {
      await swRegister();
      console.log('✅ Service Worker registered successfully.');
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
    }
  }

  _setupInstallPrompt() {
    let deferredPrompt;
    const installButton = document.getElementById('installBtn');

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      console.log('✅ beforeinstallprompt event fired');
      if (installButton) {
        installButton.style.display = 'block';

        installButton.addEventListener('click', async () => {
          installButton.style.display = 'none';
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log('User install choice:', outcome);
          deferredPrompt = null;
        });
      }
    });

    window.addEventListener('appinstalled', () => {
      console.log('🎉 Aplikasi berhasil diinstall!');
    });
  }

  // ================= IndexedDB Notes (Skilled + Advanced) =================
  async _renderNotes(filterText = '', sortAsc = true) {
    const notesList = document.getElementById('note-list');
    if (!notesList) return;

    // Gunakan cache jika sudah ada
    if (!this.#notesCache.length) this.#notesCache = await getAllNotes();

    let notes = [...this.#notesCache];

    // Filter
    if (filterText.trim() !== '') {
      notes = notes.filter(note => note.text.toLowerCase().includes(filterText.toLowerCase()));
    }

    // Sort
    notes.sort((a, b) => {
      if (a.text.toLowerCase() < b.text.toLowerCase()) return sortAsc ? -1 : 1;
      if (a.text.toLowerCase() > b.text.toLowerCase()) return sortAsc ? 1 : -1;
      return 0;
    });

    // Render
    notesList.innerHTML = '';
    notes.forEach(note => {
      const li = document.createElement('li');
      li.textContent = note.text;

      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Hapus';
      deleteBtn.addEventListener('click', async () => {
        await deleteNote(note.id);
        this.#notesCache = this.#notesCache.filter(n => n.id !== note.id);
        this._renderNotes(filterText, sortAsc);
      });

      li.appendChild(deleteBtn);
      notesList.appendChild(li);
    });
  }

  async _setupNotesForm() {
    const form = document.getElementById('note-form');
    const input = document.getElementById('note-input');
    const searchInput = document.getElementById('search-note');
    const sortButton = document.getElementById('sort-note');

    if (!form || !input) return;

    let sortAsc = true;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      if (!input.value.trim()) return;

      await addNote({ text: input.value });
      input.value = '';
      this.#notesCache = await getAllNotes();
      this._renderNotes(searchInput?.value || '', sortAsc);

      if (navigator.onLine) {
        syncOfflineData();
      }
    });

    if (searchInput) {
      searchInput.addEventListener('input', () => {
        this._renderNotes(searchInput.value, sortAsc);
      });
    }

    if (sortButton) {
      sortButton.addEventListener('click', () => {
        sortAsc = !sortAsc;
        this._renderNotes(searchInput?.value || '', sortAsc);
      });
    }
  }

  // ================= Render Page =================
  async renderPage() {
    const url = window.location.hash.slice(1) || '/';
    const page = routes[url] || routes['/'];

    const updatePage = async () => {
      this.#content.innerHTML = await page.render();
      if (page.afterRender) await page.afterRender();

      this._updateAuthLinks();

      // Inisialisasi Notes jika ada
      if (document.getElementById('note-form')) {
        this.#notesCache = await getAllNotes();
        await this._renderNotes();
        await this._setupNotesForm();
      }
    };

    if (document.startViewTransition) {
      document.startViewTransition(async () => {
        await sleep(100);
        await updatePage();
      });
    } else {
      this.#content.classList.add('slide-out');
      setTimeout(async () => {
        await updatePage();
        this.#content.classList.remove('slide-out');
        this.#content.classList.add('slide-in');
        setTimeout(() => this.#content.classList.remove('slide-in'), 300);
      }, 200);
    }
  }
}

export default App;
