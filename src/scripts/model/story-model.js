const BASE_URL = 'https://story-api.dicoding.dev/v1';

export default class StoryModel {
  constructor(token) {
    this.token = token || localStorage.getItem('token');
    if (!this.token) console.warn('Token kosong, login dulu!');
  }

  async getStories(page = 1, size = 20) {
    if (!this.token) {
      console.error('Token belum tersedia. Login dulu sebelum fetch stories.');
      return [];
    }
    try {
      const response = await fetch(`${BASE_URL}/stories?location=1&page=${page}&size=${size}`, {
        headers: { Authorization: `Bearer ${this.token}` }
      });
      const data = await response.json();
      if (data.error) {
        console.error('Gagal ambil stories:', data.message);
        return [];
      }
      return data.listStory || [];
    } catch (err) {
      console.error('Terjadi kesalahan fetch stories:', err);
      return [];
    }
  }

  async addStory(formData) {
    if (!this.token) {
      return { error: true, message: 'Token tidak ditemukan. Silakan login dulu.' };
    }
    try {
      const response = await fetch(`${BASE_URL}/stories`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${this.token}` },
        body: formData
      });
      return await response.json();
    } catch (err) {
      console.error('Gagal menambah story:', err);
      return { error: true, message: err.message };
    }
  }
}
