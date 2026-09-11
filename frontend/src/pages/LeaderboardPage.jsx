import React, { useEffect, useState } from 'react';
import { progressionApi } from '../services/progressionApi';
import { Trophy, Crown, Flame, Award, MapPin, Zap } from 'lucide-react';
import '../styles/index.css';

export default function LeaderboardPage({ currentUserId }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      setLoading(true);
      const res = await progressionApi.getLeaderboard();
      setLeaderboard(res.data || []);
    } catch (err) {
      setError(err.message || 'Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <span className="pill-badge pill-emerald animate-spin" style={{ padding: '0.75rem 1.5rem', fontSize: '1rem' }}>
          Loading Community Leaderboard...
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container" style={{ textAlign: 'center', paddingTop: '4rem' }}>
        <p style={{ color: '#ef4444' }}>{error}</p>
        <button className="btn-emerald" style={{ marginTop: '1rem' }} onClick={loadLeaderboard}>
          Retry
        </button>
      </div>
    );
  }

  // Separate Top 3 for Podium and Rest for List
  const rank1 = leaderboard.find((p) => p.rank === 1) || leaderboard[0];
  const rank2 = leaderboard.find((p) => p.rank === 2) || leaderboard[1];
  const rank3 = leaderboard.find((p) => p.rank === 3) || leaderboard[2];
  const restPlayers = leaderboard.filter((p) => p.rank > 3);

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
      {/* Top Banner Card matching Reference Image 2 structure in EcoQuest theme */}
      <div
        style={{
          background: 'linear-gradient(145deg, #0d1410, #142a1e)',
          borderRadius: 'var(--radius-xl)',
          padding: '2.5rem 1.5rem 3rem 1.5rem',
          boxShadow: '0 12px 30px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          color: '#ffffff',
          overflow: 'hidden'
        }}
      >
        {/* Ribbon Title */}
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(90deg, #15803d, #22c55e)',
              padding: '0.5rem 2rem',
              borderRadius: 'var(--radius-pill)',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)',
              fontSize: '1.25rem',
              fontWeight: 900,
              letterSpacing: '0.12em',
              textTransform: 'uppercase'
            }}
          >
            <Trophy size={22} style={{ color: '#fde047' }} /> LEADERBOARD
          </div>
        </div>

        {/* Top 3 Podium (Reference Structure: #2 Left, #1 Center Gold, #3 Right) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1.15fr 1fr',
            alignItems: 'end',
            gap: '1rem',
            maxWidth: '650px',
            margin: '0 auto'
          }}
        >
          {/* Rank #2 (Runner-up Left) */}
          {rank2 && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#e2e8f0', marginBottom: '0.3rem' }}>#2</span>
              <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '0.5rem' }}>
                <img
                  src={`/src/assets/avatars/${rank2.avatar_id || 'eco'}.png`}
                  alt={rank2.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '4px solid #cbd5e1',
                    boxShadow: '0 0 15px rgba(203, 213, 225, 0.4)',
                    objectFit: 'cover',
                    background: '#1e293b'
                  }}
                  onError={(e) => { e.target.src = '/src/assets/avatars/eco.png'; }}
                />
                <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#475569', borderRadius: '50%', padding: '0.2rem' }}>
                  <Award size={16} style={{ color: '#e2e8f0' }} />
                </div>
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {rank2.name}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#818cf8', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                <Zap size={14} /> {rank2.totalXP.toLocaleString()} XP
              </span>
            </div>
          )}

          {/* Rank #1 (Champion Center Gold) */}
          {rank1 && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.6rem', fontWeight: 900, color: '#fde047', marginBottom: '0.3rem' }}>#1</span>
              <div style={{ position: 'relative', width: '115px', height: '115px', marginBottom: '0.5rem' }}>
                <img
                  src={`/src/assets/avatars/${rank1.avatar_id || 'eco'}.png`}
                  alt={rank1.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '5px solid #f59e0b',
                    boxShadow: '0 0 25px rgba(245, 158, 11, 0.7)',
                    objectFit: 'cover',
                    background: '#1e293b'
                  }}
                  onError={(e) => { e.target.src = '/src/assets/avatars/eco.png'; }}
                />
                <div style={{ position: 'absolute', bottom: '-10px', left: '50%', transform: 'translateX(-50%)', background: '#f59e0b', borderRadius: '50%', padding: '0.3rem', boxShadow: '0 2px 8px rgba(245,158,11,0.5)' }}>
                  <Crown size={20} style={{ color: '#ffffff' }} />
                </div>
              </div>
              <span style={{ fontWeight: 900, fontSize: '1.1rem', color: '#ffffff', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                {rank1.name}
              </span>
              <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#fde047', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                <Zap size={16} fill="#fde047" /> {rank1.totalXP.toLocaleString()} XP
              </span>
            </div>
          )}

          {/* Rank #3 (Bronze Right) */}
          {rank3 && (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#f97316', marginBottom: '0.3rem' }}>#3</span>
              <div style={{ position: 'relative', width: '90px', height: '90px', marginBottom: '0.5rem' }}>
                <img
                  src={`/src/assets/avatars/${rank3.avatar_id || 'eco'}.png`}
                  alt={rank3.name}
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    border: '4px solid #b45309',
                    boxShadow: '0 0 15px rgba(180, 83, 9, 0.4)',
                    objectFit: 'cover',
                    background: '#1e293b'
                  }}
                  onError={(e) => { e.target.src = '/src/assets/avatars/eco.png'; }}
                />
                <div style={{ position: 'absolute', bottom: '-8px', left: '50%', transform: 'translateX(-50%)', background: '#b45309', borderRadius: '50%', padding: '0.2rem' }}>
                  <Award size={16} style={{ color: '#fde047' }} />
                </div>
              </div>
              <span style={{ fontWeight: 800, fontSize: '0.95rem', color: '#ffffff', display: 'block', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '140px' }}>
                {rank3.name}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 900, color: '#f97316', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.2rem' }}>
                <Zap size={14} /> {rank3.totalXP.toLocaleString()} XP
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Ranks #4+ Rounded Cards Container */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
        {restPlayers.length > 0 ? (
          restPlayers.map((player) => {
            const isCurrentUser = player.id === currentUserId;
            return (
              <div
                key={player.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: isCurrentUser ? 'var(--emerald-50)' : '#ffffff',
                  border: isCurrentUser ? '2px solid var(--emerald-500)' : '1px solid #e2e8f0',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1rem 1.5rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#475569', minWidth: '32px' }}>
                    #{player.rank}
                  </span>

                  <div style={{ position: 'relative', width: 44, height: 44 }}>
                    <img
                      src={`/src/assets/avatars/${player.avatar_id || 'eco'}.png`}
                      alt={player.name}
                      style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--emerald-500)' }}
                      onError={(e) => { e.target.src = '/src/assets/avatars/eco.png'; }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 800, fontSize: '1rem', color: '#0f172a' }}>{player.name}</span>
                      {isCurrentUser && (
                        <span className="pill-badge pill-emerald" style={{ fontSize: '0.7rem' }}>You</span>
                      )}
                    </div>
                    <span style={{ fontSize: '0.8rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.1rem' }}>
                      <MapPin size={12} /> {player.city || 'Pune'} • Level {player.level?.level_number || 1}
                    </span>
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'var(--emerald-700)', display: 'block' }}>
                    {player.totalXP.toLocaleString()} XP
                  </span>
                  <span style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                    <Flame size={12} /> {player.currentStreak}d streak
                  </span>
                </div>
              </div>
            );
          })
        ) : (
          <div className="eco-card" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
            No additional ranked players yet.
          </div>
        )}
      </div>
    </div>
  );
}
