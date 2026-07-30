export interface Area {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export const areas: Area[] = [
  { id: 'genclik', name: 'Gənclik', lat: 40.4103, lng: 49.8478 },
  { id: 'narimanov', name: 'Nərimanov', lat: 40.4125, lng: 49.8891 },
  { id: '28-may', name: '28 May', lat: 40.3774, lng: 49.8464 },
  { id: 'nizami', name: 'Nizami', lat: 40.3947, lng: 49.8560 },
  { id: 'elmler-akademiyasi', name: 'Elmlər Akademiyası', lat: 40.3736, lng: 49.8422 },
  { id: 'insaatcilar', name: 'İnşaatçılar', lat: 40.4231, lng: 49.8358 },
  { id: 'xetai', name: 'Xətai', lat: 40.3985, lng: 49.8791 },
  { id: 'ehmedli', name: 'Əhmədli', lat: 40.3805, lng: 49.9352 },
  { id: 'neftcilar', name: 'Neftçilər', lat: 40.4043, lng: 49.9332 },
  { id: 'koroglu', name: 'Koroğlu', lat: 40.4292, lng: 49.8901 },
];

export const BAKU_CENTER: [number, number] = [40.3947, 49.8672];

export function getArea(id: string) {
  return areas.find((a) => a.id === id);
}

// Small deterministic jitter so multiple branches in the same area don't overlap exactly.
export function jitter(lat: number, lng: number, seed: number): [number, number] {
  const dLat = (((seed * 37) % 21) - 10) * 0.0009;
  const dLng = (((seed * 53) % 21) - 10) * 0.0009;
  return [lat + dLat, lng + dLng];
}
