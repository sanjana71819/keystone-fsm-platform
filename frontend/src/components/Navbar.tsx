import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Bell, Sparkles, Activity } from 'lucide-react';

interface NavbarProps {
  pageTitle: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export const Navbar: React.FC<NavbarProps> = ({ pageTitle, subtitle, actions }) => {
  const { user, role } = useAuth();

  return (
    <header
      style={{
        height: '70px',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
        backgroundColor: 'rgba(12, 18, 32, 0.8)',
        backdropFilter: 'blur(16px)',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}
    >
      <div>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '8px' }}>
          {pageTitle}
        </h1>
        {subtitle && (
          <p style={{ fontSize: '0.75rem', color: '#64748b' }}>{subtitle}</p>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {actions}

        {/* System status pill */}
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            padding: '4px 10px',
            borderRadius: '9999px',
            fontSize: '0.6875rem',
            fontWeight: 600,
            color: '#34d399'
          }}
        >
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          System Operational
        </div>
      </div>
    </header>
  );
};
