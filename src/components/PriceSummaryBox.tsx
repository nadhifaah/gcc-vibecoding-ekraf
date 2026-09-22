import { MessageCircle, AlertCircle, ArrowRight } from 'lucide-react';
import { ServicePackage, ServiceAddon } from '../types';
import { formatRupiah } from '../data/catalog';

interface PriceSummaryBoxProps {
  selectedPackage: ServicePackage;
  selectedAddon: ServiceAddon | null;
  totalPrice: number;
  customerName: string;
  customerPhone: string;
  isSubmitting: boolean;
  onSubmitOrder: () => void;
  lastWhatsAppLink?: string | null;
  submissionError?: string | null;
}

export default function PriceSummaryBox({
  selectedPackage,
  selectedAddon,
  totalPrice,
  customerName,
  customerPhone,
  isSubmitting,
  onSubmitOrder,
  lastWhatsAppLink,
  submissionError
}: PriceSummaryBoxProps) {
  const isFormFilled = customerName.trim().length >= 2 && customerPhone.replace(/[^0-9]/g, '').length >= 9;

  return (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 sticky top-6 shadow-xs">
      <div className="border-b border-neutral-200 pb-4 mb-4">
        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider block mb-1">
          Ringkasan Estimasi
        </span>
        <h2 className="text-lg font-bold text-neutral-900">
          Rincian Biaya Layanan
        </h2>
      </div>

      {/* Itemized Calculation */}
      <div className="space-y-3 text-sm border-b border-neutral-200 pb-4 mb-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="font-medium text-neutral-900 block">{selectedPackage.name}</span>
            <span className="text-xs text-neutral-500">{selectedPackage.code} ({selectedPackage.turnaround})</span>
          </div>
          <span className="font-mono font-medium text-neutral-900">
            {formatRupiah(selectedPackage.price)}
          </span>
        </div>

        <div className="flex justify-between items-start">
          <div>
            <span className="font-medium text-neutral-900 block">Layanan Tambahan:</span>
            <span className="text-xs text-neutral-500">
              {selectedAddon ? selectedAddon.name : 'Tidak ada add-on'}
            </span>
          </div>
          <span className="font-mono font-medium text-neutral-900">
            {selectedAddon ? formatRupiah(selectedAddon.price) : 'Rp0'}
          </span>
        </div>
      </div>

      {/* Total Display */}
      <div className="mb-5">
        <div className="flex items-baseline justify-between mb-1">
          <span className="text-xs font-semibold text-neutral-600 uppercase tracking-wide">
            Total Estimasi Harga
          </span>
          <span className="text-[11px] text-neutral-500">
            Rentang: Rp50.000 - Rp115.000
          </span>
        </div>
        <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
          <span className="text-xs text-neutral-500">Total Akhir:</span>
          <span className="font-mono font-bold text-3xl text-neutral-900 tracking-tight">
            {formatRupiah(totalPrice)}
          </span>
        </div>
      </div>

      {/* Customer summary check */}
      <div className="text-xs text-neutral-600 bg-neutral-50 p-3 rounded-lg border border-neutral-200 mb-5 space-y-1">
        <div className="flex justify-between">
          <span className="text-neutral-500">Nama:</span>
          <span className="font-medium text-neutral-900 truncate max-w-[170px]">
            {customerName.trim() || '(belum diisi)'}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-neutral-500">WhatsApp:</span>
          <span className="font-medium text-neutral-900 truncate max-w-[170px]">
            {customerPhone.trim() || '(belum diisi)'}
          </span>
        </div>
      </div>

      {/* Error notification banner if any */}
      {submissionError && (
        <div className="mb-4 p-3 bg-neutral-100 border border-neutral-300 rounded-lg text-xs text-neutral-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-neutral-700 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-medium">{submissionError}</p>
            {lastWhatsAppLink && (
              <a
                href={lastWhatsAppLink}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
              >
                Buka WhatsApp Secara Langsung <ArrowRight className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* Primary CTA */}
      <button
        type="button"
        id="btn-send-whatsapp"
        onClick={onSubmitOrder}
        disabled={isSubmitting}
        className="w-full min-h-[44px] h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-neutral-300 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed shadow-xs"
      >
        <MessageCircle className="w-5 h-5 fill-white text-emerald-600" />
        <span className="text-sm font-semibold">
          {isSubmitting ? 'Memproses Pesanan...' : 'Send Order to WhatsApp'}
        </span>
      </button>

      <p className="mt-3 text-[11px] text-center text-neutral-500 leading-normal">
        Data pesanan akan dicatat di sistem sebelum Anda diarahkan ke chat WhatsApp resmi SneakerClean Studio.
      </p>

      {!isFormFilled && (
        <p className="mt-2 text-[11px] text-center text-amber-700 font-medium">
          Lengkapi nama dan nomor WhatsApp di formulir sebelah kiri untuk melanjutkan.
        </p>
      )}
    </div>
  );
}
