'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Product } from '@/types';
import { getProducts, updateProduct, getExchangeRate, updateExchangeRate } from '@/lib/storage';
import { formatCurrency, calculateMargin } from '@/lib/utils';
import { DollarSign, TrendingUp, TrendingDown, Edit, RefreshCw } from 'lucide-react';

export default function PricingPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [exchangeRate, setExchangeRate] = useState({ rmbToIdr: 1850, lastUpdated: new Date() });
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [newExchangeRate, setNewExchangeRate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setProducts(getProducts());
    setExchangeRate(getExchangeRate());
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product.id);
    setEditForm({
      name: product.name,
      category: product.category,
      costPriceRMB: product.costPriceRMB,
      sellingPrice: product.sellingPrice
    });
  };

  const handleSave = (productId: string) => {
    updateProduct(productId, editForm);
    setEditingProduct(null);
    setEditForm({});
    loadData(); // Refresh the list
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setEditForm({});
  };

  const handleExchangeRateUpdate = () => {
    const rate = parseFloat(newExchangeRate);
    if (rate > 0) {
      updateExchangeRate(rate);
      setNewExchangeRate('');
      loadData(); // Refresh products with new exchange rate
    }
  };

  const lowMarginProducts = products.filter(product => product.margin < 30);
  const highMarginProducts = products.filter(product => product.margin >= 50);
  const averageMargin = products.length > 0
    ? Math.round(products.reduce((sum, product) => sum + product.margin, 0) / products.length)
    : 0;

  const getMarginBadge = (margin: number) => {
    if (margin < 30) {
      return 'bg-red-100 text-red-800';
    } else if (margin < 50) {
      return 'bg-yellow-100 text-yellow-800';
    }
    return 'bg-green-100 text-green-800';
  };

  const getMarginIcon = (margin: number) => {
    return margin >= 50 ? (
      <TrendingUp className="h-3 w-3 mr-1" />
    ) : (
      <TrendingDown className="h-3 w-3 mr-1" />
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" suppressHydrationWarning={true}>
        {/* Header */}
        <div suppressHydrationWarning={true}>
          <h1 className="text-2xl font-bold text-gray-900">Pricing & Profit Margin</h1>
          <p className="text-gray-600">Manage product pricing and monitor profit margins</p>
        </div>

        {/* Exchange Rate Card */}
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Exchange Rate</h3>
              <p className="text-sm text-gray-500">1 RMB = {exchangeRate.rmbToIdr.toLocaleString()} IDR</p>
              <p className="text-xs text-gray-400">
                Last updated: {exchangeRate.lastUpdated.toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <input
                type="number"
                placeholder="New rate"
                value={newExchangeRate}
                onChange={(e) => setNewExchangeRate(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
              />
              <button
                onClick={handleExchangeRateUpdate}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Average Margin</p>
                <p className="text-2xl font-bold text-gray-900">{averageMargin}%</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">High Margin (≥50%)</p>
                <p className="text-2xl font-bold text-green-600">{highMarginProducts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <TrendingDown className="h-8 w-8 text-red-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Low Margin (&lt;30%)</p>
                <p className="text-2xl font-bold text-red-600">{lowMarginProducts.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Value</p>
                <p className="text-lg font-bold text-gray-900">
                  {formatCurrency(
                    products.reduce((sum, product) => sum + (product.sellingPrice * product.realStock), 0),
                    'IDR'
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Real Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Price (RMB)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cost Price (IDR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Selling Price (IDR)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Margin
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Total Value
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {products.map((product) => (
                  <tr key={product.id} className={product.margin < 30 ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingProduct === product.id ? (
                        <div>
                          <input
                            type="text"
                            value={editForm.name || ''}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="block w-full px-2 py-1 border border-gray-300 rounded mb-1 text-sm font-medium text-gray-900"
                            placeholder="Product name"
                          />
                          <input
                            type="text"
                            value={editForm.category || ''}
                            onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                            className="block w-full px-2 py-1 border border-gray-300 rounded text-sm text-gray-500"
                            placeholder="Category"
                          />
                        </div>
                      ) : (
                        <>
                          <div className="text-sm font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.category}</div>
                        </>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {product.sku}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {product.realStock}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingProduct === product.id ? (
                        <input
                          type="number"
                          step="0.1"
                          value={editForm.costPriceRMB || ''}
                          onChange={(e) => setEditForm({ ...editForm, costPriceRMB: parseFloat(e.target.value) || 0 })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        `¥${product.costPriceRMB.toFixed(1)}`
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.costPriceIDR, 'IDR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingProduct === product.id ? (
                        <input
                          type="number"
                          value={editForm.sellingPrice || ''}
                          onChange={(e) => setEditForm({ ...editForm, sellingPrice: parseInt(e.target.value) || 0 })}
                          className="w-32 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        formatCurrency(product.sellingPrice, 'IDR')
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${getMarginBadge(product.margin)}`}>
                        {getMarginIcon(product.margin)}
                        {product.margin}%
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatCurrency(product.sellingPrice * product.realStock, 'IDR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingProduct === product.id ? (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleSave(product.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancel}
                            className="text-gray-600 hover:text-gray-900"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleEdit(product)}
                          className="text-blue-600 hover:text-blue-900 flex items-center"
                        >
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Margin Alert */}
        {lowMarginProducts.length > 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center">
              <TrendingDown className="h-5 w-5 text-yellow-600 mr-2" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Low Margin Alert</h3>
                <p className="text-sm text-yellow-700">
                  {lowMarginProducts.length} products have margins below 30%. Consider adjusting pricing or negotiating better supplier costs.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}