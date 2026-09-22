import { Check } from 'lucide-react';
import { ServiceAddon } from '../types';
import { formatRupiah } from '../data/catalog';

interface AddonSelectorProps {
  addons: ServiceAddon[];
  selectedAddonIds: string[];
  onToggleAddon: (addonId: string) => void;
}

export default function AddonSelector({
  addons,
  selectedAddonIds,
  onToggleAddon
}: AddonSelectorProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-semibold text-neutral-900">
          2. Layanan Tambahan <span className="text-neutral-500 font-normal">(Opsional)</span>
        </label>
        <span className="text-xs text-neutral-500">Centang untuk menambahkan</span>
      </div>

      <div className="space-y-2.5">
        {addons.map((addon) => {
          const isSelected = selectedAddonIds.includes(addon.id);

          return (
            <button
              key={addon.id}
              type="button"
              onClick={() => onToggleAddon(addon.id)}
              className={`w-full text-left p-4 rounded-lg border transition-colors cursor-pointer min-h-[44px] flex items-center justify-between gap-4 ${
                isSelected
                  ? 'border-neutral-900 bg-neutral-50 shadow-xs'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 ${
                    isSelected
                      ? 'border-neutral-900 bg-neutral-900 text-white'
                      : 'border-neutral-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-neutral-900">
                      {addon.name}
                    </h4>
                    <span className="text-[11px] font-medium px-2 py-0.5 bg-neutral-200/80 text-neutral-700 rounded-lg">
                      {addon.turnaround}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5 leading-relaxed">
                    {addon.description}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-mono font-bold text-sm text-neutral-900">
                  +{formatRupiah(addon.price)}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
