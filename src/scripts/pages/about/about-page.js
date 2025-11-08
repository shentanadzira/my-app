export default class AboutPage {
  async render() {
    return `<section class="container about-page">
      <h1>Tentang Aplikasi</h1>
      <article>
          <p>
            Aplikasi ini dikembangkan sebagai bagian dari proyek submission Dicoding.
            Tujuannya adalah untuk menampilkan <b>cerita-cerita pengguna</b> di seluruh Indonesia
            dalam bentuk peta interaktif.
          </p>
      </section>
    `;
  }

  async afterRender() {}
}
