import { ServicePackage, ServiceAddon } from '../types';

export const SERVICE_PACKAGES: ServicePackage[] = [
  {
    id: 'package-a',
    code: 'Paket A',
    name: 'Basic Clean',
    price: 50000,
    turnaround: '2-3 hari kerja',
    description: 'Pembersihan standar permukaan luar untuk penggunaan harian.',
    deliverables: [
      'Cuci permukaan atas (upper) standar',
      'Pembersihan midsole luar',
      'Penyegaran dan semprot deodorizing antibakteri',
      'Pengeringan bertahap suhu ruang'
    ]
  },
  {
    id: 'package-b',
    code: 'Paket B',
    name: 'Deep Clean',
    price: 90000,
    turnaround: '3-4 hari kerja',
    description: 'Pembersihan menyeluruh interior dan eksterior hingga serat terdalam.',
    deliverables: [
      'Ekstraksi mendalam interior dan eksterior',
      'Pencucian insole dan detailing tali sepatu (laces)',
      'Scrubbing mendalam midsole dan outsole tapak',
      'Perawatan treatment antibakteri dan antijamur'
    ]
  }
];

export const SERVICE_ADDONS: ServiceAddon[] = [
  {
    id: 'express-delivery',
    name: 'Express Delivery',
    price: 25000,
    turnaround: '< 24 jam',
    description: 'Layanan pengerjaan prioritas selesai dalam 24 jam dan jadwal antar-jemput terkoordinasi.'
  }
];

export function formatRupiah(amount: number): string {
  const formattedNumber = new Intl.NumberFormat('id-ID', {
    maximumFractionDigits: 0
  }).format(amount);
  return `Rp${formattedNumber}`;
}

export function sanitizePhoneNumber(phone: string): string {
  let cleaned = phone.replace(/[^0-9]/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.slice(1);
  } else if (cleaned.startsWith('8')) {
    cleaned = '62' + cleaned;
  }
  return cleaned;
}

export function getBusinessPhoneNumber(): string {
  const envPhone = import.meta.env.VITE_BUSINESS_PHONE;
  if (envPhone && typeof envPhone === 'string' && envPhone.trim().length > 0) {
    return sanitizePhoneNumber(envPhone.trim());
  }
  return '6281234567890';
}

export function buildWhatsAppLink(params: {
  businessPhone: string;
  orderId: string;
  customerName: string;
  customerPhone: string;
  packageName: string;
  addonName?: string;
  totalPrice: number;
}): string {
  const shortId = params.orderId ? params.orderId.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8).toUpperCase() : 'ESTIMATE';
  const addonText = params.addonName ? params.addonName : 'Tidak ada';
  const formattedTotal = formatRupiah(params.totalPrice);

  const messageLines = [
    'Halo SneakerClean Studio, saya ingin mengonfirmasi pesanan:',
    '',
    `ID Pesanan: #${shortId}`,
    `Nama: ${params.customerName.trim()}`,
    `Nomor HP: ${params.customerPhone.trim()}`,
    `Layanan: ${params.packageName}`,
    `Add-on: ${addonText}`,
    `Total Estimasi: ${formattedTotal}`,
    '',
    'Mohon informasi jadwal dan instruksi penyerahan sepatu. Terima kasih.'
  ];

  const fullText = messageLines.join('\n');
  return `https://wa.me/${params.businessPhone}?text=${encodeURIComponent(fullText)}`;
}
