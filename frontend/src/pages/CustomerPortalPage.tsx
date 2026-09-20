import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { serviceRequestApi } from '../api/serviceRequests';
import { facilityApi } from '../api/facilities';
import { customerApi } from '../api/customers';
import { ServiceRequest, Facility, Customer, Priority } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { PriorityBadge } from '../components/PriorityBadge';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Plus,
  Inbox,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Send,
  Phone,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomerPortalPage: React.FC = () => {
  const { user } = useAuth();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [facilityId, setFacilityId] = useState<number | undefined>(undefined);
  const [priority, setPriority] = useState<Priority>('MEDIUM');

  const fetchData = async () => {
    try {
      setLoading(true);
      if (user?.id) {
        let custData: Customer | null = null;
        try {
          custData = await customerApi.getByUserId(user.id);
          setCustomer(custData);
        } catch (e) {
          console.log('User has no direct customer profile yet');
        }

        if (custData) {
          const [facs, reqs] = await Promise.all([
            facilityApi.getByCustomer(custData.id),
            serviceRequestApi.getByCustomer(custData.id)
          ]);
          setFacilities(facs);
          setRequests(reqs);
          if (facs.length > 0) setFacilityId(facs[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching customer portal data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customer) return;

    try {
      await serviceRequestApi.create({
        customerId: customer.id,
        facilityId,
        title,
        description,
        priority
      });
      setIsSubmitModalOpen(false);
      setTitle('');
      setDescription('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit service request');
    }
  };

  const openTickets = requests.filter(r => r.status === 'OPEN' || r.status === 'IN_PROGRESS');
  const resolvedTickets = requests.filter(r => r.status === 'RESOLVED' || r.status === 'CLOSED');

  return (
    <Layout
      pageTitle="Customer Self-Service Portal"
      subtitle={`Welcome, ${customer?.companyName || user?.firstName || user?.username}! Request maintenance, monitor dispatch, and track SLA delivery.`}
      actions={
        <button onClick={() => setIsSubmitModalOpen(true)} className="btn-primary">
          <Plus size={16} />
          <span>Submit Service Request</span>
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Welcome Header Banner */}
        <div
          style={{
            padding: '28px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(99, 102, 241, 0.25)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px'
          }}
        >
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '6px' }}>
              <Sparkles size={14} />
              Enterprise Support SLA Tier 1
            </div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc' }}>
              {customer?.companyName || 'Your Service Account'}
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#94a3b8', marginTop: '4px' }}>
              Direct access to KEYSTONE certified field service engineers and scheduled facility maintenance.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px' }}>
            <div style={{ padding: '12px 20px', borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Open Requests</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#60a5fa', marginTop: '2px' }}>
                {openTickets.length}
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Resolved</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#34d399', marginTop: '2px' }}>
                {resolvedTickets.length}
              </div>
            </div>
            <div style={{ padding: '12px 20px', borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.7)', border: '1px solid rgba(255, 255, 255, 0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Facilities</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#f8fafc', marginTop: '2px' }}>
                {facilities.length}
              </div>
            </div>
          </div>
        </div>

        {/* 2-Column Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: '24px' }}>
          {/* Active Tickets & Recent History */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Inbox size={20} style={{ color: '#818cf8' }} />
                Your Service Requests
              </h3>
              <Link to="/service-requests" style={{ fontSize: '0.8125rem', color: '#818cf8', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                View All <ArrowRight size={14} />
              </Link>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#94a3b8' }}>Loading tickets...</div>
            ) : requests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#64748b' }}>
                <p style={{ marginBottom: '12px' }}>You haven't submitted any service requests yet.</p>
                <button onClick={() => setIsSubmitModalOpen(true)} className="btn-secondary">
                  Submit First Request
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {requests.slice(0, 5).map((req) => (
                  <div
                    key={req.id}
                    style={{
                      padding: '16px',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                          <span style={{ fontSize: '0.75rem', fontFamily: 'monospace', fontWeight: 700, color: '#818cf8' }}>
                            #{req.id}
                          </span>
                          <PriorityBadge priority={req.priority} />
                          <StatusBadge status={req.status} />
                        </div>
                        <h4 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#f8fafc' }}>{req.title}</h4>
                      </div>
                      <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={13} /> {req.facilityName || 'Main Site'}
                      </span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Clock size={13} style={{ color: req.isOverdue ? '#ef4444' : '#64748b' }} />
                        SLA: {req.slaHours}h target ({req.dueAt ? new Date(req.dueAt).toLocaleDateString() : 'Active'})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registered Facility Sites */}
          <div className="glass-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Building2 size={20} style={{ color: '#06b6d4' }} />
                Your Facilities ({facilities.length})
              </h3>
              <Link to="/facilities" style={{ fontSize: '0.8125rem', color: '#38bdf8', fontWeight: 600, textDecoration: 'none' }}>
                Manage Sites
              </Link>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {facilities.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No facility locations registered.</p>
              ) : (
                facilities.map((fac) => (
                  <div
                    key={fac.id}
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.02)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div style={{ fontWeight: 700, color: '#f8fafc', fontSize: '0.875rem' }}>{fac.name}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                      <MapPin size={13} style={{ color: '#64748b' }} />
                      <span>{fac.address}, {fac.city}, {fac.state}</span>
                    </div>
                    {fac.contactName && (
                      <div style={{ fontSize: '0.6875rem', color: '#64748b', marginTop: '4px' }}>
                        Site Contact: {fac.contactName} ({fac.contactPhone || 'N/A'})
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Submit Request Modal */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit New Service Request"
      >
        <form onSubmit={handleSubmitRequest}>
          <div className="form-group">
            <label className="form-label">Facility / Site Location</label>
            <select
              className="select-field"
              value={facilityId || ''}
              onChange={(e) => setFacilityId(Number(e.target.value))}
              required
            >
              <option value="">Select facility location...</option>
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name} ({f.address}, {f.city})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Issue Summary</label>
            <input
              type="text"
              required
              className="input-field"
              placeholder="e.g., HVAC cooling compressor failure in Server Room B"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description of Failure / Symptoms</label>
            <textarea
              rows={4}
              className="textarea-field"
              placeholder="Please provide details, equipment model, error codes on display, or immediate impacts..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Urgency / Priority</label>
            <select
              className="select-field"
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
            >
              <option value="CRITICAL">Critical (4h Emergency Response)</option>
              <option value="HIGH">High (12h Urgent Response)</option>
              <option value="MEDIUM">Medium (24h Standard Response)</option>
              <option value="LOW">Low (48h Routine Maintenance)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              onClick={() => setIsSubmitModalOpen(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              <Send size={15} />
              <span>Submit Ticket</span>
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
