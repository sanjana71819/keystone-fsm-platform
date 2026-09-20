import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Layout } from '../components/Layout';
import { workOrderApi } from '../api/workOrders';
import { inventoryApi } from '../api/inventory';
import { timeTrackingApi } from '../api/timeTracking';
import { WorkOrder, Part, WorkOrderStatus, TimeEntry } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Building2,
  Boxes,
  Plus,
  Trash2,
  Play,
  Square,
  CheckCircle,
  AlertCircle,
  FileText,
  UserCheck
} from 'lucide-react';

export const WorkOrderDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, isManager, isTechnician } = useAuth();

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [partsCatalog, setPartsCatalog] = useState<Part[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeClockIn, setActiveClockIn] = useState<TimeEntry | null>(null);

  // Modals
  const [isAddPartModalOpen, setIsAddPartModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState<number | undefined>(undefined);
  const [partQuantity, setPartQuantity] = useState<number>(1);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<WorkOrderStatus>('IN_PROGRESS');
  const [statusNotes, setStatusNotes] = useState('');

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await workOrderApi.getById(Number(id));
      setWorkOrder(data);

      const parts = await inventoryApi.getAll();
      setPartsCatalog(parts);
      if (parts.length > 0) setSelectedPartId(parts[0].id);

      // Check if user is technician and has active clock in for this order
      if (data.technicianId) {
        const active = await timeTrackingApi.getActiveClockIn(data.technicianId);
        setActiveClockIn(active);
      }
    } catch (err) {
      console.error('Failed to load work order', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleStatusChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workOrder) return;
    try {
      await workOrderApi.updateStatus(workOrder.id, newStatus, statusNotes);
      setIsStatusModalOpen(false);
      setStatusNotes('');
      fetchDetails();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleAddPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workOrder || !selectedPartId) return;
    try {
      await workOrderApi.addPart(workOrder.id, selectedPartId, partQuantity);
      setIsAddPartModalOpen(false);
      setPartQuantity(1);
      fetchDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add part to work order');
    }
  };

  const handleRemovePart = async (partUsageId: number) => {
    if (!workOrder || !window.confirm('Remove this part from the work order? Inventory will be restored.')) return;
    try {
      await workOrderApi.removePart(workOrder.id, partUsageId);
      fetchDetails();
    } catch (err) {
      alert('Failed to remove part');
    }
  };

  const handleClockIn = async () => {
    if (!workOrder) return;
    try {
      await timeTrackingApi.clockIn({
        workOrderId: workOrder.id,
        technicianId: workOrder.technicianId || user?.technicianId,
        notes: 'Started on-site work'
      });
      fetchDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Clock in failed');
    }
  };

  const handleClockOut = async () => {
    if (!activeClockIn) return;
    try {
      await timeTrackingApi.clockOut(activeClockIn.id, 'Finished shift segment');
      fetchDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Clock out failed');
    }
  };

  if (loading && !workOrder) {
    return (
      <Layout pageTitle="Work Order Details">
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <p style={{ color: '#94a3b8' }}>Loading work order data...</p>
        </div>
      </Layout>
    );
  }

  if (!workOrder) {
    return (
      <Layout pageTitle="Work Order Not Found">
        <div className="glass-card" style={{ padding: '32px', textAlign: 'center' }}>
          <p style={{ color: '#f87171', marginBottom: '16px' }}>Work order not found.</p>
          <Link to="/work-orders" className="btn-primary">
            Back to Work Orders
          </Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      pageTitle={`Work Order #WO-${workOrder.id}`}
      subtitle={`Service Request #${workOrder.serviceRequestId} — ${workOrder.serviceRequestTitle || 'Field Order'}`}
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/work-orders" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <ArrowLeft size={16} />
            <span>Back</span>
          </Link>
          <button
            onClick={() => {
              setNewStatus(workOrder.status);
              setIsStatusModalOpen(true);
            }}
            className="btn-primary"
          >
            Update Lifecycle Status
          </button>
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Top Summary Banner */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <StatusBadge status={workOrder.status} />
                <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                  Created on {new Date(workOrder.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
                {workOrder.serviceRequestTitle}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '10px', fontSize: '0.875rem', color: '#94a3b8' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Building2 size={16} style={{ color: '#818cf8' }} />
                  <span>{workOrder.customerCompanyName || 'Customer'}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MapPin size={16} style={{ color: '#06b6d4' }} />
                  <span>{workOrder.facilityName} ({workOrder.facilityAddress})</span>
                </div>
              </div>
            </div>

            {/* Quick Stats Pill Panel */}
            <div style={{ display: 'flex', gap: '16px' }}>
              <div style={{ padding: '12px 20px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Hours Logged</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                  {workOrder.totalHours || 0} hrs
                </div>
              </div>
              <div style={{ padding: '12px 20px', borderRadius: '12px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.06)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Parts Total</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#34d399', marginTop: '2px' }}>
                  ${workOrder.totalPartsCost || 0}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Main Section */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
          {/* Left Column: Scope, Instructions & Parts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Scope / Description */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FileText size={18} style={{ color: '#818cf8' }} />
                Job Instructions & Scope
              </h3>
              <p style={{ color: '#cbd5e1', fontSize: '0.875rem', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                {workOrder.description || 'No specific job instructions recorded.'}
              </p>
              {workOrder.notes && (
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
                  <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '6px' }}>
                    Activity & Field Notes
                  </div>
                  <p style={{ color: '#94a3b8', fontSize: '0.8125rem', lineHeight: '1.5', whiteSpace: 'pre-wrap' }}>
                    {workOrder.notes}
                  </p>
                </div>
              )}
            </div>

            {/* Parts / Inventory Tracking */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Boxes size={18} style={{ color: '#fbbf24' }} />
                  Parts & Inventory Used
                </h3>
                <button
                  onClick={() => setIsAddPartModalOpen(true)}
                  className="btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '0.75rem' }}
                >
                  <Plus size={14} />
                  <span>Add Part</span>
                </button>
              </div>

              {workOrder.parts.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>
                  No parts recorded for this work order yet.
                </p>
              ) : (
                <div className="data-table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Part / SKU</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Total</th>
                        <th style={{ textAlign: 'right' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {workOrder.parts.map((p) => (
                        <tr key={p.id}>
                          <td>
                            <div style={{ fontWeight: 600, color: '#f8fafc' }}>{p.partName}</div>
                            <div style={{ fontSize: '0.6875rem', color: '#64748b', fontFamily: 'monospace' }}>{p.sku}</div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{p.quantityUsed}</td>
                          <td>${p.unitPrice}</td>
                          <td style={{ fontWeight: 700, color: '#34d399' }}>${p.totalCost}</td>
                          <td style={{ textAlign: 'right' }}>
                            <button
                              onClick={() => handleRemovePart(p.id)}
                              className="btn-icon"
                              style={{ color: '#f87171' }}
                              title="Remove Part"
                            >
                              <Trash2 size={13} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Dispatch Info & Time Tracking */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            {/* Technician Dispatch Box */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <UserCheck size={18} style={{ color: '#34d399' }} />
                Dispatched Technician
              </h3>
              {workOrder.technicianName ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.125rem' }}>
                      {workOrder.technicianName[0]}
                    </div>
                    <div>
                      <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>{workOrder.technicianName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{workOrder.technicianPhone || 'No phone on record'}</div>
                    </div>
                  </div>

                  <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', fontSize: '0.8125rem', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Scheduled At:</span>
                      <span style={{ color: '#f8fafc' }}>
                        {workOrder.scheduledAt ? new Date(workOrder.scheduledAt).toLocaleString() : 'Not set'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Started At:</span>
                      <span style={{ color: '#f8fafc' }}>
                        {workOrder.startedAt ? new Date(workOrder.startedAt).toLocaleString() : 'Not started'}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94a3b8' }}>
                      <span>Completed At:</span>
                      <span style={{ color: '#34d399', fontWeight: 600 }}>
                        {workOrder.completedAt ? new Date(workOrder.completedAt).toLocaleString() : 'Incomplete'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '16px 0', color: '#eab308' }}>
                  <AlertCircle size={24} style={{ margin: '0 auto 8px auto' }} />
                  <p style={{ fontSize: '0.875rem', fontWeight: 600 }}>Technician Not Assigned</p>
                  <p style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Assign from the work orders list dispatch action.</p>
                </div>
              )}
            </div>

            {/* Time Tracking Widget */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Clock size={18} style={{ color: '#818cf8' }} />
                  Technician Time Clock
                </h3>
              </div>

              {/* Clock In / Out Action Button */}
              <div style={{ marginBottom: '16px' }}>
                {activeClockIn ? (
                  <div style={{ padding: '14px', borderRadius: '12px', backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                      <span style={{ fontSize: '0.8125rem', color: '#facc15', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#eab308', display: 'inline-block' }} />
                        Active Session Running
                      </span>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Clocked in at {new Date(activeClockIn.clockIn).toLocaleTimeString()}
                      </span>
                    </div>
                    <button
                      onClick={handleClockOut}
                      className="btn-danger"
                      style={{ width: '100%' }}
                    >
                      <Square size={16} />
                      <span>Clock Out Now</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleClockIn}
                    className="btn-primary"
                    style={{ width: '100%' }}
                  >
                    <Play size={16} />
                    <span>Clock In to this Work Order</span>
                  </button>
                )}
              </div>

              {/* Past Logs */}
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
                Logged Shifts ({workOrder.timeEntries.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto' }}>
                {workOrder.timeEntries.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.75rem' }}>No time entries recorded yet</p>
                ) : (
                  workOrder.timeEntries.map((entry) => (
                    <div
                      key={entry.id}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.03)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        fontSize: '0.75rem'
                      }}
                    >
                      <div>
                        <div style={{ color: '#f1f5f9', fontWeight: 600 }}>{entry.technicianName}</div>
                        <div style={{ color: '#64748b' }}>
                          {new Date(entry.clockIn).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -{' '}
                          {entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Active'}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: '#818cf8' }}>
                        {entry.durationHours ? `${entry.durationHours}h` : 'Running'}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Update Status Modal */}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        title={`Update Lifecycle Status (WO #${workOrder.id})`}
      >
        <form onSubmit={handleStatusChange}>
          <div className="form-group">
            <label className="form-label">New Status</label>
            <select
              className="select-field"
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as WorkOrderStatus)}
            >
              <option value="OPEN">OPEN (Unassigned / Pending)</option>
              <option value="ASSIGNED">ASSIGNED (Technician Dispatched)</option>
              <option value="IN_PROGRESS">IN PROGRESS (Work Underway On-Site)</option>
              <option value="ON_HOLD">ON HOLD (Pending Parts / Access)</option>
              <option value="COMPLETED">COMPLETED (Resolved & Tested)</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Status Change Note</label>
            <textarea
              rows={3}
              className="textarea-field"
              placeholder="e.g. Diagnostic complete, waiting for replacement seal kit..."
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsStatusModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Status
            </button>
          </div>
        </form>
      </Modal>

      {/* Add Part Modal */}
      <Modal
        isOpen={isAddPartModalOpen}
        onClose={() => setIsAddPartModalOpen(false)}
        title="Add Inventory Part to Work Order"
      >
        <form onSubmit={handleAddPart}>
          <div className="form-group">
            <label className="form-label">Part from Catalog</label>
            <select
              className="select-field"
              value={selectedPartId || ''}
              onChange={(e) => setSelectedPartId(Number(e.target.value))}
              required
            >
              <option value="">Select part...</option>
              {partsCatalog.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku}) — ${p.unitPrice} [Stock: {p.stockQuantity}]
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Quantity Used</label>
            <input
              type="number"
              min={1}
              required
              className="input-field"
              value={partQuantity}
              onChange={(e) => setPartQuantity(Number(e.target.value))}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsAddPartModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Deduct Stock & Add Part
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
