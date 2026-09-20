import React, { useEffect, useState } from 'react';
import { Layout } from '../components/Layout';
import { timeTrackingApi } from '../api/timeTracking';
import { workOrderApi } from '../api/workOrders';
import { technicianApi } from '../api/technicians';
import { TimeEntry, WorkOrder, Technician } from '../types';
import { Modal } from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import {
  Clock,
  Play,
  Square,
  Plus,
  Search,
  Calendar,
  UserCheck,
  ClipboardList,
  CheckCircle2,
  Trash2
} from 'lucide-react';

export const TimeTrackingPage: React.FC = () => {
  const { user, isAdmin, isManager, isTechnician } = useAuth();

  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false);

  // Clock in modal state
  const [clockInWorkOrderId, setClockInWorkOrderId] = useState<number | undefined>(undefined);
  const [clockInNotes, setClockInNotes] = useState('');

  // Manual entry modal state
  const [manualWoId, setManualWoId] = useState<number | undefined>(undefined);
  const [manualTechId, setManualTechId] = useState<number | undefined>(undefined);
  const [manualClockIn, setManualClockIn] = useState('');
  const [manualClockOut, setManualClockOut] = useState('');
  const [manualNotes, setManualNotes] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      let entries: TimeEntry[];
      if (isTechnician && user?.technicianId) {
        entries = await timeTrackingApi.getByTechnician(user.technicianId);
        const active = await timeTrackingApi.getActiveClockIn(user.technicianId);
        setActiveEntry(active);
      } else {
        entries = await timeTrackingApi.getAll();
      }
      setTimeEntries(entries);

      const [wos, techs] = await Promise.all([
        workOrderApi.getAll(),
        technicianApi.getAll()
      ]);
      setWorkOrders(wos);
      setTechnicians(techs);
      if (wos.length > 0) {
        setClockInWorkOrderId(wos[0].id);
        setManualWoId(wos[0].id);
      }
      if (techs.length > 0) {
        setManualTechId(techs[0].id);
      }
    } catch (err) {
      console.error('Error loading time entries', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user]);

  const handleClockInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clockInWorkOrderId) return;
    try {
      await timeTrackingApi.clockIn({
        workOrderId: clockInWorkOrderId,
        technicianId: user?.technicianId,
        notes: clockInNotes
      });
      setIsClockInModalOpen(false);
      setClockInNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Clock-in failed');
    }
  };

  const handleClockOut = async (entryId: number) => {
    try {
      await timeTrackingApi.clockOut(entryId, 'Shift completed');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Clock-out failed');
    }
  };

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualWoId || !manualTechId || !manualClockIn) return;
    try {
      await timeTrackingApi.createManual({
        workOrderId: manualWoId,
        technicianId: manualTechId,
        clockIn: manualClockIn,
        clockOut: manualClockOut ? manualClockOut : undefined,
        notes: manualNotes
      });
      setIsManualModalOpen(false);
      setManualNotes('');
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save time entry');
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this time entry?')) return;
    try {
      await timeTrackingApi.delete(id);
      fetchData();
    } catch (err) {
      alert('Failed to delete time entry');
    }
  };

  const totalHours = timeEntries.reduce((acc, curr) => acc + (curr.durationHours || 0), 0);
  const activeCount = timeEntries.filter(t => !t.clockOut).length;

  return (
    <Layout
      pageTitle="Technician Time Tracking & Hours Log"
      subtitle="Accurate on-site labor hours tracking, job timestamps, and payroll verification"
      actions={
        <div style={{ display: 'flex', gap: '8px' }}>
          {isTechnician && !activeEntry && (
            <button onClick={() => setIsClockInModalOpen(true)} className="btn-primary">
              <Play size={16} />
              <span>Clock In</span>
            </button>
          )}
          {(isAdmin || isManager) && (
            <button onClick={() => setIsManualModalOpen(true)} className="btn-secondary">
              <Plus size={16} />
              <span>Log Manual Time</span>
            </button>
          )}
        </div>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Active Session Callout (if active) */}
        {activeEntry && (
          <div style={{ padding: '20px', borderRadius: '16px', backgroundColor: 'rgba(234, 179, 8, 0.1)', border: '1px solid rgba(234, 179, 8, 0.3)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: 'rgba(234, 179, 8, 0.2)', color: '#facc15' }}>
                <Clock size={24} />
              </div>
              <div>
                <div style={{ fontSize: '0.8125rem', color: '#facc15', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  Active Shift in Progress
                </div>
                <div style={{ fontSize: '1.125rem', fontWeight: 700, color: '#f8fafc', marginTop: '2px' }}>
                  Work Order #{activeEntry.workOrderId}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                  Clocked in at {new Date(activeEntry.clockIn).toLocaleTimeString()} ({new Date(activeEntry.clockIn).toLocaleDateString()})
                </div>
              </div>
            </div>

            <button
              onClick={() => handleClockOut(activeEntry.id)}
              className="btn-danger"
              style={{ padding: '10px 24px' }}
            >
              <Square size={16} />
              <span>Clock Out of WO #{activeEntry.workOrderId}</span>
            </button>
          </div>
        )}

        {/* Top Summary Metric Cards */}
        <div className="grid-cols-auto-fit">
          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Total Labor Logged</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#f8fafc', marginTop: '4px' }}>
              {Math.round(totalHours * 100) / 100} <span style={{ fontSize: '1rem', color: '#64748b' }}>hours</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10b981', marginTop: '2px' }}>
              Across {timeEntries.length} logged sessions
            </div>
          </div>

          <div className="glass-card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.8125rem', color: '#94a3b8' }}>Active Working Shifts</div>
            <div style={{ fontSize: '1.875rem', fontWeight: 800, color: '#eab308', marginTop: '4px' }}>
              {activeCount}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>
              Technicians currently clocked-in
            </div>
          </div>
        </div>

        {/* Time Entries Table */}
        <div className="data-table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Entry ID</th>
                <th>Technician</th>
                <th>Work Order</th>
                <th>Clock In</th>
                <th>Clock Out</th>
                <th>Duration</th>
                <th>Job Notes</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px' }}>
                    Loading time logs...
                  </td>
                </tr>
              ) : timeEntries.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
                    No time tracking entries on record
                  </td>
                </tr>
              ) : (
                timeEntries.map((entry) => (
                  <tr key={entry.id}>
                    <td>
                      <span style={{ fontFamily: 'monospace', color: '#818cf8', fontWeight: 600 }}>
                        #{entry.id}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: '#f8fafc' }}>{entry.technicianName}</div>
                    </td>
                    <td>
                      <Link
                        to={`/work-orders/${entry.workOrderId}`}
                        style={{ color: '#38bdf8', fontWeight: 600, textDecoration: 'none', fontSize: '0.8125rem' }}
                      >
                        WO #{entry.workOrderId}
                      </Link>
                    </td>
                    <td>
                      <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
                        {new Date(entry.clockIn).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td>
                      {entry.clockOut ? (
                        <span style={{ fontSize: '0.8125rem', color: '#cbd5e1' }}>
                          {new Date(entry.clockOut).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '2px 8px', borderRadius: '9999px', fontSize: '0.6875rem', fontWeight: 700, backgroundColor: 'rgba(234, 179, 8, 0.15)', color: '#facc15' }}>
                          ACTIVE
                        </span>
                      )}
                    </td>
                    <td>
                      <strong style={{ color: entry.durationHours ? '#f8fafc' : '#eab308' }}>
                        {entry.durationHours ? `${entry.durationHours} hrs` : 'Running...'}
                      </strong>
                    </td>
                    <td style={{ maxWidth: '200px' }}>
                      <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        {entry.notes || '—'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '6px' }}>
                        {!entry.clockOut && (
                          <button
                            onClick={() => handleClockOut(entry.id)}
                            className="btn-danger"
                            style={{ padding: '4px 8px', fontSize: '0.6875rem' }}
                          >
                            Clock Out
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(entry.id)}
                            className="btn-icon"
                            style={{ color: '#f87171' }}
                            title="Delete Entry"
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

      {/* Clock In Modal */}
      <Modal isOpen={isClockInModalOpen} onClose={() => setIsClockInModalOpen(false)} title="Clock In to Work Order">
        <form onSubmit={handleClockInSubmit}>
          <div className="form-group">
            <label className="form-label">Select Work Order</label>
            <select
              className="select-field"
              value={clockInWorkOrderId || ''}
              onChange={(e) => setClockInWorkOrderId(Number(e.target.value))}
              required
            >
              {workOrders.map((wo) => (
                <option key={wo.id} value={wo.id}>
                  WO #{wo.id} - {wo.serviceRequestTitle} ({wo.customerCompanyName})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Notes (Optional)</label>
            <textarea
              rows={2}
              className="textarea-field"
              placeholder="e.g. Arrived on site, beginning electrical diagnostics"
              value={clockInNotes}
              onChange={(e) => setClockInNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsClockInModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Confirm Clock In</button>
          </div>
        </form>
      </Modal>

      {/* Manual Entry Modal */}
      <Modal isOpen={isManualModalOpen} onClose={() => setIsManualModalOpen(false)} title="Create Manual Time Entry">
        <form onSubmit={handleManualSubmit}>
          <div className="form-group">
            <label className="form-label">Work Order</label>
            <select className="select-field" value={manualWoId || ''} onChange={(e) => setManualWoId(Number(e.target.value))} required>
              {workOrders.map((wo) => (
                <option key={wo.id} value={wo.id}>
                  WO #{wo.id} - {wo.serviceRequestTitle} ({wo.customerCompanyName})
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Technician</label>
            <select className="select-field" value={manualTechId || ''} onChange={(e) => setManualTechId(Number(e.target.value))} required>
              {technicians.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.firstName} {t.lastName}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Clock In Timestamp</label>
              <input type="datetime-local" required className="input-field" value={manualClockIn} onChange={(e) => setManualClockIn(e.target.value)} />
            </div>
            <div className="form-group">
              <label className="form-label">Clock Out Timestamp</label>
              <input type="datetime-local" className="input-field" value={manualClockOut} onChange={(e) => setManualClockOut(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea rows={2} className="textarea-field" placeholder="Job description, travel time..." value={manualNotes} onChange={(e) => setManualNotes(e.target.value)} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <button type="button" onClick={() => setIsManualModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary">Save Entry</button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
};
