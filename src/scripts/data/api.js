import CONFIG from '../config';

const ENDPOINTS = {
  STORIES: `${CONFIG.BASE_URL}/stories`,
};

export async function getData() {
  const response = await fetch(ENDPOINTS.STORIES);
  if (!response.ok) throw new Error('Gagal mengambil data');
  return await response.json();
}
