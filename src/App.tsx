import { useState, useEffect, useMemo } from 'react';
import Header from './components/Header';
import PackageSelector from './components/PackageSelector';
import AddonSelector from './components/AddonSelector';
import CustomerForm from './components/CustomerForm';
import PriceSummaryBox from './components/PriceSummaryBox';
import OrderHistory from './components/OrderHistory';
import {
  SERVICE_PACKAGES,
  SERVICE_ADDONS,
  sanitizePhoneNumber,
  getBusinessPhoneNumber,
  buildWhatsAppLink
} from './data/catalog';
import { fetchOrders, createOrder, updateOrderStatus } from './lib/supabase';
import { OrderRecord } from './types';

export default function App() {
  // Configurator state
  const [selectedPackageId, setSelectedPackageId] = useState<string>('package-a');
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>([]);
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');

  // Validation state
  const [nameError, setNameError] = useState<string | undefined>(undefined);
  const [phoneError, setPhoneError] = useState<string | undefined>(undefined);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [lastWhatsAppLink, setLastWhatsAppLink] = useState<string | null>(null);

  // Order history state
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [historyStatus, setHistoryStatus] = useState<'loading' | 'empty' | 'error' | 'data'>('loading');
  const [historyErrorMessage, setHistoryErrorMessage] = useState<string | null>(null);
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);

  // Active items calculation
  const selectedPackage = useMemo(() => {
    return SERVICE_PACKAGES.find((pkg) => pkg.id === selectedPackageId) || SERVICE_PACKAGES[0];
  }, [selectedPackageId]);

  const selectedAddon = useMemo(() => {
    if (selectedAddonIds.length === 0) return null;
    return SERVICE_ADDONS.find((addon) => addon.id === selectedAddonIds[0]) || null;
  }, [selectedAddonIds]);

  const totalPrice = useMemo(() => {
    const base = selectedPackage.price;
    const addonPrice = selectedAddon ? selectedAddon.price : 0;
    return base + addonPrice;
  }, [selectedPackage, selectedAddon]);

  // Initial fetch of order history
  useEffect(() => {
    loadOrders();
  }, []);

  async function loadOrders() {
    setHistoryStatus('loading');
    setHistoryErrorMessage(null);

    const result = await fetchOrders();
    if (result.error && result.orders.length === 0) {
      setHistoryStatus('error');
      setHistoryErrorMessage(result.error.message);
      return;
    }

    setOrders(result.orders);
    if (result.orders.length === 0) {
      setHistoryStatus('empty');
    } else {
      setHistoryStatus('data');
    }
  }

  function handleToggleAddon(addonId: string) {
    setSelectedAddonIds((prev) => {
      if (prev.includes(addonId)) {
        return [];
      }
      return [addonId];
    });
  }

  function validateInputs(): boolean {
    let isValid = true;
    const trimmedName = customerName.trim();
    const sanitizedDigits = customerPhone.replace(/[^0-9]/g, '');

    if (!trimmedName || trimmedName.length < 2) {
      setNameError('Nama lengkap wajib diisi minimal 2 karakter.');
      isValid = false;
    } else {
      setNameError(undefined);
    }

    if (!sanitizedDigits || sanitizedDigits.length < 9) {
      setPhoneError('Nomor WhatsApp wajib diisi minimal 9 digit angka.');
      isValid = false;
    } else {
      setPhoneError(undefined);
    }

    return isValid;
  }

  async function handleSubmitOrder() {
    setSubmissionError(null);

    // Step 1: Input Validation
    if (!validateInputs()) {
      return;
    }

    setIsSubmitting(true);

    // Step 2: Early Tab Initialization to prevent browser popup blockers
    let popupTab: Window | null = null;
    try {
      popupTab = window.open('about:blank', '_blank');
    } catch {
      popupTab = null;
    }

    const sanitizedPhone = sanitizePhoneNumber(customerPhone);
    const selectedItemsSummary = selectedAddon
      ? `${selectedPackage.name} + ${selectedAddon.name}`
      : selectedPackage.name;

    try {
      // Step 3: Insert record into Supabase "orders" table
      const saveResult = await createOrder({
        customer_name: customerName.trim(),
        customer_phone: sanitizedPhone,
        selected_items: selectedItemsSummary,
        total_price: totalPrice
      });

      const orderId = saveResult.order.id;

      // Step 4: Construct WhatsApp deep link
      const businessPhone = getBusinessPhoneNumber();
      const whatsappUrl = buildWhatsAppLink({
        businessPhone,
        orderId,
        customerName: customerName.trim(),
        customerPhone: sanitizedPhone,
        packageName: selectedPackage.name,
        addonName: selectedAddon ? selectedAddon.name : undefined,
        totalPrice
      });

      setLastWhatsAppLink(whatsappUrl);

      // Step 5: Assign deep link to pre-opened tab
      if (popupTab && !popupTab.closed) {
        popupTab.location.href = whatsappUrl;
      } else {
        // Fallback if popup blocked
        window.location.href = whatsappUrl;
      }

      // Step 6: Refresh Order History list
      await loadOrders();

      if (saveResult.error) {
        setSubmissionError(
          'Catatan: Database sedang bermasalah. Pesanan tetap dialihkan ke WhatsApp dan disimpan di memori lokal.'
        );
      }
    } catch (err: unknown) {
      if (popupTab && !popupTab.closed) {
        popupTab.close();
      }
      const message = err instanceof Error ? err.message : 'Terjadi kendala saat memproses pesanan.';
      setSubmissionError(message);

      // Even if database fails completely, construct WhatsApp link so lead is never lost
      const businessPhone = getBusinessPhoneNumber();
      const fallbackUrl = buildWhatsAppLink({
        businessPhone,
        orderId: 'FALLBACK',
        customerName: customerName.trim(),
        customerPhone: sanitizedPhone,
        packageName: selectedPackage.name,
        addonName: selectedAddon ? selectedAddon.name : undefined,
        totalPrice
      });
      setLastWhatsAppLink(fallbackUrl);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateStatus(orderId: string, newStatus: 'pending' | 'processed') {
    setUpdatingOrderId(orderId);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      if (result.success) {
        setOrders((prev) =>
          prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
        );
      } else {
        alert(result.error ? result.error.message : 'Gagal memperbarui status order.');
      }
    } finally {
      setUpdatingOrderId(null);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col">
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 space-y-10">
        {/* Main Grid: Configurator (Left) & Sticky Summary (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 cols): Service selection & customer info */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">
            <section className="bg-white border border-neutral-200 rounded-lg p-6 space-y-6">
              <PackageSelector
                packages={SERVICE_PACKAGES}
                selectedId={selectedPackageId}
                onSelect={(id) => setSelectedPackageId(id)}
              />

              <div className="border-t border-neutral-200 pt-4">
                <AddonSelector
                  addons={SERVICE_ADDONS}
                  selectedAddonIds={selectedAddonIds}
                  onToggleAddon={handleToggleAddon}
                />
              </div>

              <div className="border-t border-neutral-200 pt-4">
                <CustomerForm
                  customerName={customerName}
                  customerPhone={customerPhone}
                  onNameChange={(val) => {
                    setCustomerName(val);
                    if (nameError) setNameError(undefined);
                  }}
                  onPhoneChange={(val) => {
                    setCustomerPhone(val);
                    if (phoneError) setPhoneError(undefined);
                  }}
                  nameError={nameError}
                  phoneError={phoneError}
                />
              </div>
            </section>
          </div>

          {/* Right Column (5 cols / 4 cols): Sticky Price Summary */}
          <div className="lg:col-span-5 xl:col-span-4">
            <PriceSummaryBox
              selectedPackage={selectedPackage}
              selectedAddon={selectedAddon}
              totalPrice={totalPrice}
              customerName={customerName}
              customerPhone={customerPhone}
              isSubmitting={isSubmitting}
              onSubmitOrder={handleSubmitOrder}
              lastWhatsAppLink={lastWhatsAppLink}
              submissionError={submissionError}
            />
          </div>
        </div>

        {/* Bottom Section: Order History Component with 4 states */}
        <div className="pt-4 border-t border-neutral-200">
          <OrderHistory
            orders={orders}
            status={historyStatus}
            onRefresh={loadOrders}
            onUpdateStatus={handleUpdateStatus}
            updatingOrderId={updatingOrderId}
            errorMessage={historyErrorMessage}
          />
        </div>
      </main>

      <footer className="border-t border-neutral-200 bg-white py-6 mt-12 text-xs text-neutral-500">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>SneakerClean Studio. Custom Sneaker Cleaning & Restoration.</p>
          <p className="font-mono text-[11px] text-neutral-400">
            Sistem Estimator Layanan dan Lead WhatsApp
          </p>
        </div>
      </footer>
    </div>
  );
}
