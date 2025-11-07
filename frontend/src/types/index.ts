export interface Product {
  id: string;
  name: string;
  sku: string;
  initialStock: number;
  stockOut: number;
  pendingStock: number;
  realStock: number;
  notes: string;
  batchNumber?: string;
  category: string;
  costPriceRMB: number;
  costPriceIDR: number;
  sellingPrice: number;
  margin: number;
  lastUpdated: Date;
}

export interface Shipment {
  id: string;
  date: Date;
  method: 'sea' | 'air';
  containerNumber?: string;
  awbNumber?: string;
  estimatedArrival: Date;
  totalProducts: number;
  status: 'processing' | 'in-transit' | 'received';
  notes: string;
  forwarderName: string;
  products?: string[]; // product IDs
}

export interface StockUpdate {
  productId: string;
  previousStock: number;
  newStock: number;
  updateType: 'manual' | 'sale' | 'shipment';
  timestamp: Date;
  notes?: string;
}

export interface ExchangeRate {
  rmbToIdr: number;
  lastUpdated: Date;
}