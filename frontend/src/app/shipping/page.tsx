'use client';

import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/layout';
import { Shipment } from '@/types';
import { getShipments, updateShipment, addShipment } from '@/lib/storage';
import { formatDate, getDaysUntil } from '@/lib/utils';
import { Ship, Edit, Calendar, Package, CheckCircle, Clock, Truck, Plus, X } from 'lucide-react';

const statusConfig = {
  processing: { label: 'Processing', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  'in-transit': { label: 'In Transit', color: 'bg-blue-100 text-blue-800', icon: Truck },
  received: { label: 'Received', color: 'bg-green-100 text-green-800', icon: CheckCircle },
};

export default function ShippingPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [editingShipment, setEditingShipment] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<Shipment>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState<Partial<Shipment>>({
    date: new Date(),
    method: 'sea',
    totalProducts: 0,
    status: 'processing',
    notes: '',
    forwarderName: '',
    estimatedArrival: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
  });

  useEffect(() => {
    const loadShipments = () => {
      setShipments(getShipments());
    };
    loadShipments();
  }, []);

  const handleEdit = (shipment: Shipment) => {
    setEditingShipment(shipment.id);
    setEditForm({
      date: shipment.date,
      estimatedArrival: shipment.estimatedArrival,
      status: shipment.status,
      notes: shipment.notes,
      forwarderName: shipment.forwarderName
    });
  };

  const handleSave = (shipmentId: string) => {
    updateShipment(shipmentId, editForm);
    setEditingShipment(null);
    setEditForm({});
    setShipments(getShipments()); // Refresh the list
  };

  const handleCancel = () => {
    setEditingShipment(null);
    setEditForm({});
  };

  const handleCreate = () => {
    const newShipment = addShipment({
      ...createForm,
      date: new Date(createForm.date!),
      estimatedArrival: new Date(createForm.estimatedArrival!)
    } as Omit<Shipment, 'id'>);

    setShipments(getShipments());
    setShowCreateForm(false);
    setCreateForm({
      date: new Date(),
      method: 'sea',
      totalProducts: 0,
      status: 'processing',
      notes: '',
      forwarderName: '',
      estimatedArrival: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    });
  };

  const getMethodIcon = (method: 'sea' | 'air') => {
    return method === 'sea' ? '🚢' : '✈️';
  };

  const getStatusBadge = (status: keyof typeof statusConfig) => {
    const config = statusConfig[status];
    const Icon = config.icon;
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </span>
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" suppressHydrationWarning={true}>
        {/* Header */}
        <div className="flex items-center justify-between" suppressHydrationWarning={true}>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Shipping Status</h1>
            <p className="text-gray-600">Track sea and air shipments from China</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Shipment
          </button>
        </div>

        {/* Create Form Modal */}
        {showCreateForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Create New Shipment</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Method</label>
                  <select
                    value={createForm.method}
                    onChange={(e) => setCreateForm({ ...createForm, method: e.target.value as 'sea' | 'air' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="sea">Sea</option>
                    <option value="air">Air</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {createForm.method === 'sea' ? 'Container Number' : 'AWB Number'}
                  </label>
                  <input
                    type="text"
                    value={createForm.method === 'sea' ? (createForm.containerNumber || '') : (createForm.awbNumber || '')}
                    onChange={(e) => setCreateForm({
                      ...createForm,
                      ...(createForm.method === 'sea'
                        ? { containerNumber: e.target.value }
                        : { awbNumber: e.target.value })
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={createForm.method === 'sea' ? 'e.g., CNT-SEA-1234' : 'e.g., AWB-AIR-1234'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forwarder Name</label>
                  <input
                    type="text"
                    value={createForm.forwarderName || ''}
                    onChange={(e) => setCreateForm({ ...createForm, forwarderName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., DHL Global Forwarding"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Total Products</label>
                  <input
                    type="number"
                    value={createForm.totalProducts || 0}
                    onChange={(e) => setCreateForm({ ...createForm, totalProducts: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shipping Date</label>
                  <input
                    type="date"
                    value={createForm.date ? createForm.date.toISOString().split('T')[0] : ''}
                    onChange={(e) => setCreateForm({ ...createForm, date: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Arrival</label>
                  <input
                    type="date"
                    value={createForm.estimatedArrival ? createForm.estimatedArrival.toISOString().split('T')[0] : ''}
                    onChange={(e) => setCreateForm({ ...createForm, estimatedArrival: new Date(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={createForm.status}
                    onChange={(e) => setCreateForm({ ...createForm, status: e.target.value as Shipment['status'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="processing">Processing</option>
                    <option value="in-transit">In Transit</option>
                    <option value="received">Received</option>
                  </select>
                </div>

                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Keterangan (Notes)</label>
                  <textarea
                    value={createForm.notes || ''}
                    onChange={(e) => setCreateForm({ ...createForm, notes: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    placeholder="Additional notes about this shipment..."
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
                  Create Shipment
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6" suppressHydrationWarning={true}>
          <div className="bg-white p-6 rounded-lg shadow" suppressHydrationWarning={true}>
            <div className="flex items-center">
              <Ship className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Total Shipments</p>
                <p className="text-2xl font-bold text-gray-900">{shipments.length}</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow" suppressHydrationWarning={true}>
            <div className="flex items-center">
              <Clock className="h-8 w-8 text-yellow-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Processing</p>
                <p className="text-2xl font-bold text-gray-900">
                  {shipments.filter(s => s.status === 'processing').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow" suppressHydrationWarning={true}>
            <div className="flex items-center">
              <Truck className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">In Transit</p>
                <p className="text-2xl font-bold text-gray-900">
                  {shipments.filter(s => s.status === 'in-transit').length}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow" suppressHydrationWarning={true}>
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-500">Received</p>
                <p className="text-2xl font-bold text-gray-900">
                  {shipments.filter(s => s.status === 'received').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Shipments Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden" suppressHydrationWarning={true}>
          <div className="overflow-x-auto" suppressHydrationWarning={true}>
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tracking
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    ETA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Products
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Forwarder Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Keterangan
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {shipments.map((shipment) => {
                  const daysUntil = getDaysUntil(shipment.estimatedArrival);
                  const isOverdue = daysUntil < 0 && shipment.status !== 'received';

                  return (
                    <tr key={shipment.id} className={isOverdue ? 'bg-red-50' : ''}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingShipment === shipment.id ? (
                          <input
                            type="date"
                            value={editForm.date ? editForm.date.toISOString().split('T')[0] : ''}
                            onChange={(e) => setEditForm({ ...editForm, date: new Date(e.target.value) })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          formatDate(shipment.date)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <span className="text-lg mr-2">{getMethodIcon(shipment.method)}</span>
                          <span className="capitalize">{shipment.method}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {shipment.containerNumber || shipment.awbNumber || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingShipment === shipment.id ? (
                          <input
                            type="date"
                            value={editForm.estimatedArrival ? editForm.estimatedArrival.toISOString().split('T')[0] : ''}
                            onChange={(e) => setEditForm({ ...editForm, estimatedArrival: new Date(e.target.value) })}
                            className="px-2 py-1 border border-gray-300 rounded text-sm mb-1"
                          />
                        ) : (
                          <>
                            <div className="text-sm text-gray-900">
                              {formatDate(shipment.estimatedArrival)}
                            </div>
                            <div className={`text-xs ${
                              isOverdue ? 'text-red-600' :
                              daysUntil <= 3 ? 'text-yellow-600' : 'text-gray-500'
                            }`}>
                              {isOverdue
                                ? `${Math.abs(daysUntil)} days overdue`
                                : daysUntil === 0
                                ? 'Today'
                                : daysUntil === 1
                                ? 'Tomorrow'
                                : `${daysUntil} days`
                              }
                            </div>
                          </>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Package className="h-4 w-4 mr-2 text-gray-400" />
                          {shipment.totalProducts} pcs
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {editingShipment === shipment.id ? (
                          <input
                            type="text"
                            value={editForm.forwarderName || ''}
                            onChange={(e) => setEditForm({ ...editForm, forwarderName: e.target.value })}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Forwarder name"
                          />
                        ) : (
                          shipment.forwarderName
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingShipment === shipment.id ? (
                          <select
                            value={editForm.status}
                            onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Shipment['status'] })}
                            className="text-xs px-2 py-1 border border-gray-300 rounded"
                          >
                            <option value="processing">Processing</option>
                            <option value="in-transit">In Transit</option>
                            <option value="received">Received</option>
                          </select>
                        ) : (
                          getStatusBadge(shipment.status)
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {editingShipment === shipment.id ? (
                          <input
                            type="text"
                            value={editForm.notes || ''}
                            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                            className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        ) : (
                          shipment.notes
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {editingShipment === shipment.id ? (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSave(shipment.id)}
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
                            onClick={() => handleEdit(shipment)}
                            className="text-blue-600 hover:text-blue-900 flex items-center"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}