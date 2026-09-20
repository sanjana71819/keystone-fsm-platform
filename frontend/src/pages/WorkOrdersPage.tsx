import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { workOrderApi } from '../api/workOrders';
import { technicianApi } from '../api/technicians';
import { serviceRequestApi } from '../api/serviceRequests';
import { WorkOrder, Technician, ServiceRequest, WorkOrderStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Plus,
  Search,
  UserCheck,
  Calendar,
  Clock,
  ArrowRight,
  Send,
  Boxes,
  CheckCircle2,
  Trash2,
  Filter
} from 'lucide-react';

export const WorkOrdersPage: React.FC = () => {
  const { user, isAdmin, isManager, isTechnician, isCustomer } = useAuth();

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [serviceRequests, setServiceRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Modals
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<WorkOrder | null>(null);

  // Dispatch form state
  const [selectedTechId, setSelectedTechId] = useState<number | undefined>(undefined);
  const [scheduledDateTime, setScheduledDateTime] = useState('');

  // Create form state
  const [newServiceRequestId, setNewServiceRequestId] = useState<number | undefined>(undefined);
  const [newTechId, setNewTechId] = useState<number | undefined>(undefined);
  const [newScheduledAt, setNewScheduledAt] = useState('');
  const [newDescription, setNewDescription] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      let orders: WorkOrder[];
      if (isTechnician && user?.technicianId) {
        orders = await workOrderApi.getByTechnician(user.technicianId);
      } else if (isCustomer && user?.customerId) {
        orders = await workOrderApi.getByCustomer(user.customerId);
      } else {
        orders = await workOrderApi.getAll();
      }
      setWorkOrders(orders);

      if (isAdmin || isManager) {
        const [techs, reqs] = await Promise.all([
          technicianApi.getAll(),
          serviceRequestApi.getAll()
        ]);
        setTechnicians(techs);
        setServiceRequests(reqs);
        if (reqs.length > 0) setNewServiceRequestId(reqs[0].id);
      }
    } catch (err) {
      console.error('Error loading work orders', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleOpenDispatch = (order: WorkOrder) => {
    setSelectedOrder(order);
    setSelectedTechId(order.technicianId || (technicians.length > 0 ? technicians[0].id : undefined));
    setScheduledDateTime(order.scheduledAt ? order.scheduledAt.substring(0, 16) : '');
    setIsDispatchModalOpen(true);
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder || !selectedTechId) return;

    try {
      await workOrderApi.assignTechnician(
        selectedOrder.id,
        selectedTechId,
        scheduledDateTime ? scheduledDateTime : undefined
      );
      setIsDispatchModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to dispatch technician');
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newServiceRequestId) return;

    try {
      await workOrderApi.create({
        serviceRequestId: newServiceRequestId,
        technicianId: newTechId,
        scheduledAt: newScheduledAt ? newScheduledAt : undefined,
        description: newDescription
      });
      setIsCreateModalOpen(false);
      setNewDescription('');
      fetchData();
    } catch (err) {
      alert('Failed to create work order');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this work order?')) return;
    try {
      await workOrderApi.delete(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete work order');
    }
  };

  const filteredOrders = workOrders.filter((order) => {
    const matchesSearch =
      (order.serviceRequestTitle || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerCompanyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.technicianName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <Layout
      pageTitle="Work Orders & Dispatch Center"
      subtitle="Track end-to-end technician execution, parts consumption, and lifecycle states"
      actions={
        (isAdmin || isManager) ? (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="btn-primary"
          >
            <Plus size={16} />
            <span>Create Work Order</span>
          </button>
        ) : undefined
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Filter bar */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {['ALL', 'OPEN', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETED'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: statusFilter === status ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: statusFilter === status ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: statusFilter === status ? '#ffffff' : '#94a3b8',
                  transition: 'all 0.15s ease'
                }}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <div style={{ position: 'relative', width: '280px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '36px' }}
              placeholder="Search work orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Work Orders Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>WO #</th>
                <th>Service Request / Site</th>
                <th>Assigned Technician</th>
                <th>Status</th>
                <th>Schedule & Time</th>
                <th>Parts Used</th>
                <th>Total Logged</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    Loading work orders...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No work orders found
                  </td>
                </tr>
              ) : (
                filteredOrders.map((wo) => (
                  <tr key={wo.id}>
                    <td>
                      <Link
                        to={`/work-orders/${wo.id}`}
                        style={{ fontFamily: 'monospace', fontWeight: 700, color: '#818cf8', textDecoration: 'none' }}
                      >
                        WO-{wo.id}
                      </Link>
                    </td>
                    <td style={{ maxWidth: '240px' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                        {wo.serviceRequestTitle || 'Direct Maintenance'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {wo.customerCompanyName} • {wo.facilityName}
                      </div>
                    </td>
                    <td>
                      {wo.technicianName ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: 'rgba(99, 102, 241, 0.25)', color: '#818cf8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6875rem', fontWeight: 700 }}>
                            {wo.technicianName[0]}
                          </div>
                          <div>
                            <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9' }}>{wo.technicianName}</div>
                            {wo.technicianPhone && <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{wo.technicianPhone}</div>}
                          </div>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#eab308', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Clock size={12} /> Unassigned
                        </span>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={wo.status} />
                    </td>
                    <td>
                      <div style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
                        {wo.scheduledAt ? new Date(wo.scheduledAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unscheduled'}
                      </div>
                      {wo.completedAt && (
                        <div style={{ fontSize: '0.6875rem', color: '#10b981' }}>
                          Done {new Date(wo.completedAt).toLocaleDateString()}
                        </div>
                      )}
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
                        {wo.parts?.length || 0} items (${wo.totalPartsCost || 0})
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f8fafc' }}>
                        {wo.totalHours || 0} hrs
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {(isAdmin || isManager) && (
                          <button
                            onClick={() => handleOpenDispatch(wo)}
                            className="btn-icon"
                            title="Dispatch / Reassign Technician"
                          >
                            <Send size={14} />
                          </button>
                        )}
                        <Link
                          to={`/work-orders/${wo.id}`}
                          className="btn-icon"
                          title="Open Work Order Details"
                          style={{ textDecoration: 'none' }}
                        >
                          <ArrowRight size={14} />
                        </Link>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(wo.id)}
                            className="btn-icon"
                            style={{ color: '#f87171' }}
                            title="Delete work order"
                          >
                            <Trash2 size={14} />
                          </button>
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

      {/* Dispatch Modal */}
      <Modal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        title={`Dispatch Technician for WO #${selectedOrder?.id}`}
      >
        <form onSubmit={handleDispatchSubmit}>
          <div className="form-group">
            <label className="form-label">Select Field Technician</label>
            <select
              className="select-field"
              value={selectedTechId || ''}
              onChange={(e) => setSelectedTechId(Number(e.target.value))}
              required
            >
              <option value="">Choose technician...</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName} ({t.available ? 'Available' : 'Busy'}) - {t.skills || 'General Tech'}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Scheduled Arrival Date & Time</label>
            <input
              type="datetime-local"
              className="input-field"
              value={scheduledDateTime}
              onChange={(e) => setScheduledDateTime(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsDispatchModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Confirm Dispatch
            </button>
          </div>
        </form>
      </Modal>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Work Order"
      >
        <form onSubmit={handleCreateSubmit}>
          <div className="form-group">
            <label className="form-label">Target Service Request</label>
            <select
              className="select-field"
              value={newServiceRequestId || ''}
              onChange={(e) => setNewServiceRequestId(Number(e.target.value))}
              required
            >
              <option value="">Select ticket / service request...</option>
              {serviceRequests.map((sr) => (
                <option key={sr.id} value={sr.id}>
                  #{sr.id} - {sr.title} ({sr.customerCompanyName})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Assign Technician (Optional)</label>
            <select
              className="select-field"
              value={newTechId || ''}
              onChange={(e) => setNewTechId(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Leave unassigned for dispatch later</option>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName} ({t.available ? 'Available' : 'Busy'})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Scheduled Date & Time</label>
            <input
              type="datetime-local"
              className="input-field"
              value={newScheduledAt}
              onChange={(e) => setNewScheduledAt(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Job Instructions / Scope of Work</label>
            <textarea
              rows={3}
              className="textarea-field"
              placeholder="Instructions for technician on-site..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsCreateModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Create Work Order
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
