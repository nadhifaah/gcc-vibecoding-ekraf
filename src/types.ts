export interface ServicePackage {
  id: string;
  code: string;
  name: string;
  price: number;
  turnaround: string;
  description: string;
  deliverables: string[];
}

export interface ServiceAddon {
  id: string;
  name: string;
  price: number;
  turnaround: string;
  description: string;
}

export interface OrderRecord {
  id: string;
  customer_name: string;
  customer_phone: string;
  selected_items: string;
  total_price: number;
  status: 'pending' | 'processed';
  created_at: string;
}

export interface NewOrderPayload {
  customer_name: string;
  customer_phone: string;
  selected_items: string;
  total_price: number;
}
