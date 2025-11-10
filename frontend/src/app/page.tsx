'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Product } from '@/types';
import { getProducts, updateProduct, addProduct } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Search, Edit, Package, AlertTriangle, Plus, X } from 'lucide-react';

export default function StockManagement() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<Product>>({
    name: '',
    sku: '',
    initialStock: 0,
    stockOut: 0,
    pendingStock: 0,
    notes: '',
    category: '',
    costPriceRMB: 0,
    costPriceIDR: 0,
    sellingPrice: 0
  });

  useEffect(() => {
    const loadProducts = () => {
      setProducts(getProducts());
    };
    loadProducts();
  }, []);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockProducts = filteredProducts.filter(product => product.realStock < 10);

  const handleEdit = (product: Product) => {
    setEditingProduct(product.id);
    setEditForm({
      name: product.name,
      sku: product.sku,
      initialStock: product.initialStock,
      stockOut: product.stockOut,
      pendingStock: product.pendingStock,
      notes: product.notes,
      category: product.category
    });
  };

  const handleSave = (productId: string) => {
    updateProduct(productId, editForm);
    setEditingProduct(null);
    setEditForm({});
    setProducts(getProducts()); // Refresh the list
  };

  const handleCancel = () => {
    setEditingProduct(null);
    setEditForm({});
  };

  const handleCreate = () => {
    const newProduct = addProduct({
      ...createForm,
      lastUpdated: new Date()
    } as Omit<Product, 'id' | 'realStock' | 'margin' | 'lastUpdated'>);

    setProducts(getProducts());
    setShowCreateForm(false);
    setCreateForm({
      name: '',
      sku: '',
      initialStock: 0,
      stockOut: 0,
      pendingStock: 0,
      notes: '',
      category: '',
      costPriceRMB: 0,
      costPriceIDR: 0,
      sellingPrice: 0
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" suppressHydrationWarning={true}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
            <p className="text-gray-600">Manage product inventory and stock levels</p>
          </div>

          <div className="flex items-center gap-4">
            {lowStockProducts.length > 0 && (
              <div className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-lg">
                <AlertTriangle className="h-5 w-5" />
                <span className="font-medium">{lowStockProducts.length} low stock items</span>
              </div>
            )}
            <button
              onClick={() => setShowCreateForm(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <Plus className="h-5 w-5 mr-2" />
              Add Product
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by product name or SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Create New Product</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    value={createForm.name || ''}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Premium Leather Steering Cover"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
                  <input
                    type="text"
                    value={createForm.sku || ''}
                    onChange={(e) => setCreateForm({ ...createForm, sku: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., CSK001"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <input
                    type="text"
                    value={createForm.category || ''}
                    onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., Interior, Exterior"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (RMB)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={createForm.costPriceRMB || ''}
                    onChange={(e) => setCreateForm({ ...createForm, costPriceRMB: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 8.5"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cost Price (IDR)</label>
                  <input
                    type="number"
                    value={createForm.costPriceIDR || ''}
                    onChange={(e) => setCreateForm({ ...createForm, costPriceIDR: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 18500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Selling Price (IDR)</label>
                  <input
                    type="number"
                    value={createForm.sellingPrice || ''}
                    onChange={(e) => setCreateForm({ ...createForm, sellingPrice: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 35000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    value={createForm.initialStock || ''}
                    onChange={(e) => setCreateForm({ ...createForm, initialStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Out</label>
                  <input
                    type="number"
                    value={createForm.stockOut || ''}
                    onChange={(e) => setCreateForm({ ...createForm, stockOut: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pending Stock</label>
                  <input
                    type="number"
                    value={createForm.pendingStock || ''}
                    onChange={(e) => setCreateForm({ ...createForm, pendingStock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <textarea
                    value={createForm.notes || ''}
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Additional notes about this product..."
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreate}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Create Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Product Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Product Details
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    SKU
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Initial Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stock Out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pending
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Real Stock
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className={product.realStock < 10 ? 'bg-red-50' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Package className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
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
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                      {editingProduct === product.id ? (
                        <input
                          type="text"
                          value={editForm.sku || ''}
                          onChange={(e) => setEditForm({ ...editForm, sku: e.target.value })}
                          className="w-24 px-2 py-1 border border-gray-300 rounded font-mono text-sm"
                        />
                      ) : (
                        product.sku
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingProduct === product.id ? (
                        <input
                          type="number"
                          value={editForm.initialStock || ''}
                          onChange={(e) => setEditForm({ ...editForm, initialStock: parseInt(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        product.initialStock
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingProduct === product.id ? (
                        <input
                          type="number"
                          value={editForm.stockOut || ''}
                          onChange={(e) => setEditForm({ ...editForm, stockOut: parseInt(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        product.stockOut
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {editingProduct === product.id ? (
                        <input
                          type="number"
                          value={editForm.pendingStock || ''}
                          onChange={(e) => setEditForm({ ...editForm, pendingStock: parseInt(e.target.value) || 0 })}
                          className="w-20 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        product.pendingStock
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.realStock < 10
                          ? 'bg-red-100 text-red-800'
                          : 'bg-green-100 text-green-800'
                      }`}>
                        {product.realStock}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {editingProduct === product.id ? (
                        <input
                          type="text"
                          value={editForm.notes || ''}
                          onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                          className="w-32 px-2 py-1 border border-gray-300 rounded"
                        />
                      ) : (
                        product.notes
                      )}
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

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Products</h3>
            <p className="text-2xl font-bold text-gray-900">{filteredProducts.length}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Stock</h3>
            <p className="text-2xl font-bold text-gray-900">
              {filteredProducts.reduce((sum, product) => sum + product.realStock, 0)}
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Low Stock Items</h3>
            <p className="text-2xl font-bold text-red-600">{lowStockProducts.length}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
