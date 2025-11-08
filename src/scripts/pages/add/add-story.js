import L from '../map/leaflet-config.js';
import StoryModel from '../../model/story-model.js';

export default class AddStoryPage {
  constructor() {
    this.storyModel = new StoryModel();
    this.map = null;
    this.selectedLatLng = null;
    this.selectedMarker = null; 
    this.stream = null;
  }

  async render() {
    return `
      <section class="container">
        <h1>Tambah Story Baru</h1>
        <h2>Form Tambah Story</h2>
        <form id="add-story-form">
          <div>
            <label for="description">Deskripsi:</label><br>
            <textarea id="description" name="description" rows="4" required></textarea>
          </div>

          <div>
            <label for="photo">Pilih Gambar:</label><br>
            <input type="file" id="photo" name="photo" accept="image/*">
          </div>

          <div style="margin-top:10px;">
            <p>Atau ambil langsung dari kamera:</p>
            <video id="camera-stream" autoplay playsinline width="200" height="150" style="display:none; border:1px solid #ccc; border-radius:8px;" aria-label="Tampilan kamera"></video><br>
            <button type="button" id="open-camera" aria-label="Buka atau tutup kamera">Buka Kamera</button>
            <button type="button" id="capture-photo" style="display:none;" aria-label="Ambil foto dari kamera">Ambil Foto</button>
            <canvas id="photo-canvas" width="200" height="150" style="display:none;" aria-label="Preview foto"></canvas>
          </div>

          <div style="margin: 10px 0;">
            <h2>Pilih Lokasi di Peta</h2>
            <div id="add-map" style="height: 300px; margin-bottom: 10px; border-radius:8px;" aria-label="Peta untuk memilih lokasi"></div>
            <p id="latlng-display">Belum ada lokasi dipilih.</p>
          </div>

          <button type="submit" id="submit-btn">Kirim Story</button>
        </form>
        <p id="message" style="margin-top:10px; font-weight:bold;"></p>
      </section>
    `;
  }

  async afterRender() {
    this.map = L.map('add-map').setView([-6.2, 106.816], 5);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(this.map);

    const latlngDisplay = document.getElementById('latlng-display');

    this.map.on('click', (e) => {
      this.selectedLatLng = e.latlng;
      latlngDisplay.textContent = `Lokasi: ${e.latlng.lat.toFixed(5)}, ${e.latlng.lng.toFixed(5)}`;

      if (this.selectedMarker) {
        this.map.removeLayer(this.selectedMarker);
      }

      this.selectedMarker = L.marker(e.latlng).addTo(this.map);
    });

    const form = document.getElementById('add-story-form');
    const message = document.getElementById('message');
    const submitBtn = document.getElementById('submit-btn');

    const openBtn = document.getElementById('open-camera');
    const captureBtn = document.getElementById('capture-photo');
    const video = document.getElementById('camera-stream');
    const canvas = document.getElementById('photo-canvas');

    openBtn.addEventListener('click', async () => {
      if (this.stream) {
        this.stream.getTracks().forEach(track => track.stop());
        this.stream = null;
        video.style.display = 'none';
        captureBtn.style.display = 'none';
        openBtn.textContent = 'Buka Kamera';
        return;
      }

      try {
        this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = this.stream;
        video.style.display = 'block';
        captureBtn.style.display = 'inline-block';
        openBtn.textContent = 'Tutup Kamera';
      } catch (err) {
        message.textContent = 'Tidak dapat mengakses kamera: ' + err.message;
        message.style.color = 'red';
      }
    });

    captureBtn.addEventListener('click', () => {
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.style.display = 'block';
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
      video.style.display = 'none';
      captureBtn.style.display = 'none';
      openBtn.textContent = 'Buka Kamera';
      message.textContent = 'Foto berhasil diambil dari kamera.';
      message.style.color = 'green';
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      message.textContent = '';

      const description = document.getElementById('description').value;
      const fileInput = document.getElementById('photo');
      let photoFile = fileInput.files[0];

      if (!this.selectedLatLng) {
        message.textContent = 'Silakan klik lokasi di peta terlebih dahulu!';
        message.style.color = 'red';
        return;
      }

      if (!photoFile && canvas.style.display === 'block') {
        canvas.toBlob(blob => {
          this._sendStory(blob, description, message, submitBtn);
        }, 'image/jpeg');
        return;
      }

      if (!photoFile) {
        message.textContent = 'Silakan pilih gambar atau ambil foto.';
        message.style.color = 'red';
        return;
      }

      await this._sendStory(photoFile, description, message, submitBtn);
    });
  }

  async _sendStory(photoFile, description, message, submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Mengirim...';

    const formData = new FormData();
    formData.append('description', description);
    formData.append('photo', photoFile);
    formData.append('lat', this.selectedLatLng.lat);
    formData.append('lon', this.selectedLatLng.lng);

    try {
      const response = await this.storyModel.addStory(formData);
      if (response.error) throw new Error(response.message);

      message.textContent = 'Story berhasil ditambahkan!';
      message.style.color = 'green';
      setTimeout(() => (window.location.hash = '/'), 1500);
    } catch (err) {
      message.textContent = 'Gagal menambahkan story: ' + err.message;
      message.style.color = 'red';
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Kirim Story';
    }
  }
}
