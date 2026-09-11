import React, { useEffect, useState } from 'react';
import BadgeCard from '../components/BadgeCard';
import { progressionApi } from '../services/progressionApi';
import { Award, ShieldCheck, Gift, Lock } from 'lucide-react';
import '../styles/index.css';

export default function RewardsPage({ userId }) {
  const [progression, setProgression] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!userId) return;
    loadRewardsData();
  }, [userId]);

  const loadRewardsData = async () => {
    try {
      setLoading(true);
      const res = await progressionApi.getProgression(userId);
      setProgression(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load rewards & badges');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <span className="pill-badge pill-blue animate-spin" style={{ padding: '0.75rem 1.5rem' }}>
          Loading Rewards & Achievements...
        </span>
      </div>
    );
  }

  if (error || !progression) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: '#ef4444' }}>{error || 'Unable to load rewards.'}</p>
      </div>
    );
  }

  const { level, badges = [] } = progression;

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-600)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Award size={18} /> Game Progression
        </div>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Rewards & Achievements</h1>
        <p style={{ fontSize: '0.92rem', color: '#64748b', marginTop: '0.25rem' }}>
          Earn EcoXP to unlock character ranks, titles, achievement badges, and future eco partner rewards.
        </p>
      </div>

      {/* Badges Grid */}
      <div>
        <h3 style={{ fontSize: '1.25rem', color: '#0f172a', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} style={{ color: 'var(--emerald-600)' }} /> Achievement Badges
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.25rem' }}>
          {badges.map((badge) => (
            <BadgeCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>

      {/* Future Reward Partner Placeholders */}
      <div className="eco-card" style={{ background: '#f8faf8' }}>
        <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Gift size={20} style={{ color: '#8b5cf6' }} /> Future Partner Rewards (Demo Architecture)
        </h3>
        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1.25rem' }}>
          The EcoQuest reward pipeline is architected to allow integration with external eco brands, municipal transit passes, and certified tree planting organizations.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
          <div style={{ border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-md)', padding: '1rem', opacity: 0.7 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>🌱 Real Tree Planting Voucher</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Requires Level 4 • 500 EcoXP</span>
          </div>

          <div style={{ border: '1px dashed #cbd5e1', borderRadius: 'var(--radius-md)', padding: '1rem', opacity: 0.7 }}>
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#0f172a', display: 'block' }}>🚌 Municipal Transit Pass Discount</span>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Requires Level 5 • 1000 EcoXP</span>
          </div>
        </div>
      </div>
    </div>
  );
}
