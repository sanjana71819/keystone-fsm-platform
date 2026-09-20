import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { dashboardApi } from '../api/dashboard';
import { DashboardStats } from '../types';
import {
  Inbox,
  ClipboardList,
  UserCheck,
  AlertTriangle,
  Clock,
  Boxes,
  TrendingUp,
  Plus,
  ArrowUpRight,
  CheckCircle,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await dashboardApi.getStats();
      setStats(data);
    } catch (err: any) {
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <Layout
      pageTitle="Operations Dashboard"
      subtitle="Real-time field service performance metrics and dispatch monitor"
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/service-requests" className="btn-secondary" style={{ textDecoration: 'none' }}>
            <Plus size={16} />
            <span>New Request</span>
          </Link>
          <Link to="/work-orders" className="btn-primary" style={{ textDecoration: 'none' }}>
            <Plus size={16} />
            <span>Create Work Order</span>
          </Link>
        </div>
      }
    >
      {loading && !stats ? (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ width: '40px', height: '40px', border: '3px solid rgba(99, 102, 241, 0.2)', borderTopColor: '#6366f1', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px auto' }} />
          <p style={{ color: '#94a3b8' }}>Loading real-time KPIs...</p>
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: '24px', textAlign: 'center', color: '#f87171' }}>
          {error}
        </div>
      ) : stats ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Top KPI Cards */}
          <div className="grid-cols-auto-fit">
            {/* Total Service Requests */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>Active Requests</div>
                  <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
                    {stats.openServiceRequests + stats.inProgressServiceRequests}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    {stats.totalServiceRequests} total lifetime
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                  <Inbox size={22} />
                </div>
              </div>
            </div>

            {/* Open Work Orders */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>Work Orders In Flight</div>
                  <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#818cf8', marginTop: '4px' }}>
                    {stats.openWorkOrders + stats.assignedWorkOrders + stats.inProgressWorkOrders}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '2px' }}>
                    {stats.completedWorkOrders} completed
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                  <ClipboardList size={22} />
                </div>
              </div>
            </div>

            {/* Overdue SLA Alert */}
            <div className="glass-card" style={{ padding: '20px', borderColor: stats.overdueServiceRequests > 0 ? 'rgba(239, 68, 68, 0.4)' : undefined }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: stats.overdueServiceRequests > 0 ? '#f87171' : '#94a3b8', fontWeight: 500 }}>
                    SLA Overdue
                  </div>
                  <div style={{ fontSize: '1.875rem', fontWeight: 800, color: stats.overdueServiceRequests > 0 ? '#ef4444' : '#f8fafc', marginTop: '4px' }}>
                    {stats.overdueServiceRequests}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    {stats.overdueServiceRequests > 0 ? 'Action required immediately' : 'All SLAs on track'}
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.15)', color: '#ef4444' }}>
                  <AlertTriangle size={22} />
                </div>
              </div>
            </div>

            {/* Technicians Available */}
            <div className="glass-card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontSize: '0.8125rem', color: '#94a3b8', fontWeight: 500 }}>Field Technicians</div>
                  <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#34d399', marginTop: '4px' }}>
                    {stats.availableTechnicians} <span style={{ fontSize: '1rem', color: '#64748b' }}>/ {stats.totalTechnicians}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#34d399', marginTop: '2px' }}>
                    Available for dispatch
                  </div>
                </div>
                <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399' }}>
                  <UserCheck size={22} />
                </div>
              </div>
            </div>
          </div>

          {/* Second Row: Lifecycle Breakdown & Inventory / Hours */}
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
            {/* Work Order Lifecycle Pipeline */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
                Work Order Lifecycle Pipeline
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {Object.entries(stats.workOrdersByStatus).map(([status, count]) => {
                  const total = stats.totalWorkOrders || 1;
                  const pct = Math.round((count / total) * 100);
                  
                  let barColor = '#3b82f6';
                  if (status === 'ASSIGNED') barColor = '#8b5cf6';
                  if (status === 'IN_PROGRESS') barColor = '#eab308';
                  if (status === 'COMPLETED') barColor = '#10b981';
                  if (status === 'CANCELLED') barColor = '#64748b';

                  return (
                    <div key={status}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8125rem', marginBottom: '4px' }}>
                        <span style={{ color: '#cbd5e1', fontWeight: 600 }}>{status.replace(/_/g, ' ')}</span>
                        <span style={{ color: '#94a3b8' }}>{count} ({pct}%)</span>
                      </div>
                      <div style={{ height: '8px', width: '100%', backgroundColor: 'rgba(255, 255, 255, 0.06)', borderRadius: '9999px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, backgroundColor: barColor, borderRadius: '9999px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Inventory & Hours Summary */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24' }}>
                    <Boxes size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Inventory Stock Status</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                      {stats.totalParts} Parts Cataloged
                    </div>
                    <div style={{ fontSize: '0.75rem', color: stats.lowStockPartsCount > 0 ? '#f87171' : '#10b981' }}>
                      {stats.lowStockPartsCount > 0 ? `${stats.lowStockPartsCount} items below reorder level` : 'All items sufficiently stocked'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="glass-card" style={{ padding: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <div style={{ padding: '12px', borderRadius: '12px', background: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Field Service Hours</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f8fafc' }}>
                      {stats.totalHoursLogged} Hours Logged
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                      Across all technician time entries
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Third Row: Technician Roster & Recent Activity */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            {/* Technician Workload */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
                Technician Roster & Dispatch Load
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {stats.technicianPerformances.map((tech) => (
                  <div
                    key={tech.technicianId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      borderRadius: '10px',
                      backgroundColor: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid rgba(255, 255, 255, 0.05)'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#f8fafc' }}>{tech.technicianName}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {tech.activeOrders} active orders | {tech.completedOrders} completed ({tech.totalHours} hrs)
                      </div>
                    </div>
                    <div>
                      <span
                        style={{
                          fontSize: '0.75rem',
                          fontWeight: 600,
                          padding: '4px 10px',
                          borderRadius: '9999px',
                          backgroundColor: tech.available ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                          color: tech.available ? '#34d399' : '#f87171',
                          border: `1px solid ${tech.available ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`
                        }}
                      >
                        {tech.available ? 'Available' : 'Busy'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px' }}>
                Recent Operational Activity
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {stats.recentActivities.length === 0 ? (
                  <p style={{ color: '#64748b', fontSize: '0.875rem' }}>No recent activity records</p>
                ) : (
                  stats.recentActivities.map((act, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '10px 12px',
                        borderRadius: '8px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid rgba(255, 255, 255, 0.04)'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: act.type === 'SERVICE_REQUEST' ? '#60a5fa' : '#818cf8'
                          }}
                        />
                        <div>
                          <div style={{ fontSize: '0.8125rem', fontWeight: 600, color: '#f1f5f9' }}>{act.title}</div>
                          <div style={{ fontSize: '0.6875rem', color: '#64748b' }}>{act.entityName}</div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.6875rem', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>
                        {act.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Layout>
  );
};
