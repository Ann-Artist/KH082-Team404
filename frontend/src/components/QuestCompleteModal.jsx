import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Zap, Flame, Award, ArrowRight } from 'lucide-react';
import '../styles/components.css';

export default function QuestCompleteModal({ result, onClose }) {
  const navigate = useNavigate();
  if (!result) return null;

  const {
    ecoPointsEarned = 0,
    currentLevel,
    levelUp,
    streak,
    newlyUnlockedBadges = []
  } = result;

  const handleContinue = () => {
    onClose();
    navigate('/quests');
  };

  return (
    <div className="modal-overlay animate-fade-in">
      <div className="modal-card">
        <div className="victory-icon-circle glow-pulse">
          <Trophy size={42} />
        </div>

        <span style={{ fontSize: '0.85rem', color: 'var(--emerald-600)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          Mission Complete!
        </span>

        <h2 style={{ fontSize: '1.8rem', color: '#0f172a', margin: '0.3rem 0 1rem 0' }}>
          +{ecoPointsEarned} EcoXP Awarded!
        </h2>

        {/* Level Progression Display */}
        <div style={{ background: '#f8faf8', border: '1px solid #e2e8f0', borderRadius: 'var(--radius-md)', padding: '1rem', marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>
              Level {currentLevel?.level_number || 1}
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--emerald-700)', fontWeight: 700 }}>
              {currentLevel?.title || 'Eco Starter'}
            </span>
          </div>

          <div className="progress-bar-container" style={{ height: '8px' }}>
            <div className="progress-bar-fill" style={{ width: `${currentLevel?.progressPercent || 0}%` }} />
          </div>
        </div>

        {/* Streak & Badges Summary */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.5rem' }}>
          <div style={{ flex: 1, background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Flame size={20} style={{ color: '#ef4444' }} />
            <div style={{ textAlign: 'left' }}>
              <span style={{ fontSize: '0.75rem', color: '#991b1b', display: 'block', fontWeight: 600 }}>Current Streak</span>
              <span style={{ fontWeight: 800, color: '#991b1b', fontSize: '0.95rem' }}>
                {streak?.current_streak || 1} Days
              </span>
            </div>
          </div>

          {newlyUnlockedBadges.length > 0 && (
            <div style={{ flex: 1, background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: 'var(--radius-md)', padding: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Award size={20} style={{ color: 'var(--emerald-600)' }} />
              <div style={{ textAlign: 'left' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--emerald-800)', display: 'block', fontWeight: 600 }}>Badge Unlocked!</span>
                <span style={{ fontWeight: 800, color: 'var(--emerald-800)', fontSize: '0.9rem' }}>
                  {newlyUnlockedBadges[0].name}
                </span>
              </div>
            </div>
          )}
        </div>

        <button className="btn-emerald" style={{ width: '100%' }} onClick={handleContinue}>
          Continue Eco Journey <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
