import { RefreshCw, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { OrderRecord } from '../types';
import { formatRupiah } from '../data/catalog';

interface OrderHistoryProps {
  orders: OrderRecord[];
  status: 'loading' | 'empty' | 'error' | 'data';
  onRefresh: () => void;
  onUpdateStatus: (orderId: string, newStatus: 'pending' | 'processed') => Promise<void>;
  updatingOrderId: string | null;
  errorMessage?: string | null;
}

export default function OrderHistory({
  orders,
  status,
  onRefresh,
  onUpdateStatus,
  updatingOrderId,
  errorMessage
}: OrderHistoryProps) {
  function formatTimestamp(isoString: string): string {
    try {
      const date = new Date(isoString);
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    } catch {
      return isoString;
    }
  }

  function getShortId(id: string): string {
    if (!id) return '#ESTIMATE';
    const cleaned = id.replace(/[^a-zA-Z0-9]/g, '');
    return '#' + cleaned.slice(0, 8).toUpperCase();
  }

  return (
    <section className="bg-white border border-neutral-200 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-neutral-900">
              Riwayat Pesanan & Lead Studio
            </h2>
            <span className="px-2 py-0.5 text-xs font-semibold bg-neutral-100 text-neutral-700 rounded-lg border border-neutral-200">
              {orders.length} Pesanan
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Data tersimpan di tabel orders Supabase dan sinkron secara instan dengan pencatatan lokal.
          </p>
        </div>

        <button
          type="button"
          onClick={onRefresh}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-700 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-lg transition-colors cursor-pointer self-start sm:self-auto min-h-[44px]"
        >
          <RefreshCw className="w-3.5 h-3.5 text-neutral-600" />
          <span>Muat Ulang Data</span>
        </button>
      </div>

      {/* State 1: Loading State */}
      {status === 'loading' && (
        <div className="space-y-3" aria-label="Memuat riwayat pesanan">
          <div className="h-10 bg-neutral-200 animate-pulse rounded-lg w-full" />
          <div className="h-14 bg-neutral-200/80 animate-pulse rounded-lg w-full" />
          <div className="h-14 bg-neutral-200/60 animate-pulse rounded-lg w-full" />
          <div className="h-14 bg-neutral-200/40 animate-pulse rounded-lg w-full" />
        </div>
      )}

      {/* State 2: Empty State */}
      {status === 'empty' && (
        <div className="border border-dashed border-neutral-300 rounded-lg p-8 text-center bg-neutral-50/50">
          <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-200 flex items-center justify-center mx-auto mb-3 text-neutral-500">
            <Clock className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium text-neutral-800 mb-1">
            Belum ada riwayat pesanan.
          </p>
          <p className="text-xs text-neutral-500 max-w-md mx-auto">
            Pesanan baru akan tercatat di sini setelah dikirimkan melalui tombol Send Order to WhatsApp.
          </p>
        </div>
      )}

      {/* State 3: Error State */}
      {status === 'error' && (
        <div className="border border-neutral-300 bg-neutral-50 rounded-lg p-6 text-center">
          <div className="w-10 h-10 rounded-full bg-neutral-100 border border-neutral-300 flex items-center justify-center mx-auto mb-3 text-neutral-700">
            <AlertTriangle className="w-5 h-5 text-neutral-700" />
          </div>
          <p className="text-sm font-medium text-neutral-900 mb-1">
            Gagal memuat riwayat pesanan. Silakan muat ulang halaman.
          </p>
          {errorMessage && (
            <p className="text-xs text-neutral-600 font-mono mb-4 max-w-lg mx-auto bg-white p-2 rounded-lg border border-neutral-200">
              {errorMessage}
            </p>
          )}
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-neutral-900 bg-white hover:bg-neutral-100 border border-neutral-300 rounded-lg transition-colors cursor-pointer min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Coba Lagi</span>
          </button>
        </div>
      )}

      {/* State 4: Data State */}
      {status === 'data' && (
        <div className="overflow-x-auto border border-neutral-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-100/70 border-b border-neutral-200 text-neutral-600 uppercase font-semibold">
              <tr>
                <th className="py-3 px-3.5">ID Pesanan</th>
                <th className="py-3 px-3.5">Waktu</th>
                <th className="py-3 px-3.5">Pelanggan</th>
                <th className="py-3 px-3.5">Nomor HP</th>
                <th className="py-3 px-3.5">Layanan</th>
                <th className="py-3 px-3.5">Total Biaya</th>
                <th className="py-3 px-3.5">Status</th>
                <th className="py-3 px-3.5 text-right">Tindakan Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200 bg-white">
              {orders.map((order) => {
                const isProcessed = order.status === 'processed';
                const isUpdatingThis = updatingOrderId === order.id;

                return (
                  <tr key={order.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-3.5 font-mono font-medium text-neutral-900 whitespace-nowrap">
                      {getShortId(order.id)}
                    </td>
                    <td className="py-3.5 px-3.5 text-neutral-600 whitespace-nowrap">
                      {formatTimestamp(order.created_at)}
                    </td>
                    <td className="py-3.5 px-3.5 font-medium text-neutral-900 whitespace-nowrap">
                      {order.customer_name}
                    </td>
                    <td className="py-3.5 px-3.5 font-mono text-neutral-600 whitespace-nowrap">
                      {order.customer_phone}
                    </td>
                    <td className="py-3.5 px-3.5 text-neutral-700 min-w-[150px]">
                      {order.selected_items}
                    </td>
                    <td className="py-3.5 px-3.5 font-mono font-bold text-neutral-900 whitespace-nowrap">
                      {formatRupiah(order.total_price)}
                    </td>
                    <td className="py-3.5 px-3.5 whitespace-nowrap">
                      {isProcessed ? (
                        <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg px-2.5 py-1 text-[11px] font-semibold">
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                          Processed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-neutral-100 text-neutral-800 border border-neutral-300 rounded-lg px-2.5 py-1 text-[11px] font-semibold">
                          <Clock className="w-3 h-3 text-neutral-600" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-3.5 text-right whitespace-nowrap">
                      {isProcessed ? (
                        <span className="text-[11px] text-neutral-400 font-medium">
                          Selesai diproses
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onUpdateStatus(order.id, 'processed')}
                          disabled={isUpdatingThis}
                          className="inline-flex items-center gap-1 px-3 py-1.5 min-h-[44px] sm:min-h-0 sm:py-1 text-xs font-semibold text-neutral-900 bg-neutral-100 hover:bg-neutral-200 border border-neutral-300 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        >
                          {isUpdatingThis ? 'Menyimpan...' : 'Mark as Processed'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
