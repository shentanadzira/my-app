import L from './map/leaflet-config.js';

export default class MapPage {
  constructor() {
    this.map = null;
  }

  render() {
    return `<div id="map-page-map" style="height: 500px; width: 100%;"></div>`;
  }

  afterRender() {
    const mapContainer = document.getElementById('map-page-map');

    if (!mapContainer) {
      console.warn('Map container belum tersedia di DOM');
      return;
    }

    if (mapContainer._leaflet_id) {
      mapContainer._leaflet_id = null;
      mapContainer.innerHTML = '';
    }

    requestAnimationFrame(() => {
      this.map = L.map('map-page-map').setView([-6.2, 106.816], 13);

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors',
      }).addTo(this.map);

      L.marker([-6.2, 106.816])
        .addTo(this.map)
        .bindPopup('Ini marker contoh')
        .openPopup();
    });
  }
}
