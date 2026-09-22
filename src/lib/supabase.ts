import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { OrderRecord, NewOrderPayload } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const LOCAL_STORAGE_ORDERS_KEY = 'sneakerclean_local_orders';

export function isSupabaseConfigured(): boolean {
  return (
    typeof supabaseUrl === 'string' &&
    supabaseUrl.trim().length > 0 &&
    !supabaseUrl.includes('your-project') &&
    typeof supabaseAnonKey === 'string' &&
    supabaseAnonKey.trim().length > 0 &&
    !supabaseAnonKey.includes('your-anon-key')
  );
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }
  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
    } catch {
      supabaseInstance = null;
    }
  }
  return supabaseInstance;
}

// Local Storage Fallback Helpers
function getLocalOrders(): OrderRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ORDERS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveLocalOrder(order: OrderRecord): void {
  try {
    const current = getLocalOrders();
    const updated = [order, ...current.filter((item) => item.id !== order.id)];
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));
  } catch {
    // ignore storage quota issues
  }
}

function updateLocalOrderStatus(orderId: string, status: 'pending' | 'processed'): boolean {
  try {
    const current = getLocalOrders();
    const updated = current.map((item) =>
      item.id === orderId ? { ...item, status } : item
    );
    localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

export async function fetchOrders(): Promise<{ orders: OrderRecord[]; error: Error | null }> {
  const client = getSupabaseClient();
  if (!client) {
    // Return local orders
    return { orders: getLocalOrders(), error: null };
  }

  try {
    const { data, error } = await client
      .from('orders')
      .select('id, customer_name, customer_phone, selected_items, total_price, status, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      // Fallback to local storage if network or query error
      const local = getLocalOrders();
      if (local.length > 0) {
        return { orders: local, error: null };
      }
      return { orders: [], error: new Error(error.message) };
    }

    const remoteOrders = (data as OrderRecord[]) || [];
    // Sync to local cache
    if (remoteOrders.length > 0) {
      localStorage.setItem(LOCAL_STORAGE_ORDERS_KEY, JSON.stringify(remoteOrders));
    }
    return { orders: remoteOrders, error: null };
  } catch (err: unknown) {
    const local = getLocalOrders();
    if (local.length > 0) {
      return { orders: local, error: null };
    }
    const message = err instanceof Error ? err.message : 'Gagal menghubungi database';
    return { orders: [], error: new Error(message) };
  }
}

export async function createOrder(
  payload: NewOrderPayload
): Promise<{ order: OrderRecord; isRemote: boolean; error: Error | null }> {
  const client = getSupabaseClient();
  const generatedLocalId = 'order_' + Math.random().toString(36).substring(2, 11);
  const nowIso = new Date().toISOString();

  const fallbackRecord: OrderRecord = {
    id: generatedLocalId,
    customer_name: payload.customer_name,
    customer_phone: payload.customer_phone,
    selected_items: payload.selected_items,
    total_price: payload.total_price,
    status: 'pending',
    created_at: nowIso
  };

  if (!client) {
    saveLocalOrder(fallbackRecord);
    return { order: fallbackRecord, isRemote: false, error: null };
  }

  try {
    const { data, error } = await client
      .from('orders')
      .insert([
        {
          customer_name: payload.customer_name,
          customer_phone: payload.customer_phone,
          selected_items: payload.selected_items,
          total_price: payload.total_price,
          status: 'pending'
        }
      ])
      .select()
      .single();

    if (error || !data) {
      saveLocalOrder(fallbackRecord);
      return {
        order: fallbackRecord,
        isRemote: false,
        error: new Error(error ? error.message : 'Penyimpanan database gagal, pesanan dicatat secara lokal.')
      };
    }

    const savedRemote: OrderRecord = {
      id: data.id,
      customer_name: data.customer_name,
      customer_phone: data.customer_phone,
      selected_items: data.selected_items,
      total_price: Number(data.total_price),
      status: (data.status as 'pending' | 'processed') || 'pending',
      created_at: data.created_at || nowIso
    };

    saveLocalOrder(savedRemote);
    return { order: savedRemote, isRemote: true, error: null };
  } catch (err: unknown) {
    saveLocalOrder(fallbackRecord);
    const message = err instanceof Error ? err.message : 'Koneksi database bermasalah';
    return {
      order: fallbackRecord,
      isRemote: false,
      error: new Error(message)
    };
  }
}

export async function updateOrderStatus(
  orderId: string,
  newStatus: 'pending' | 'processed'
): Promise<{ success: boolean; error: Error | null }> {
  // Always update local cache first
  updateLocalOrderStatus(orderId, newStatus);

  const client = getSupabaseClient();
  if (!client || orderId.startsWith('order_')) {
    return { success: true, error: null };
  }

  try {
    const { error } = await client
      .from('orders')
      .update({ status: newStatus })
      .eq('id', orderId);

    if (error) {
      return { success: false, error: new Error(error.message) };
    }
    return { success: true, error: null };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Gagal memperbarui status';
    return { success: false, error: new Error(message) };
  }
}
