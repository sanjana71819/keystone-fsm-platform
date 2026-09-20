import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { facilityApi } from '../api/facilities';
import { customerApi } from '../api/customers';
import { Facility, Customer } from '../types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  User,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2
} from 'lucide-react';

export const FacilitiesPage: React.FC = () => {
  const { user, isAdmin, isManager, isCustomer } = useAuth();

  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

  // Form states
  const [customerId, setCustomerId] = useState<number | undefined>(undefined);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [country, setCountry] = useState('US');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [active, setActive] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      let facs: Facility[];
      if (isCustomer && user?.customerId) {
        facs = await facilityApi.getByCustomer(user.customerId);
      } else {
        facs = await facilityApi.getAll();
      }
      setFacilities(facs);

      if (isAdmin || isManager) {
        const custs = await customerApi.getAll();
        setCustomers(custs);
        if (custs.length > 0) setCustomerId(custs[0].id);
      }
    } catch (err) {
      console.error('Error fetching facilities', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveCustId = isCustomer ? user?.customerId : customerId;
    if (!effectiveCustId) return;

    try {
      await facilityApi.create({
        customerId: effectiveCustId,
        name,
        address,
        city,
        state,
        zipCode,
        country,
        contactName,
        contactPhone,
        notes,
        active
      });
      setIsCreateModalOpen(false);
      resetForm();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create facility');
    }
  };

  const handleEditOpen = (f: Facility) => {
    setSelectedFacility(f);
    setName(f.name);
    setAddress(f.address || '');
    setCity(f.city || '');
    setState(f.state || '');
    setZipCode(f.zipCode || '');
    setCountry(f.country || 'US');
    setContactName(f.contactName || '');
    setContactPhone(f.contactPhone || '');
    setNotes(f.notes || '');
    setActive(f.active);
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFacility) return;
    try {
      await facilityApi.update(selectedFacility.id, {
        name,
        address,
        city,
        state,
        zipCode,
        country,
        contactName,
        contactPhone,
        notes,
        active
      });
      setIsEditModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update facility');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this facility site?')) return;
    try {
      await facilityApi.delete(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete facility');
    }
  };

  const resetForm = () => {
    setName('');
    setAddress('');
    setCity('');
    setState('');
    setZipCode('');
    setCountry('US');
    setContactName('');
    setContactPhone('');
    setNotes('');
    setActive(true);
  };

  const filtered = facilities.filter((f) => {
    const q = searchTerm.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      (f.customerCompanyName || '').toLowerCase().includes(q) ||
      (f.city || '').toLowerCase().includes(q) ||
      (f.address || '').toLowerCase().includes(q)
    );
  });

  return (
    <Layout
      pageTitle="Facility Sites & Physical Locations"
      subtitle="Physical customer properties, access protocols, site contacts, and regional branches"
      actions={
        <button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} className="btn-primary">
          <Plus size={16} />
          <span>Add Facility Site</span>
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '36px' }}
              placeholder="Search facility name, address, or city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Total Sites: <strong style={{ color: '#f8fafc' }}>{facilities.length}</strong>
          </span>
        </div>

        {/* Facility Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
            <p style={{ color: '#94a3b8' }}>Loading facility directory...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No facilities found
          </div>
        ) : (
          <div className="grid-cols-auto-fit">
            {filtered.map((fac) => (
              <div key={fac.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f8fafc' }}>{fac.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600 }}>{fac.customerCompanyName}</span>
                      </div>
                    </div>
                    <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px', backgroundColor: fac.active ? 'rgba(16, 185, 129, 0.15)' : 'rgba(100, 116, 139, 0.15)', color: fac.active ? '#34d399' : '#94a3b8' }}>
                      {fac.active ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <MapPin size={15} style={{ color: '#64748b', flexShrink: 0, marginTop: '2px' }} />
                      <span>{fac.address}, {fac.city}, {fac.state} {fac.zipCode}</span>
                    </div>
                    {fac.contactName && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={15} style={{ color: '#64748b', flexShrink: 0 }} />
                        <span>Site Contact: <strong style={{ color: '#f1f5f9' }}>{fac.contactName}</strong></span>
                      </div>
                    )}
                    {fac.contactPhone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={15} style={{ color: '#64748b', flexShrink: 0 }} />
                        <span>{fac.contactPhone}</span>
                      </div>
                    )}
                  </div>

                  {fac.notes && (
                    <div style={{ padding: '8px 10px', borderRadius: '8px', backgroundColor: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.05)', fontSize: '0.75rem', color: '#94a3b8' }}>
                      <strong style={{ color: '#cbd5e1' }}>Access Protocol:</strong> {fac.notes}
                    </div>
                  )}
                </div>

                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                  <button onClick={() => handleEditOpen(fac)} className="btn-icon" title="Edit Facility">
                    <Edit2 size={14} />
                  </button>
                  {isAdmin && (
                    <button onClick={() => handleDelete(fac.id)} className="btn-icon" style={{ color: '#f87171' }} title="Delete Facility">
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Facility Location">
        <form onSubmit={handleCreate}>
          {(isAdmin || isManager) && (
            <div className="form-group">
              <label className="form-label">Customer Organization</label>
              <select className="select-field" value={customerId || ''} onChange={(e) => setCustomerId(Number(e.target.value))} required>
                <option value="">Select customer...</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>{c.companyName}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Facility / Site Name</label>
            <input type="text" required className="input-field" placeholder="e.g. Apex Distribution Center West" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input type="text" className="input-field" placeholder="123 Industrial Parkway" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" className="input-field" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input type="text" className="input-field" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Zip Code</label>
              <input type="text" className="input-field" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">On-Site Contact Name</label>
              <input type="text" className="input-field" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Site Contact Phone</label>
              <input type="text" className="input-field" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Access Instructions / Safety Guidelines</label>
            <textarea rows={2} className="textarea-field" placeholder="Gate passcode, PPE requirements, loading dock clearance..." value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Add Site Location</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Facility — ${selectedFacility?.name}`}>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Facility Name</label>
            <input type="text" required className="input-field" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Street Address</label>
            <input type="text" className="input-field" value={address} onChange={(e) => setAddress(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px' }}>
            <div className="form-group">
              <label className="form-label">City</label>
              <input type="text" className="input-field" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">State</label>
              <input type="text" className="input-field" value={state} onChange={(e) => setState(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Zip Code</label>
              <input type="text" className="input-field" value={zipCode} onChange={(e) => setZipCode(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Contact Name</label>
              <input type="text" className="input-field" value={contactName} onChange={(e) => setContactName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input type="text" className="input-field" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="select-field" value={active ? 'true' : 'false'} onChange={(e) => setActive(e.target.value === 'true')}>
              <option value="true">Active Site</option>
              <option value="false">Inactive / Closed Site</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea rows={2} className="textarea-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
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
