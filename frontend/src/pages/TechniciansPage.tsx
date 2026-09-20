import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { technicianApi } from '../api/technicians';
import { Technician } from '../types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  UserCheck,
  Plus,
  Search,
  Phone,
  Mail,
  Award,
  Wrench,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  ClipboardList
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const TechniciansPage: React.FC = () => {
  const { isAdmin, isManager } = useAuth();

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [availabilityFilter, setAvailabilityFilter] = useState<'ALL' | 'AVAILABLE' | 'BUSY'>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [skills, setSkills] = useState('');
  const [certifications, setCertifications] = useState('');
  const [available, setAvailable] = useState(true);
  const [notes, setNotes] = useState('');

  const fetchTechnicians = async () => {
    try {
      setLoading(true);
      const data = await technicianApi.getAll();
      setTechnicians(data);
    } catch (err) {
      console.error('Error fetching technicians', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTechnicians();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await technicianApi.create({
        username,
        email,
        password,
        firstName,
        lastName,
        phone,
        skills,
        certifications,
        available,
        notes
      });
      setIsCreateModalOpen(false);
      resetForm();
      fetchTechnicians();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create technician');
    }
  };

  const handleEditOpen = (tech: Technician) => {
    setSelectedTech(tech);
    setFirstName(tech.firstName || '');
    setLastName(tech.lastName || '');
    setEmail(tech.email || '');
    setPhone(tech.phone || '');
    setSkills(tech.skills || '');
    setCertifications(tech.certifications || '');
    setAvailable(tech.available);
    setNotes(tech.notes || '');
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTech) return;
    try {
      await technicianApi.update(selectedTech.id, {
        firstName,
        lastName,
        email,
        phone,
        skills,
        certifications,
        available,
        notes
      });
      setIsEditModalOpen(false);
      fetchTechnicians();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update technician');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this technician profile?')) return;
    try {
      await technicianApi.delete(id);
      fetchTechnicians();
    } catch (err) {
      alert('Failed to delete technician');
    }
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setFirstName('');
    setLastName('');
    setPhone('');
    setSkills('');
    setCertifications('');
    setAvailable(true);
    setNotes('');
  };

  const filtered = technicians.filter((tech) => {
    const name = `${tech.firstName || ''} ${tech.lastName || ''} ${tech.username || ''}`.toLowerCase();
    const matchesSearch =
      name.includes(searchTerm.toLowerCase()) ||
      (tech.skills || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tech.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesAvail =
      availabilityFilter === 'ALL' ||
      (availabilityFilter === 'AVAILABLE' && tech.available) ||
      (availabilityFilter === 'BUSY' && !tech.available);

    return matchesSearch && matchesAvail;
  });

  return (
    <Layout
      pageTitle="Technicians & Field Roster"
      subtitle="Manage field service workforce, skills certifications, and live dispatch availability"
      actions={
        (isAdmin || isManager) ? (
          <button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} className="btn-primary">
            <Plus size={16} />
            <span>Add Technician</span>
          </button>
        ) : undefined
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Search and Filters */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '36px' }}
              placeholder="Search technicians by name or skill..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => setAvailabilityFilter('ALL')}
              className={availabilityFilter === 'ALL' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
            >
              All ({technicians.length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('AVAILABLE')}
              className={availabilityFilter === 'AVAILABLE' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
            >
              Available ({technicians.filter(t => t.available).length})
            </button>
            <button
              onClick={() => setAvailabilityFilter('BUSY')}
              className={availabilityFilter === 'BUSY' ? 'btn-primary' : 'btn-secondary'}
              style={{ padding: '6px 14px', fontSize: '0.8125rem' }}
            >
              Busy ({technicians.filter(t => !t.available).length})
            </button>
          </div>
        </div>

        {/* Technician Cards Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
            <p style={{ color: '#94a3b8' }}>Loading technicians roster...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#64748b' }}>
            No technicians found
          </div>
        ) : (
          <div className="grid-cols-auto-fit">
            {filtered.map((tech) => (
              <div key={tech.id} className="glass-card" style={{ padding: '24px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '12px',
                          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.3), rgba(6, 182, 212, 0.3))',
                          border: '1px solid rgba(99, 102, 241, 0.4)',
                          color: '#f8fafc',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 800,
                          fontSize: '1.25rem'
                        }}
                      >
                        {tech.firstName?.[0] || tech.username?.[0] || 'T'}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#f8fafc' }}>
                          {tech.firstName} {tech.lastName}
                        </h4>
                        <span style={{ fontSize: '0.75rem', color: '#818cf8', fontWeight: 600 }}>
                          @{tech.username}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '3px 8px',
                        borderRadius: '9999px',
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        backgroundColor: tech.available ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                        color: tech.available ? '#34d399' : '#f87171',
                        border: `1px solid ${tech.available ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                      }}
                    >
                      {tech.available ? <CheckCircle size={10} /> : <XCircle size={10} />}
                      {tech.available ? 'AVAILABLE' : 'BUSY'}
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.8125rem', color: '#94a3b8', marginBottom: '16px' }}>
                    {tech.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Phone size={14} style={{ color: '#64748b' }} />
                        <span>{tech.phone}</span>
                      </div>
                    )}
                    {tech.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Mail size={14} style={{ color: '#64748b' }} />
                        <span>{tech.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Skills tags */}
                  {tech.skills && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '6px' }}>
                        Skills & Specialties
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {tech.skills.split(',').map((s, idx) => (
                          <span key={idx} style={{ padding: '2px 8px', borderRadius: '6px', backgroundColor: 'rgba(99, 102, 241, 0.12)', border: '1px solid rgba(99, 102, 241, 0.2)', color: '#c7d2fe', fontSize: '0.6875rem' }}>
                            {s.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Certifications */}
                  {tech.certifications && (
                    <div style={{ marginBottom: '14px' }}>
                      <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', marginBottom: '4px' }}>
                        Certifications
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#cbd5e1', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Award size={14} style={{ color: '#fbbf24', flexShrink: 0 }} />
                        <span>{tech.certifications}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer with active work orders count and actions */}
                <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8125rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <ClipboardList size={14} style={{ color: '#818cf8' }} />
                    <strong style={{ color: '#f8fafc' }}>{tech.activeWorkOrdersCount}</strong> active orders
                  </span>

                  {(isAdmin || isManager) && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleEditOpen(tech)} className="btn-icon" title="Edit Technician">
                        <Edit2 size={14} />
                      </button>
                      {isAdmin && (
                        <button onClick={() => handleDelete(tech.id)} className="btn-icon" style={{ color: '#f87171' }} title="Delete Technician">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Field Technician"
      >
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input type="text" required className="input-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input type="text" required className="input-field" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" required className="input-field" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" required className="input-field" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Skills (comma separated)</label>
            <input type="text" className="input-field" placeholder="HVAC, PLC, Electrical Systems, Hydraulics" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Certifications</label>
            <input type="text" className="input-field" placeholder="EPA Universal, OSHA 30, NATE" value={certifications} onChange={(e) => setCertifications(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Initial Availability</label>
            <select className="select-field" value={available ? 'true' : 'false'} onChange={(e) => setAvailable(e.target.value === 'true')}>
              <option value="true">Available for Dispatch</option>
              <option value="false">Busy / Assigned</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create Technician</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Technician — ${selectedTech?.firstName} ${selectedTech?.lastName}`}
      >
        <form onSubmit={handleUpdate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">First Name</label>
              <input type="text" className="input-field" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Last Name</label>
              <input type="text" className="input-field" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input type="email" className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Skills</label>
            <input type="text" className="input-field" value={skills} onChange={(e) => setSkills(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Certifications</label>
            <input type="text" className="input-field" value={certifications} onChange={(e) => setCertifications(e.target.value)} />
          </div>

          <div className="form-group">
            <label className="form-label">Availability Status</label>
            <select className="select-field" value={available ? 'true' : 'false'} onChange={(e) => setAvailable(e.target.value === 'true')}>
              <option value="true">Available for Dispatch</option>
              <option value="false">Busy / Assigned</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Internal Notes</label>
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
