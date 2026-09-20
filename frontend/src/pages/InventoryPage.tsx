import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { inventoryApi } from '../api/inventory';
import { Part } from '../types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Boxes,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle,
  TrendingDown,
  Edit2,
  Trash2,
  DollarSign
} from 'lucide-react';

export const InventoryPage: React.FC = () => {
  const { isAdmin, isManager } = useAuth();

  const [parts, setParts] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPart, setSelectedPart] = useState<Part | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState<number>(0);
  const [stockQuantity, setStockQuantity] = useState<number>(10);
  const [reorderLevel, setReorderLevel] = useState<number>(5);

  const fetchParts = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getAll();
      setParts(data);
    } catch (err) {
      console.error('Error loading parts catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchParts();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await inventoryApi.create({
        name,
        sku,
        description,
        unitPrice,
        stockQuantity,
        reorderLevel
      });
      setIsCreateModalOpen(false);
      resetForm();
      fetchParts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create part');
    }
  };

  const handleEditOpen = (p: Part) => {
    setSelectedPart(p);
    setName(p.name);
    setSku(p.sku);
    setDescription(p.description || '');
    setUnitPrice(p.unitPrice);
    setStockQuantity(p.stockQuantity);
    setReorderLevel(p.reorderLevel);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPart) return;
    try {
      await inventoryApi.update(selectedPart.id, {
        name,
        sku,
        description,
        unitPrice,
        stockQuantity,
        reorderLevel
      });
      setIsEditModalOpen(false);
      fetchParts();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update part');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this part from the inventory catalog?')) return;
    try {
      await inventoryApi.delete(id);
      fetchParts();
    } catch (err) {
      alert('Failed to delete part');
    }
  };

  const resetForm = () => {
    setName('');
    setSku('');
    setDescription('');
    setUnitPrice(0);
    setStockQuantity(10);
    setReorderLevel(5);
  };

  const lowStockCount = parts.filter(p => p.isLowStock).length;

  const filtered = parts.filter((p) => {
    const q = searchTerm.toLowerCase();
    const matchesSearch = p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.description || '').toLowerCase().includes(q);
    const matchesLowStock = !filterLowStockOnly || p.isLowStock;
    return matchesSearch && matchesLowStock;
  });

  return (
    <Layout
      pageTitle="Parts Catalog & Warehouse Inventory"
      subtitle="Track replacement parts, current stock quantities, SKU pricing, and automated reorder alerts"
      actions={
        (isAdmin || isManager) ? (
          <button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} className="btn-primary">
            <Plus size={16} />
            <span>Add Part / SKU</span>
          </button>
        ) : undefined
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Low Stock Warning Banner */}
        {lowStockCount > 0 && (
          <div style={{ padding: '16px 20px', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', color: '#f87171' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <AlertTriangle size={20} />
              <div>
                <strong style={{ color: '#ef4444' }}>Low Inventory Warning:</strong>{' '}
                <span>{lowStockCount} part(s) have dropped below safety reorder levels.</span>
              </div>
            </div>
            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                padding: '6px 14px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              {filterLowStockOnly ? 'Show All Parts' : 'View Reorder Items'}
            </button>
          </div>
        )}

        {/* Search & Filter Bar */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '36px' }}
              placeholder="Search by part name or SKU..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
              Total SKUs: <strong style={{ color: '#f8fafc' }}>{parts.length}</strong>
            </span>
          </div>
        </div>

        {/* Parts Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>SKU Code</th>
                <th>Part Description</th>
                <th>Unit Price</th>
                <th>Stock Level</th>
                <th>Reorder Point</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                    Loading inventory catalog...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No parts matching criteria
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#818cf8' }}>
                        {p.sku}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{p.name}</div>
                      {p.description && <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.description}</div>}
                    </td>
                    <td>
                      <span style={{ fontWeight: 600, color: '#34d399' }}>${p.unitPrice}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <strong style={{ fontSize: '0.9375rem', color: p.isLowStock ? '#ef4444' : '#f8fafc' }}>
                          {p.stockQuantity}
                        </strong>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>units</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{p.reorderLevel} units</span>
                    </td>
                    <td>
                      {p.isLowStock ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, backgroundColor: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' }}>
                          <TrendingDown size={12} />
                          LOW STOCK
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '3px 8px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' }}>
                          <CheckCircle size={12} />
                          IN STOCK
                        </span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {(isAdmin || isManager) && (
                          <>
                            <button onClick={() => handleEditOpen(p)} className="btn-icon" title="Edit Part Stock">
                              <Edit2 size={14} />
                            </button>
                            {isAdmin && (
                              <button onClick={() => handleDelete(p.id)} className="btn-icon" style={{ color: '#f87171' }} title="Delete Part">
                                <Trash2 size={14} />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Part to Inventory">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Part Name</label>
            <input type="text" required className="input-field" placeholder="e.g. High-Pressure Hydraulic Seal Kit" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">SKU Code</label>
              <input type="text" required className="input-field" placeholder="PRT-HYD-001" value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price ($)</label>
              <input type="number" step="0.01" min={0} required className="input-field" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Initial Stock Quantity</label>
              <input type="number" min={0} required className="input-field" value={stockQuantity} onChange={(e) => setStockQuantity(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Reorder Level Threshold</label>
              <input type="number" min={0} required className="input-field" value={reorderLevel} onChange={(e) => setReorderLevel(Number(e.target.value))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description / Specifications</label>
            <textarea rows={2} className="textarea-field" placeholder="Technical specs, compatible equipment models..." value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Part</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Inventory — ${selectedPart?.name}`}>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Part Name</label>
            <input type="text" required className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">SKU</label>
              <input type="text" required className="input-field" value={sku} onChange={(e) => setSku(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Unit Price ($)</label>
              <input type="number" step="0.01" min={0} required className="input-field" value={unitPrice} onChange={(e) => setUnitPrice(Number(e.target.value))} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Stock Quantity</label>
              <input type="number" min={0} required className="input-field" value={stockQuantity} onChange={(e) => setStockQuantity(Number(e.target.value))} />
            </div>
            <div className="form-group">
              <label className="form-label">Reorder Threshold</label>
              <input type="number" min={0} required className="input-field" value={reorderLevel} onChange={(e) => setReorderLevel(Number(e.target.value))} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea rows={2} className="textarea-field" value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Changes</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
