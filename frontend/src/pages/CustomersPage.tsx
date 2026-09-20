import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { customerApi } from '../api/customers';
import { Customer } from '../types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Plus,
  Search,
  Building2,
  Phone,
  Mail,
  MapPin,
  Edit2,
  Trash2
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const CustomersPage: React.FC = () => {
  const { isAdmin, isManager } = useAuth();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form state
  const [companyName, setCompanyName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [billingAddress, setBillingAddress] = useState('');
  const [notes, setNotes] = useState('');

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const data = await customerApi.getAll();
      setCustomers(data);
    } catch (err) {
      console.error('Error fetching customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await customerApi.create({
        companyName,
        username,
        password,
        email,
        firstName,
        lastName,
        contactPhone,
        billingAddress,
        notes
      });
      setIsCreateModalOpen(false);
      resetForm();
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create customer');
    }
  };

  const handleEditOpen = (c: Customer) => {
    setSelectedCustomer(c);
    setCompanyName(c.companyName);
    setFirstName(c.firstName || '');
    setLastName(c.lastName || '');
    setEmail(c.email || '');
    setContactPhone(c.contactPhone || '');
    setBillingAddress(c.billingAddress || '');
    setNotes(c.notes || '');
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer) return;
    try {
      await customerApi.update(selectedCustomer.id, {
        companyName,
        firstName,
        lastName,
        email,
        contactPhone,
        billingAddress,
        notes
      });
      setIsEditModalOpen(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update customer');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete customer account and all associated facilities?')) return;
    try {
      await customerApi.delete(id);
      fetchCustomers();
    } catch (err) {
      alert('Failed to delete customer');
    }
  };

  const resetForm = () => {
    setCompanyName('');
    setUsername('');
    setPassword('');
    setEmail('');
    setFirstName('');
    setLastName('');
    setContactPhone('');
    setBillingAddress('');
    setNotes('');
  };

  const filtered = customers.filter((c) => {
    const q = searchTerm.toLowerCase();
    return (
      c.companyName.toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q) ||
      (c.firstName || '').toLowerCase().includes(q) ||
      (c.lastName || '').toLowerCase().includes(q)
    );
  });

  return (
    <Layout
      pageTitle="Customers & Client Accounts"
      subtitle="Enterprise customer directory, contract SLA terms, and registered facilities"
      actions={
        (isAdmin || isManager) ? (
          <button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} className="btn-primary">
            <Plus size={16} />
            <span>Add Customer Account</span>
          </button>
        ) : undefined
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
              placeholder="Search company or contact name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>
            Total Customers: <strong style={{ color: '#f8fafc' }}>{customers.length}</strong>
          </span>
        </div>

        {/* Customer Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Company Name</th>
                <th>Primary Contact</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Facilities</th>
                <th>Billing Address</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                    Loading customer accounts...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No customer accounts found
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: '#f8fafc' }}>{c.companyName}</div>
                      {c.notes && <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>{c.notes}</div>}
                    </td>
                    <td>
                      <div style={{ fontWeight: 500, color: '#e2e8f0' }}>
                        {c.firstName || c.lastName ? `${c.firstName || ''} ${c.lastName || ''}` : c.username}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{c.contactPhone || 'N/A'}</span>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#818cf8' }}>{c.email || 'N/A'}</span>
                    </td>
                    <td>
                      <Link
                        to={`/facilities`}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#38bdf8',
                          fontSize: '0.8125rem',
                          fontWeight: 600,
                          textDecoration: 'none'
                        }}
                      >
                        <Building2 size={13} />
                        <span>{c.facilitiesCount} sites</span>
                      </Link>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#64748b', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden', display: 'block' }}>
                        {c.billingAddress || 'No address'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        <button onClick={() => handleEditOpen(c)} className="btn-icon" title="Edit Customer">
                          <Edit2 size={14} />
                        </button>
                        {isAdmin && (
                          <button onClick={() => handleDelete(c.id)} className="btn-icon" style={{ color: '#f87171' }} title="Delete Customer">
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
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Add Customer Account">
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input type="text" required className="input-field" placeholder="Apex Logistics Hub LLC" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Contact First Name</label>
              <input type="text" className="input-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Last Name</label>
              <input type="text" className="input-field" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" required className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Portal Password</label>
              <input type="password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input type="text" className="input-field" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Billing Address</label>
            <input type="text" className="input-field" placeholder="100 Enterprise Blvd, Suite 400" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Account Notes / Contract Terms</label>
            <textarea rows={2} className="textarea-field" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Customer</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit Customer — ${selectedCustomer?.companyName}`}>
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input type="text" required className="input-field" value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Contact First Name</label>
              <input type="text" className="input-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Last Name</label>
              <input type="text" className="input-field" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Contact Phone</label>
              <input type="text" className="input-field" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Billing Address</label>
            <input type="text" className="input-field" value={billingAddress} onChange={(e) => setBillingAddress(e.target.value)} />
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
