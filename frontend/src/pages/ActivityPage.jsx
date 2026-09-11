import React, { useEffect, useState } from 'react';
import ActivityCard from '../components/ActivityCard';
import { submissionApi } from '../services/submissionApi';
import { History, Filter } from 'lucide-react';
import '../styles/index.css';

export default function ActivityPage({ userId }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    if (!userId) return;
    loadActivityHistory();
  }, [userId]);

  const loadActivityHistory = async () => {
    try {
      setLoading(true);
      const res = await submissionApi.getUserSubmissions(userId);
      setSubmissions(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load activity database history');
    } finally {
      setLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((sub) => {
    if (filter === 'VERIFIED') return sub.verification_status === 'VERIFIED';
    if (filter === 'REJECTED') return sub.verification_status === 'REJECTED';
    return true;
  });

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-600)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            <History size={18} /> Game History
          </div>
          <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Activity Database</h1>
          <p style={{ fontSize: '0.92rem', color: '#64748b' }}>
            Complete historical database of every quest attempt and verification ledger record.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', background: '#e2e8f0', padding: '0.25rem', borderRadius: 'var(--radius-pill)' }}>
          {['ALL', 'VERIFIED', 'REJECTED'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '0.4rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                fontSize: '0.82rem',
                fontWeight: 600,
                background: filter === f ? '#ffffff' : 'transparent',
                color: filter === f ? '#0f172a' : '#64748b',
                boxShadow: filter === f ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {f === 'ALL' ? 'All Activities' : f}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <span className="pill-badge pill-blue animate-spin" style={{ padding: '0.75rem 1.5rem' }}>
            Fetching activity records...
          </span>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: '#ef4444', padding: '2rem' }}>
          <p>{error}</p>
        </div>
      ) : filteredSubmissions.length === 0 ? (
        <div className="eco-card" style={{ textAlign: 'center', padding: '3rem' }}>
          <History size={40} style={{ color: '#cbd5e1', marginBottom: '0.75rem' }} />
          <h3 style={{ fontSize: '1.1rem', color: '#64748b' }}>No Eco Activities Recorded Yet</h3>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Complete your first quest mission to build your historical sustainability ledger!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {filteredSubmissions.map((sub) => (
            <ActivityCard key={sub.id} submission={sub} />
          ))}
        </div>
      )}
    </div>
  );
}
