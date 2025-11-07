import { Product, Shipment, StockUpdate, ExchangeRate } from '@/types';
import { calculateRealStock } from './utils';

const STORAGE_KEYS = {
  PRODUCTS: 'miu-products',
  SHIPMENTS: 'miu-shipments',
  STOCK_UPDATES: 'miu-stock-updates',
  EXCHANGE_RATE: 'miu-exchange-rate'
} as const;

// Default exchange rate: 1 RMB = 1850 IDR
const DEFAULT_EXCHANGE_RATE = 1850;

// Default products based on the plan
const DEFAULT_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Premium Leather Steering Cover',
    sku: 'CSK001',
    initialStock: 100,
    stockOut: 20,
    pendingStock: 5,
    realStock: 75,
    notes: 'Batch #A01',
    batchNumber: 'A01',
    category: 'Interior',
    costPriceRMB: 8.5,
    costPriceIDR: 18500,
    sellingPrice: 35000,
    margin: 89,
    lastUpdated: new Date()
  },
  {
    id: '2',
    name: 'Universal Car Mat',
    sku: 'KMU002',
    initialStock: 80,
    stockOut: 10,
    pendingStock: 3,
    realStock: 67,
    notes: 'Batch #B02',
    batchNumber: 'B02',
    category: 'Interior',
    costPriceRMB: 15,
    costPriceIDR: 27750,
    sellingPrice: 60000,
    margin: 116,
    lastUpdated: new Date()
  },
  {
    id: '3',
    name: 'High-End Silicone Wiper',
    sku: 'WSH003',
    initialStock: 120,
    stockOut: 15,
    pendingStock: 10,
    realStock: 95,
    notes: 'Batch #C03',
    batchNumber: 'C03',
    category: 'Exterior',
    costPriceRMB: 6,
    costPriceIDR: 11100,
    sellingPrice: 28000,
    margin: 152,
    lastUpdated: new Date()
  }
];

// Default shipments based on the plan
const DEFAULT_SHIPMENTS: Shipment[] = [
  {
    id: '1',
    date: new Date('2025-10-10'),
    method: 'sea',
    containerNumber: 'CNT-SEA-8821',
    estimatedArrival: new Date('2025-11-05'),
    totalProducts: 250,
    status: 'in-transit',
    notes: 'ETA confirmed',
    forwarderName: 'DHL Global Forwarding',
    products: []
  },
  {
    id: '2',
    date: new Date('2025-10-15'),
    method: 'air',
    awbNumber: 'AWB-AIR-5509',
    estimatedArrival: new Date('2025-10-30'),
    totalProducts: 50,
    status: 'received',
    notes: 'Items stored in warehouse',
    forwarderName: 'FedEx Express',
    products: []
  },
  {
    id: '3',
    date: new Date('2025-10-25'),
    method: 'sea',
    containerNumber: 'CNT-SEA-8890',
    estimatedArrival: new Date('2025-11-15'),
    totalProducts: 300,
    status: 'processing',
    notes: 'Loading in Guangzhou',
    forwarderName: 'Maersk Line',
    products: []
  }
];

// Generic storage functions
function getFromStorage<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error(`Error reading ${key} from localStorage:`, error);
    return defaultValue;
  }
}

function setToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error saving ${key} to localStorage:`, error);
  }
}

// Product storage functions
export function getProducts(): Product[] {
  const products = getFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  return products.map(product => ({
    ...product,
    date: new Date(product.lastUpdated)
  }));
}

export function saveProducts(products: Product[]): void {
  setToStorage(STORAGE_KEYS.PRODUCTS, products);
}

export function updateProduct(productId: string, updates: Partial<Product>): void {
  const products = getProducts();
  const index = products.findIndex(p => p.id === productId);

  if (index !== -1) {
    products[index] = {
      ...products[index],
      ...updates,
      lastUpdated: new Date()
    };

    // Recalculate real stock if stock values changed
    if ('initialStock' in updates || 'stockOut' in updates || 'pendingStock' in updates) {
      products[index].realStock = products[index].initialStock -
        (products[index].stockOut + products[index].pendingStock);
    }

    // Recalculate cost price and margin if RMB price or exchange rate changed
    if ('costPriceRMB' in updates) {
      const exchangeRate = getExchangeRate();
      products[index].costPriceIDR = convertRMBtoIDR(products[index].costPriceRMB, exchangeRate.rmbToIdr);
      products[index].margin = calculateMargin(products[index].sellingPrice, products[index].costPriceIDR);
    }

    // Recalculate margin if selling price changed
    if ('sellingPrice' in updates) {
      products[index].margin = calculateMargin(products[index].sellingPrice, products[index].costPriceIDR);
    }

    saveProducts(products);
  }
}

export function addProduct(product: Omit<Product, 'id' | 'realStock' | 'margin' | 'lastUpdated'>): Product {
  const products = getProducts();
  const newProduct: Product = {
    ...product,
    id: Date.now().toString(),
    realStock: calculateRealStock(product.initialStock, product.stockOut, product.pendingStock),
    margin: calculateMargin(product.sellingPrice, product.costPriceIDR),
    lastUpdated: new Date()
  };

  products.push(newProduct);
  saveProducts(products);
  return newProduct;
}

// Shipment storage functions
export function getShipments(): Shipment[] {
  const shipments = getFromStorage<Shipment[]>(STORAGE_KEYS.SHIPMENTS, DEFAULT_SHIPMENTS);
  return shipments.map(shipment => ({
    ...shipment,
    date: new Date(shipment.date),
    estimatedArrival: new Date(shipment.estimatedArrival)
  }));
}

export function saveShipments(shipments: Shipment[]): void {
  setToStorage(STORAGE_KEYS.SHIPMENTS, shipments);
}

export function updateShipment(shipmentId: string, updates: Partial<Shipment>): void {
  const shipments = getShipments();
  const index = shipments.findIndex(s => s.id === shipmentId);

  if (index !== -1) {
    shipments[index] = { ...shipments[index], ...updates };
    saveShipments(shipments);
  }
}

export function addShipment(shipment: Omit<Shipment, 'id'>): Shipment {
  const shipments = getShipments();
  const newShipment: Shipment = {
    ...shipment,
    id: Date.now().toString()
  };

  shipments.push(newShipment);
  saveShipments(shipments);
  return newShipment;
}

// Exchange rate functions
function convertRMBtoIDR(rmbAmount: number, exchangeRate: number): number {
  return Math.round(rmbAmount * exchangeRate);
}

function calculateMargin(sellingPrice: number, costPrice: number): number {
  if (costPrice === 0) return 0;
  return Math.round(((sellingPrice - costPrice) / costPrice) * 100);
}

export function getExchangeRate(): ExchangeRate {
  return getFromStorage<ExchangeRate>(STORAGE_KEYS.EXCHANGE_RATE, {
    rmbToIdr: DEFAULT_EXCHANGE_RATE,
    lastUpdated: new Date()
  });
}

export function updateExchangeRate(newRate: number): void {
  const exchangeRate: ExchangeRate = {
    rmbToIdr: newRate,
    lastUpdated: new Date()
  };

  setToStorage(STORAGE_KEYS.EXCHANGE_RATE, exchangeRate);

  // Update all product cost prices and margins
  const products = getProducts();
  const updatedProducts = products.map(product => ({
    ...product,
    costPriceIDR: convertRMBtoIDR(product.costPriceRMB, newRate),
    margin: calculateMargin(product.sellingPrice, convertRMBtoIDR(product.costPriceRMB, newRate))
  }));

  saveProducts(updatedProducts);
}

// Initialize storage with default values if empty
export function initializeStorage(): void {
  if (typeof window === 'undefined') return;

  // Check if storage is empty and initialize with defaults
  const existingProducts = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
  const existingShipments = localStorage.getItem(STORAGE_KEYS.SHIPMENTS);

  if (!existingProducts) {
    setToStorage(STORAGE_KEYS.PRODUCTS, DEFAULT_PRODUCTS);
  }

  if (!existingShipments) {
    setToStorage(STORAGE_KEYS.SHIPMENTS, DEFAULT_SHIPMENTS);
  }

  const existingExchangeRate = localStorage.getItem(STORAGE_KEYS.EXCHANGE_RATE);
  if (!existingExchangeRate) {
    setToStorage(STORAGE_KEYS.EXCHANGE_RATE, {
      rmbToIdr: DEFAULT_EXCHANGE_RATE,
      lastUpdated: new Date()
    });
  }
}