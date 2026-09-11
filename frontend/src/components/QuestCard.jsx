import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bus, Bike, Zap, Sprout, ShieldAlert, ArrowRight, Clock, Award } from 'lucide-react';
import '../styles/components.css';

const questIcons = {
  public_transport: Bus,
  cycling: Bike,
  electricity: Zap,
  plant_care: Sprout
};

const categoryClasses = {
  public_transport: 'transport',
  cycling: 'cycling',
  electricity: 'energy',
  plant_care: 'nature'
};

export default function QuestCard({ quest }) {
  const navigate = useNavigate();

  const Icon = questIcons[quest.quest_key] || Sprout;
  const catClass = categoryClasses[quest.quest_key] || 'nature';
  const inCooldown = quest.cooldown?.inCooldown;

  const handleStartClick = () => {
    if (!inCooldown) {
      navigate(`/quests/${quest.quest_key}`);
    }
  };

  return (
    <div className="quest-card">
      <div>
        <div className="quest-card-header">
          <div className={`quest-icon-wrapper ${catClass}`}>
            <Icon size={26} />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem' }}>
            <span className="pill-badge pill-emerald">
              <Award size={13} /> +{quest.base_reward} EcoXP
            </span>

            {inCooldown ? (
              <span className="pill-badge pill-orange">
                <Clock size={12} /> Wait {quest.cooldown.remainingMinutes}m
              </span>
            ) : (
              <span className="pill-badge pill-blue">Repeatable</span>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1rem' }}>
          <h3 className="quest-title">{quest.name}</h3>
          <p className="quest-desc">{quest.description}</p>
        </div>
      </div>

      <div style={{ paddingTop: '0.75rem', borderTop: '1px solid var(--card-border)' }}>
        <button
          className={`btn-emerald ${inCooldown ? 'disabled' : ''}`}
          style={{
            width: '100%',
            opacity: inCooldown ? 0.6 : 1,
            cursor: inCooldown ? 'not-allowed' : 'pointer'
          }}
          onClick={handleStartClick}
          disabled={inCooldown}
        >
          {inCooldown ? `On Cooldown (${quest.cooldown.remainingMinutes}m)` : 'Start Mission'}
          {!inCooldown && <ArrowRight size={18} />}
        </button>
      </div>
    </div>
  );
}
