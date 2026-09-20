import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { serviceRequestApi } from '../api/serviceRequests';
import { customerApi } from '../api/customers';
import { facilityApi } from '../api/facilities';
import { ServiceRequest, Customer, Facility, Priority, RequestStatus } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Plus,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  Building2,
  Calendar,
  Eye,
  Edit2,
  Trash2,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const ServiceRequestsPage: React.FC = () => {
  const { user, role, isAdmin, isManager, isCustomer } = useAuth();

  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [showOverdueOnly, setShowOverdueOnly] = useState(false);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCustomerId, setNewCustomerId] = useState<number | undefined>(undefined);
  const [newFacilityId, setNewFacilityId] = useState<number | undefined>(undefined);
  const [newPriority, setNewPriority] = useState<Priority>('MEDIUM');
  const [newSlaHours, setNewSlaHours] = useState<number>(24);

  // Edit form state
  const [editStatus, setEditStatus] = useState<RequestStatus>('OPEN');
  const [editPriority, setEditPriority] = useState<Priority>('MEDIUM');
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      let data: ServiceRequest[];
      if (isCustomer && user?.customerId) {
        data = await serviceRequestApi.getByCustomer(user.customerId);
      } else {
        data = await serviceRequestApi.getAll();
      }
      setRequests(data);

      if (isAdmin || isManager) {
        const [custs, facs] = await Promise.all([
          customerApi.getAll(),
          facilityApi.getAll()
        ]);
        setCustomers(custs);
        setFacilities(facs);
        if (custs.length > 0) setNewCustomerId(custs[0].id);
      }
    } catch (err) {
      console.error('Error loading service requests', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCustomerChange = (customerId: number) => {
    setNewCustomerId(customerId);
    const customerFacilities = facilities.filter(f => f.customerId === customerId);
    if (customerFacilities.length > 0) {
      setNewFacilityId(customerFacilities[0].id);
    } else {
      setNewFacilityId(undefined);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await serviceRequestApi.create({
        customerId: newCustomerId,
        facilityId: newFacilityId,
        title: newTitle,
        description: newDescription,
        priority: newPriority,
        slaHours: newSlaHours
      });
      setIsCreateModalOpen(false);
      setNewTitle('');
      setNewDescription('');
      fetchData();
    } catch (err) {
      alert('Failed to create service request');
    }
  };

  const handleEditOpen = (req: ServiceRequest) => {
    setSelectedRequest(req);
    setEditTitle(req.title);
    setEditDescription(req.description || '');
    setEditStatus(req.status);
    setEditPriority(req.priority);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      await serviceRequestApi.update(selectedRequest.id, {
        title: editTitle,
        description: editDescription,
        status: editStatus,
        priority: editPriority
      });
      setIsEditModalOpen(false);
      fetchData();
    } catch (err) {
      alert('Failed to update request');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this service request?')) return;
    try {
      await serviceRequestApi.delete(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete request');
    }
  };

  const filteredRequests = requests.filter(req => {
    const matchesSearch =
      req.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.customerCompanyName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (req.facilityName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.id.toString().includes(searchTerm);

    const matchesStatus = statusFilter === 'ALL' || req.status === statusFilter;
    const matchesPriority = priorityFilter === 'ALL' || req.priority === priorityFilter;
    const matchesOverdue = !showOverdueOnly || req.isOverdue;

    return matchesSearch && matchesStatus && matchesPriority && matchesOverdue;
  });

  return (
    <Layout
      pageTitle="Service Requests & Ticketing"
      subtitle="Manage inbound customer issues, SLA tracking, and resolution progress"
      actions={
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn-primary"
        >
          <Plus size={16} />
          <span>New Service Request</span>
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Search & Filter Bar */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', minWidth: '260px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
              <input
                type="text"
                className="input-field"
                style={{ paddingLeft: '36px' }}
                placeholder="Search requests by title, customer, facility or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {/* Status Filter */}
            <select
              className="select-field"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>

            {/* Priority Filter */}
            <select
              className="select-field"
              style={{ width: 'auto' }}
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Overdue Toggle */}
            <button
              onClick={() => setShowOverdueOnly(!showOverdueOnly)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '0.625rem 1rem',
                borderRadius: '10px',
                fontSize: '0.875rem',
                fontWeight: 600,
                border: showOverdueOnly ? '1px solid #ef4444' : '1px solid rgba(255, 255, 255, 0.08)',
                backgroundColor: showOverdueOnly ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.05)',
                color: showOverdueOnly ? '#f87171' : '#94a3b8',
                cursor: 'pointer'
              }}
            >
              <AlertTriangle size={15} />
              <span>Overdue Only</span>
            </button>
          </div>
        </div>

        {/* Requests Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Title & Details</th>
                <th>Customer / Site</th>
                <th>Priority</th>
                <th>Status</th>
                <th>SLA & Due Date</th>
                <th>Work Order</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    Loading service requests...
                  </td>
                </tr>
              ) : filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No service requests found matching criteria
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => (
                  <tr key={req.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontWeight: 700, color: '#818cf8' }}>
                        #{req.id}
                      </span>
                    </td>
                    <td style={{ maxWidth: '280px' }}>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{req.title}</div>
                      {req.description && (
                        <div style={{ fontSize: '0.75rem', color: '#94a3b8', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                          {req.description}
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#f1f5f9' }}>{req.customerCompanyName || 'N/A'}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{req.facilityName || 'Main Office'}</div>
                    </td>
                    <td>
                      <PriorityBadge priority={req.priority} />
                    </td>
                    <td>
                      <StatusBadge status={req.status} />
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Clock size={14} style={{ color: req.isOverdue ? '#ef4444' : '#64748b' }} />
                        <span style={{ fontSize: '0.8125rem', color: req.isOverdue ? '#f87171' : '#cbd5e1', fontWeight: req.isOverdue ? 700 : 400 }}>
                          {req.dueAt ? new Date(req.dueAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'No SLA'}
                        </span>
                      </div>
                      {req.isOverdue && (
                        <span style={{ fontSize: '0.6875rem', color: '#ef4444', fontWeight: 700 }}>
                          OVERDUE
                        </span>
                      )}
                    </td>
                    <td>
                      {req.workOrderId ? (
                        <Link
                          to={`/work-orders/${req.workOrderId}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            color: '#818cf8',
                            fontSize: '0.8125rem',
                            fontWeight: 600,
                            textDecoration: 'none'
                          }}
                        >
                          WO #{req.workOrderId}
                          <ArrowRight size={13} />
                        </Link>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>None</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button
                          onClick={() => handleEditOpen(req)}
                          className="btn-icon"
                          title="Edit request"
                        >
                          <Edit2 size={14} />
                        </button>
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(req.id)}
                            className="btn-icon"
                            style={{ color: '#f87171' }}
                            title="Delete request"
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

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Service Request"
      >
        <form onSubmit={handleCreate}>
          {(isAdmin || isManager) && (
            <div className="form-group">
              <label className="form-label">Customer Account</label>
              <select
                className="select-field"
                value={newCustomerId || ''}
                onChange={(e) => handleCustomerChange(Number(e.target.value))}
                required
              >
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Facility / Site Location</label>
            <select
              className="select-field"
              value={newFacilityId || ''}
              onChange={(e) => setNewFacilityId(Number(e.target.value))}
            >
              <option value="">Select facility...</option>
              {facilities
                .filter((f) => !newCustomerId || f.customerId === newCustomerId)
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name} ({f.city}, {f.state})
                  </option>
                ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Title</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., Primary Coolant Circuit Low Pressure Alarm"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Detailed Description</label>
            <textarea
              rows={3}
              className="textarea-field"
              placeholder="Describe equipment behavior, symptoms, fault codes..."
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="select-field"
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as Priority)}
              >
                <option value="CRITICAL">Critical (4h SLA)</option>
                <option value="HIGH">High (12h SLA)</option>
                <option value="MEDIUM">Medium (24h SLA)</option>
                <option value="LOW">Low (48h SLA)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">SLA Target (Hours)</label>
              <input
                type="number"
                min={1}
                max={168}
                className="input-field"
                value={newSlaHours}
                onChange={(e) => setNewSlaHours(Number(e.target.value))}
              />
            </div>
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
              Submit Request
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Update Service Request #${selectedRequest?.id}`}
      >
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              type="text"
              required
              className="input-field"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              rows={3}
              className="textarea-field"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Status</label>
              <select
                className="select-field"
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as RequestStatus)}
              >
                <option value="OPEN">OPEN</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="ON_HOLD">ON HOLD</option>
                <option value="RESOLVED">RESOLVED</option>
                <option value="CLOSED">CLOSED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Priority</label>
              <select
                className="select-field"
                value={editPriority}
                onChange={(e) => setEditPriority(e.target.value as Priority)}
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
