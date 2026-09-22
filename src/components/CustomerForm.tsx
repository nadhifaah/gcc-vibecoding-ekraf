import { User, Phone } from 'lucide-react';
import { sanitizePhoneNumber } from '../data/catalog';

interface CustomerFormProps {
  customerName: string;
  customerPhone: string;
  onNameChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
  nameError?: string;
  phoneError?: string;
}

export default function CustomerForm({
  customerName,
  customerPhone,
  onNameChange,
  onPhoneChange,
  nameError,
  phoneError
}: CustomerFormProps) {
  const sanitized = sanitizePhoneNumber(customerPhone);
  const showSanitizedNotice = customerPhone.trim().startsWith('0') && sanitized.startsWith('62');

  return (
    <div className="space-y-4 pt-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-neutral-900">
          3. Informasi Pelanggan
        </label>
        <span className="text-xs text-neutral-500">Untuk koordinasi penjemputan</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Customer Name */}
        <div>
          <label htmlFor="customer-name" className="block text-xs font-medium text-neutral-700 mb-1.5">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <User className="w-4 h-4" />
            </div>
            <input
              id="customer-name"
              type="text"
              value={customerName}
              onChange={(e) => onNameChange(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className={`w-full min-h-[44px] h-11 pl-9 pr-3 rounded-lg border text-sm text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-colors ${
                nameError ? 'border-red-500 bg-red-50/20' : 'border-neutral-200'
              }`}
            />
          </div>
          {nameError ? (
            <p className="mt-1 text-xs text-red-600">{nameError}</p>
          ) : (
            <p className="mt-1 text-[11px] text-neutral-500">Minimal 2 karakter huruf.</p>
          )}
        </div>

        {/* WhatsApp Phone */}
        <div>
          <label htmlFor="customer-phone" className="block text-xs font-medium text-neutral-700 mb-1.5">
            Nomor WhatsApp <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
              <Phone className="w-4 h-4" />
            </div>
            <input
              id="customer-phone"
              type="tel"
              value={customerPhone}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder="Contoh: 081234567890"
              className={`w-full min-h-[44px] h-11 pl-9 pr-3 rounded-lg border text-sm text-neutral-900 placeholder:text-neutral-400 bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-colors ${
                phoneError ? 'border-red-500 bg-red-50/20' : 'border-neutral-200'
              }`}
            />
          </div>
          {phoneError ? (
            <p className="mt-1 text-xs text-red-600">{phoneError}</p>
          ) : showSanitizedNotice ? (
            <p className="mt-1 text-[11px] text-neutral-600">
              Format WhatsApp: <span className="font-mono text-neutral-900 font-semibold">{sanitized}</span>
            </p>
          ) : (
            <p className="mt-1 text-[11px] text-neutral-500">
              Gunakan format lokal (08...) atau internasional (628...).
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
