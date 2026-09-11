import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import XPProgress from '../components/XPProgress';
import FootprintChart from '../components/FootprintChart';
import QuestCard from '../components/QuestCard';
import ActivityCard from '../components/ActivityCard';
import { progressionApi } from '../services/progressionApi';
import { Swords, Flame, Award, ArrowRight, ShieldCheck, Activity } from 'lucide-react';
import '../styles/index.css';

export default function DashboardPage({ userId }) {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) return;
    loadDashboardData();
  }, [userId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await progressionApi.getDashboard(userId);
      setData(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <span className="pill-badge pill-blue animate-spin" style={{ fontSize: '1rem', padding: '0.75rem 1.5rem' }}>
          Loading your EcoQuest Dashboard...
        </span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: '#ef4444', fontWeight: 600 }}>{error || 'Unable to load dashboard.'}</p>
        <button className="btn-emerald" style={{ marginTop: '1rem' }} onClick={loadDashboardData}>
          Retry
        </button>
      </div>
    );
  }

  const { user, footprint, progression, quests } = data;
  const avatarPath = `/src/assets/avatars/${user?.avatar_id || 'eco'}.png`;
  const activeQuests = quests || [];
  const suggestedQuest = activeQuests[0];

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* 1. Profile Game Header */}
      <div className="eco-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', background: 'linear-gradient(135deg, #ffffff, #f8faf8)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ position: 'relative', width: '68px', height: '68px' }}>
            <img
              src={avatarPath}
              alt={user.name}
              style={{ width: '100%', height: '100%', borderRadius: '50%', border: '3px solid var(--emerald-500)', objectFit: 'cover' }}
              onError={(e) => { e.target.src = '/src/assets/avatars/eco.png'; }}
            />
            <span className="online-indicator" style={{ width: '14px', height: '14px' }} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.6rem', color: '#0f172a' }}>{user.name}</h1>
              <span className="pill-badge pill-emerald">
                Level {progression?.level?.level_number || 1}
              </span>
            </div>
            <p style={{ fontSize: '0.9rem', color: 'var(--emerald-700)', fontWeight: 700 }}>
              {progression?.level?.title || 'Eco Starter'} • {user.city}
            </p>
          </div>
        </div>

        {/* Quick Streak & Total XP Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div className="eco-card-mint" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={20} style={{ color: '#ef4444' }} />
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Active Streak</span>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                {progression?.streak?.current_streak || 0} Days
              </span>
            </div>
          </div>

          <div className="eco-card-mint" style={{ padding: '0.6rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Award size={20} style={{ color: 'var(--emerald-600)' }} />
            <div>
              <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block', fontWeight: 600 }}>Total EcoXP</span>
              <span style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
                {progression?.totalXP || 0} XP
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. XP & Level Progress Card */}
      <XPProgress progression={progression} />

      {/* 3. Main Split Grid: Suggested Quest + Carbon Footprint */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Swords size={20} style={{ color: 'var(--emerald-600)' }} /> Recommended Mission
            </h3>
            <button
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
              onClick={() => navigate('/quests')}
            >
              View All 4 Quests <ArrowRight size={14} />
            </button>
          </div>

          {suggestedQuest ? (
            <QuestCard quest={suggestedQuest} />
          ) : (
            <p>No quests available.</p>
          )}
        </div>

        <div>
          <FootprintChart footprint={footprint} />
        </div>
      </div>

      {/* 4. Recent Activity Preview */}
      {progression?.recentTransactions && progression.recentTransactions.length > 0 && (
        <div style={{ marginTop: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <h3 style={{ fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Activity size={20} style={{ color: 'var(--emerald-600)' }} /> Recent Eco Activities
            </h3>
            <button
              className="btn-secondary"
              style={{ fontSize: '0.82rem', padding: '0.35rem 0.75rem' }}
              onClick={() => navigate('/activity')}
            >
              Full History <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {progression.recentTransactions.slice(0, 3).map((tx) => (
              <div key={tx.id} className="eco-card" style={{ padding: '0.85rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <span style={{ fontWeight: 700, color: '#0f172a', fontSize: '0.95rem' }}>{tx.reason}</span>
                  <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block' }}>
                    {new Date(tx.created_at).toLocaleDateString()}
                  </span>
                </div>
                <span className="pill-badge pill-emerald">+{tx.points} EcoXP</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
