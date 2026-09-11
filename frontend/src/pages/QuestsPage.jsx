import React, { useEffect, useState } from 'react';
import QuestCard from '../components/QuestCard';
import { questApi } from '../services/questApi';
import { Swords, ShieldCheck, RefreshCw } from 'lucide-react';
import '../styles/index.css';

export default function QuestsPage({ userId }) {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadQuests();
  }, [userId]);

  const loadQuests = async () => {
    try {
      setLoading(true);
      const res = await questApi.getAllQuests(userId);
      setQuests(res.data);
    } catch (err) {
      setError(err.message || 'Failed to load quests');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-600)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <Swords size={18} /> Game Missions
        </div>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Permanent EcoQuests</h1>
        <p style={{ fontSize: '0.92rem', color: '#64748b', marginTop: '0.25rem' }}>
          These 4 core missions are permanently available to complete repeatedly for EcoXP rewards and character level progression.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <span className="pill-badge pill-blue animate-spin" style={{ padding: '0.75rem 1.5rem' }}>
            Loading game quests...
          </span>
        </div>
      ) : error ? (
        <div style={{ textAlign: 'center', color: '#ef4444', padding: '2rem' }}>
          <p>{error}</p>
          <button className="btn-emerald" style={{ marginTop: '1rem' }} onClick={loadQuests}>
            Retry
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {quests.map((quest) => (
            <QuestCard key={quest.id} quest={quest} />
          ))}
        </div>
      )}
    </div>
  );
}
