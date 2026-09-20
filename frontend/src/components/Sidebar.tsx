import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  ClipboardList,
  Users,
  Building2,
  Boxes,
  Clock,
  UserCheck,
  LogOut,
  Sparkles,
  ChevronRight,
  Shield
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, role, isAdmin, isManager, isTechnician, isCustomer, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    // Admin / Manager navigation
    ...((isAdmin || isManager) ? [
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/service-requests', label: 'Service Requests', icon: Inbox },
      { to: '/work-orders', label: 'Work Orders', icon: ClipboardList },
      { to: '/technicians', label: 'Technicians', icon: UserCheck },
      { to: '/customers', label: 'Customers', icon: Users },
      { to: '/facilities', label: 'Facilities', icon: Building2 },
      { to: '/inventory', label: 'Parts & Inventory', icon: Boxes },
      { to: '/time-tracking', label: 'Time Tracking', icon: Clock },
    ] : []),

    // Technician navigation
    ...(isTechnician ? [
      { to: '/work-orders', label: 'My Work Orders', icon: ClipboardList },
      { to: '/service-requests', label: 'Service Requests', icon: Inbox },
      { to: '/time-tracking', label: 'Time Clock', icon: Clock },
      { to: '/inventory', label: 'Parts Catalog', icon: Boxes },
      { to: '/technicians', label: 'Team Directory', icon: UserCheck },
    ] : []),

    // Customer navigation
    ...(isCustomer ? [
      { to: '/portal', label: 'Customer Portal', icon: Sparkles },
      { to: '/service-requests', label: 'My Requests', icon: Inbox },
      { to: '/facilities', label: 'My Facilities', icon: Building2 },
    ] : []),

    // Admin only
    ...(isAdmin ? [
      { to: '/users', label: 'User Management', icon: Shield },
    ] : []),
  ];

  return (
    <aside
      style={{
        width: '260px',
        backgroundColor: '#0c1220',
        borderColor: 'rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        zIndex: 40,
        borderRight: '1px solid rgba(255, 255, 255, 0.08)'
      }}
    >
      {/* Brand Header */}
      <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.125rem',
              boxShadow: '0 4px 15px rgba(99, 102, 241, 0.4)'
            }}
          >
            K
          </div>
          <div>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em', background: 'linear-gradient(to right, #ffffff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              KEYSTONE
            </div>
            <div style={{ fontSize: '0.6875rem', fontWeight: 600, color: '#6366f1', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Field Service FSM
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Links */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.08em', padding: '0 12px 10px 12px' }}>
          Navigation
        </div>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '10px 14px',
                  borderRadius: '10px',
                  fontSize: '0.875rem',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#ffffff' : '#94a3b8',
                  backgroundColor: isActive ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                  textDecoration: 'none',
                  transition: 'all 0.15s ease'
                })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Icon size={18} style={{ color: '#818cf8' }} />
                  <span>{item.label}</span>
                </div>
                <ChevronRight size={14} style={{ opacity: 0.4 }} />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* User Profile & Logout footer */}
      <div style={{ padding: '16px 14px', borderTop: '1px solid rgba(255, 255, 255, 0.06)', backgroundColor: 'rgba(0, 0, 0, 0.2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.875rem'
              }}
            >
              {user?.username?.[0]?.toUpperCase() || 'U'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9', textOverflow: 'ellipsis', whiteSpace: 'nowrap', overflow: 'hidden' }}>
                {user?.firstName ? `${user.firstName} ${user.lastName || ''}` : user?.username}
              </div>
              <div style={{ fontSize: '0.6875rem', color: '#6366f1', fontWeight: 600 }}>
                {role}
              </div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '6px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            title="Log Out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};
