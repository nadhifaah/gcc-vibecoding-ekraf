import { Check } from 'lucide-react';
import { ServicePackage } from '../types';
import { formatRupiah } from '../data/catalog';

interface PackageSelectorProps {
  packages: ServicePackage[];
  selectedId: string;
  onSelect: (pkgId: string) => void;
}

export default function PackageSelector({
  packages,
  selectedId,
  onSelect
}: PackageSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-neutral-900">
          1. Pilih Paket Layanan Utama <span className="text-neutral-500 font-normal">(Wajib)</span>
        </label>
        <span className="text-xs text-neutral-500">Pilihan tunggal</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {packages.map((pkg) => {
          const isSelected = pkg.id === selectedId;

          return (
            <button
              key={pkg.id}
              type="button"
              onClick={() => onSelect(pkg.id)}
              className={`text-left p-5 rounded-lg border transition-colors cursor-pointer min-h-[44px] flex flex-col justify-between ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="inline-block px-2 py-0.5 text-xs font-semibold text-neutral-600 bg-neutral-200/70 rounded-lg mb-1.5">
                      {pkg.code}
                    </span>
                    <h3 className="text-base font-bold text-neutral-900">
                      {pkg.name}
                    </h3>
                  </div>

                  <div
                    className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      isSelected
                        ? 'border-neutral-900 bg-neutral-900 text-white'
                        : 'border-neutral-300 bg-white'
                    }`}
                  >
                    {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>

                <p className="text-xs text-neutral-600 mb-3 leading-relaxed">
                  {pkg.description}
                </p>

                <div className="border-t border-neutral-200/80 pt-3 mb-3">
                  <p className="text-xs font-medium text-neutral-700 mb-2">
                    Item yang dikerjakan:
                  </p>
                  <ul className="space-y-1.5">
                    {pkg.deliverables.map((item, index) => (
                      <li
                        key={index}
                        className="text-xs text-neutral-600 flex items-start gap-2"
                      >
                        <Check className="w-3.5 h-3.5 text-neutral-900 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-xs text-neutral-500 block">Estimasi waktu:</span>
                  <span className="text-xs font-medium text-neutral-800">{pkg.turnaround}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-lg text-neutral-900">
                    {formatRupiah(pkg.price)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
