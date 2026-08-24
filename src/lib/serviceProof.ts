import type { ServiceMethod, ServedDetails } from '@/types/record';

export const SERVICE_METHODS: {
  id: ServiceMethod;
  title: string;
  description: string;
  relationship: string;
  remarks: string;
}[] = [
  {
    id: 'person',
    title: 'Served to the person',
    description: 'Handed the summons to the addressee in person.',
    relationship: 'Addressee',
    remarks: 'Served to addressee in person.',
  },
  {
    id: 'family',
    title: 'Served to a family member',
    description: 'Served on an adult family member at the residence.',
    relationship: 'Family member',
    remarks: 'Served to an adult family member at the residence.',
  },
  {
    id: 'affixed',
    title: 'Affixed to the residence',
    description: 'Affixed at the last known residence after personal service could not be completed.',
    relationship: 'Affixed at residence',
    remarks: 'Affixed to the residence after unsuccessful personal service.',
  },
];

export function serviceMethodMeta(method: ServiceMethod) {
  return SERVICE_METHODS.find((m) => m.id === method) ?? SERVICE_METHODS[0];
}

export function formatCoordinates(lat: number, lng: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lng).toFixed(4)}° ${ew}`;
}

export function formatServiceTime(iso: string): string {
  return new Date(iso).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function osmEmbedUrl(lat: number, lng: number): string {
  const dLng = 0.012;
  const dLat = 0.008;
  const bbox = `${lng - dLng},${lat - dLat},${lng + dLng},${lat + dLat}`;
  return `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${lat}%2C${lng}`;
}

export function buildServedDetails(
  method: ServiceMethod,
  personName: string,
  familyMemberName?: string,
): ServedDetails {
  const meta = serviceMethodMeta(method);
  const recipientName =
    method === 'family' && familyMemberName?.trim() ? familyMemberName.trim() : personName;
  return {
    method,
    recipientName,
    relationship: meta.relationship,
    familyMemberName: method === 'family' ? familyMemberName?.trim() : undefined,
  };
}

export function captureGeoPosition(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not available on this device.'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          latitude: Number(pos.coords.latitude.toFixed(6)),
          longitude: Number(pos.coords.longitude.toFixed(6)),
        }),
      (err) => reject(new Error(err.message || 'Unable to read GPS location.')),
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 0 },
    );
  });
}

export function compressImageFile(file: File, maxSize = 960, quality = 0.72): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read the photo.'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not load the photo.'));
      img.onload = () => {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not process the photo.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', quality));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}
