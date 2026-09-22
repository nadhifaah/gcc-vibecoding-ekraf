import { Clock, ShieldCheck } from 'lucide-react';

export default function Header() {
  return (
    <header className="border-b border-neutral-200 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-800 border border-neutral-200">
                Sneaker Care Specialist
              </span>
              <span className="text-xs text-neutral-500 flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                Workshop Siap Menerima Order
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
              SneakerClean Studio
            </h1>
            <p className="mt-1 text-sm text-neutral-600 max-w-2xl">
              Kalkulator estimasi harga perawatan dan restorasi sepatu. Pilih paket perawatan, tentukan layanan tambahan, dan konfirmasi pesanan langsung melalui WhatsApp.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-auto text-xs text-neutral-500 pt-2 sm:pt-0">
            <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg">
              <Clock className="w-3.5 h-3.5 text-neutral-700" />
              <span>Pengerjaan Cermat</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 bg-neutral-50 border border-neutral-200 rounded-lg">
              <ShieldCheck className="w-3.5 h-3.5 text-neutral-700" />
              <span>Garansi Bersih</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
