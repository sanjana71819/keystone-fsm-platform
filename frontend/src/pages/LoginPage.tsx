import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Sparkles, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { authApi } from '../api/auth';

export const LoginPage: React.FC = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const getErrorMessage = (err: any, fallback: string) => {
    console.error('API Error details:', err?.response);
    if (!err.response) return 'Unable to connect to server. Please try again.';
    const data = err.response.data;
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    if (typeof data === 'object') {
      const messages = Object.values(data).filter(v => typeof v === 'string' && v.length > 0);
      if (messages.length > 0) return messages.join(', ');
    }
    return fallback;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login({ username, password });
      if (res.role === 'CUSTOMER') {
        navigate('/portal');
      } else {
        navigate(from === '/login' ? '/dashboard' : from);
      }
    } catch (err: any) {
      setError(getErrorMessage(err, 'Invalid username or password'));
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const regRes = await authApi.register({
        username,
        email,
        password,
        firstName,
        lastName,
        companyName,
        role: 'CUSTOMER'
      });
      
      if (regRes && regRes.token) {
        localStorage.setItem('keystone_token', regRes.token);
        localStorage.setItem('keystone_user', JSON.stringify({
          id: regRes.userId,
          username: regRes.username,
          email: regRes.email,
          role: regRes.role || 'CUSTOMER',
          firstName: regRes.firstName,
          lastName: regRes.lastName,
          enabled: true,
          customerId: regRes.customerId,
          technicianId: regRes.technicianId,
          createdAt: new Date().toISOString()
        }));
        window.location.href = '/portal';
      } else {
        await login({ username, password });
        navigate('/portal');
      }
    } catch (err: any) {
      console.error('Registration Error:', err);
      setError(getErrorMessage(err, 'Registration failed. Please check your information.'));
    } finally {
      setLoading(false);
    }
  };

  const setDemoCredentials = (u: string, p: string) => {
    setUsername(u);
    setPassword(p);
    setError(null);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#090d16', padding: '24px' }}>
      <div style={{ width: '100%', maxWidth: '440px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div
            style={{
              width: '54px',
              height: '54px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #06b6d4 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.75rem',
              margin: '0 auto 16px auto',
              boxShadow: '0 8px 30px rgba(99, 102, 241, 0.45)'
            }}
          >
            K
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.03em' }}>
            KEYSTONE FSM
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '0.875rem', marginTop: '4px' }}>
            Enterprise Field Service & Dispatch Management
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-card" style={{ padding: '32px', backgroundColor: 'rgba(15, 23, 42, 0.9)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid rgba(255, 255, 255, 0.08)', marginBottom: '24px' }}>
            <button
              onClick={() => { setIsRegistering(false); setError(null); }}
              style={{
                flex: 1,
                padding: '10px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: !isRegistering ? '2px solid #6366f1' : '2px solid transparent',
                color: !isRegistering ? '#f8fafc' : '#64748b',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsRegistering(true); setError(null); }}
              style={{
                flex: 1,
                padding: '10px 0',
                background: 'transparent',
                border: 'none',
                borderBottom: isRegistering ? '2px solid #6366f1' : '2px solid transparent',
                color: isRegistering ? '#f8fafc' : '#64748b',
                fontWeight: 600,
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Customer Sign Up
            </button>
          </div>

          {error && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', borderRadius: '10px', backgroundColor: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', fontSize: '0.8125rem', marginBottom: '20px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {!isRegistering ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', marginTop: '12px', padding: '12px 0' }}
              >
                {loading ? 'Authenticating...' : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label className="form-label">Company Name</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Acme Industries LLC"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label className="form-label">First Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Jane"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Doe"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  required
                  className="input-field"
                  placeholder="jane@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  type="text"
                  required
                  className="input-field"
                  placeholder="Choose username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  className="input-field"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary"
                style={{ width: '100%', marginTop: '12px', padding: '12px 0' }}
              >
                {loading ? 'Creating Account...' : 'Register Customer Account'}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials */}
          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
            <div style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>
              Quick Demo Accounts
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => setDemoCredentials('admin', 'admin123')}
                style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '6px 8px', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>Admin</div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>admin / admin123</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('manager', 'manager123')}
                style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '6px 8px', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>Manager</div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>manager / manager123</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('tech1', 'tech123')}
                style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '6px 8px', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>Technician</div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>tech1 / tech123</div>
              </button>
              <button
                type="button"
                onClick={() => setDemoCredentials('customer1', 'customer123')}
                style={{ background: 'rgba(255, 255, 255, 0.04)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '8px', padding: '6px 8px', textAlign: 'left', cursor: 'pointer' }}
              >
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f8fafc' }}>Customer</div>
                <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>customer1 / customer123</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
