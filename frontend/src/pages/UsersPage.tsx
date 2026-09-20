import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { userApi } from '../api/users';
import { User, Role } from '../types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  Edit2,
  Trash2,
  Key,
  UserCheck
} from 'lucide-react';

export const UsersPage: React.FC = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('ALL');

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('TECHNICIAN');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [enabled, setEnabled] = useState(true);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userApi.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await userApi.create({
        username,
        email,
        password,
        role,
        firstName,
        lastName,
        phone
      });
      setIsCreateModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create user');
    }
  };

  const handleEditOpen = (u: User) => {
    setSelectedUser(u);
    setEmail(u.email);
    setRole(u.role);
    setFirstName(u.firstName || '');
    setLastName(u.lastName || '');
    setPhone(u.phone || '');
    setEnabled(u.enabled);
    setPassword('');
    setIsEditModalOpen(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    try {
      await userApi.update(selectedUser.id, {
        email,
        role,
        firstName,
        lastName,
        phone,
        enabled,
        password: password ? password : undefined
      });
      setIsEditModalOpen(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  const handleDelete = async (id: number) => {
    if (id === currentUser?.id) {
      alert('You cannot delete your own active admin account.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user account?')) return;
    try {
      await userApi.delete(id);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete user');
    }
  };

  const resetForm = () => {
    setUsername('');
    setEmail('');
    setPassword('');
    setRole('TECHNICIAN');
    setFirstName('');
    setLastName('');
    setPhone('');
    setEnabled(true);
  };

  const filtered = users.filter((u) => {
    const q = searchTerm.toLowerCase();
    const name = `${u.firstName || ''} ${u.lastName || ''} ${u.username}`.toLowerCase();
    const matchesSearch = name.includes(q) || u.email.toLowerCase().includes(q);
    const matchesRole = roleFilter === 'ALL' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeStyle = (r: Role) => {
    switch (r) {
      case 'ADMIN':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)' };
      case 'MANAGER':
        return { bg: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' };
      case 'TECHNICIAN':
        return { bg: 'rgba(99, 102, 241, 0.15)', color: '#818cf8', border: '1px solid rgba(99, 102, 241, 0.3)' };
      case 'CUSTOMER':
        return { bg: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', border: '1px solid rgba(6, 182, 212, 0.3)' };
    }
  };

  return (
    <Layout
      pageTitle="User Accounts & Access Control"
      subtitle="Role-based permissions (ADMIN, MANAGER, TECHNICIAN, CUSTOMER) and credentials"
      actions={
        <button onClick={() => { resetForm(); setIsCreateModalOpen(true); }} className="btn-primary">
          <Plus size={16} />
          <span>Add User Account</span>
        </button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Search & Filters */}
        <div className="glass-card" style={{ padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ position: 'relative', width: '320px' }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#64748b' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '36px' }}
              placeholder="Search user name or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'ADMIN', 'MANAGER', 'TECHNICIAN', 'CUSTOMER'].map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: roleFilter === r ? '1px solid #6366f1' : '1px solid rgba(255, 255, 255, 0.08)',
                  backgroundColor: roleFilter === r ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.04)',
                  color: roleFilter === r ? '#ffffff' : '#94a3b8'
                }}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Users Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>User / Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Phone</th>
                <th>Status</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px' }}>
                    Loading users...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No users matching criteria
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const style = getRoleBadgeStyle(u.role);
                  return (
                    <tr key={u.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: style.bg, color: style.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8125rem' }}>
                            {u.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#f8fafc' }}>
                              {u.firstName || u.lastName ? `${u.firstName || ''} ${u.lastName || ''}` : u.username}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>@{u.username}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>{u.email}</span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.6875rem', fontWeight: 700, padding: '3px 8px', borderRadius: '9999px', backgroundColor: style.bg, color: style.color, border: style.border }}>
                          {u.role}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>{u.phone || '—'}</span>
                      </td>
                      <td>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: u.enabled ? '#34d399' : '#f87171' }}>
                          {u.enabled ? <CheckCircle size={13} /> : <XCircle size={13} />}
                          {u.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                          {new Date(u.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '6px' }}>
                          <button onClick={() => handleEditOpen(u)} className="btn-icon" title="Edit User">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(u.id)} className="btn-icon" style={{ color: '#f87171' }} title="Delete User">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Modal */}
      <Modal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} title="Create New User Account">
        <form onSubmit={handleCreate}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Username</label>
              <input type="text" required className="input-field" placeholder="alex.keystone" value={username} onChange={(e) => setUsername(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Temporary Password</label>
              <input type="password" required className="input-field" placeholder="Min 6 characters" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>

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
              <input type="email" required className="input-field" placeholder="alex@company.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">System Role & Permissions</label>
            <select className="select-field" value={role} onChange={(e) => setRole(e.target.value as Role)}>
              <option value="ADMIN">ADMIN (Full Platform Access)</option>
              <option value="MANAGER">MANAGER (Operations & Dispatch Control)</option>
              <option value="TECHNICIAN">TECHNICIAN (Field Execution & Time Clock)</option>
              <option value="CUSTOMER">CUSTOMER (Self-Service Portal Only)</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Create User</button>
          </div>
        </form>
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title={`Edit User — @${selectedUser?.username}`}>
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
              <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input type="text" className="input-field" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Role</label>
              <select className="select-field" value={role} onChange={(e) => setRole(e.target.value as Role)}>
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="TECHNICIAN">TECHNICIAN</option>
                <option value="CUSTOMER">CUSTOMER</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Account Status</label>
              <select className="select-field" value={enabled ? 'true' : 'false'} onChange={(e) => setEnabled(e.target.value === 'true')}>
                <option value="true">Enabled</option>
                <option value="false">Disabled / Suspended</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Reset Password (leave blank to keep current)</label>
            <input type="password" className="input-field" placeholder="Enter new password..." value={password} onChange={(e) => setPassword(e.target.value)} />
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
