import React, { useEffect, useState } from 'react';
import { progressionApi } from '../services/progressionApi';
import { ShieldCheck, Check, Sparkles, Award } from 'lucide-react';
import '../styles/index.css';

const levelTimelineData = [
  {
    level_number: 1,
    title: 'Eco Seedling',
    required_xp: 0,
    min_xp: 0,
    max_xp: 99,
    perks: ['Unlock basic permanent quests', 'Character avatar customization', 'Baseline carbon profiler access']
  },
  {
    level_number: 2,
    title: 'Green Sprout',
    required_xp: 150,
    min_xp: 100,
    max_xp: 249,
    perks: ['Public Transport & Cycling multiplier boost', 'Community leaderboard ranking entry', 'Daily streak tracking']
  },
  {
    level_number: 3,
    title: 'Eco Adventurer',
    required_xp: 250,
    min_xp: 250,
    max_xp: 499,
    perks: ['Electricity bill verification access', 'Energy reduction bonus points', 'Century Club achievement badge']
  },
  {
    level_number: 4,
    title: 'Planet Protector',
    required_xp: 500,
    min_xp: 500,
    max_xp: 999,
    perks: ['Eco Master badge unlock', 'Plant Care cooldown window reduction', 'Tree Planting Partner voucher eligibility']
  },
  {
    level_number: 5,
    title: 'Earth Champion',
    required_xp: 1000,
    min_xp: 1000,
    max_xp: 1999,
    perks: ['Municipal transit discount voucher', 'Weekly Guardian streak bonus multiplier', 'Priority verification queue']
  },
  {
    level_number: 6,
    title: 'Eco Guardian',
    required_xp: 2000,
    min_xp: 2000,
    max_xp: 99999,
    perks: ['Master Guardian Crown title badge', 'Real-world physical tree planted in your name', 'Hall of Fame legend status']
  }
];

export default function LevelsPage({ userId }) {
  const [progression, setProgression] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    loadProgression();
  }, [userId]);

  const loadProgression = async () => {
    try {
      setLoading(true);
      const res = await progressionApi.getProgression(userId);
      setProgression(res.data);
    } catch (err) {
      console.error('Failed to load progression:', err);
    } finally {
      setLoading(false);
    }
  };

  const currentLevelNumber = progression?.level?.level_number || 1;
  const currentTitle = progression?.level?.title || 'Eco Seedling';
  const userXP = progression?.totalXP || 0;

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '960px', margin: '0 auto', width: '100%' }}>
      {/* Top Header matching Reference Image 1 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', borderBottom: '1px solid #e2e8f0', paddingBottom: '1.5rem' }}>
        <div>
          <span style={{ fontSize: '0.8rem', color: '#16a34a', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            CURRENT STATUS
          </span>
          <h1 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: 900, lineHeight: 1.1, marginTop: '0.2rem' }}>
            Level {currentLevelNumber}: {currentTitle}
          </h1>
        </div>

        {/* Total EcoXP Ledger Card */}
        <div style={{ background: '#fefce8', border: '1px solid #fde047', borderRadius: 'var(--radius-lg)', padding: '0.85rem 1.75rem', textAlign: 'right', boxShadow: '0 2px 8px rgba(250, 204, 21, 0.15)' }}>
          <span style={{ fontSize: '0.8rem', color: '#854d0e', fontWeight: 700, display: 'block' }}>
            Total EcoXP Ledger
          </span>
          <span style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ca8a04', lineHeight: 1 }}>
            {userXP} <span style={{ fontSize: '1.1rem' }}>XP</span>
          </span>
        </div>
      </div>

      {/* Main Vertical Timeline Container */}
      <div style={{ position: 'relative', margin: '2rem 0', padding: '1rem 0' }}>
        {/* Central Vertical Connecting Stem Line */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: 0,
            bottom: 0,
            width: '4px',
            background: 'linear-gradient(to bottom, #4ade80, #cbd5e1)',
            transform: 'translateX(-50%)',
            borderRadius: '2px',
            zIndex: 1
          }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem', position: 'relative', zIndex: 2 }}>
          {levelTimelineData.map((lvl, index) => {
            const isCurrent = lvl.level_number === currentLevelNumber;
            const isUnlocked = currentLevelNumber >= lvl.level_number;
            const isLeft = index % 2 === 0;

            return (
              <div
                key={lvl.level_number}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 60px 1fr',
                  alignItems: 'center',
                  gap: '1rem',
                  position: 'relative'
                }}
              >
                {/* Left Side Slot */}
                <div style={{ justifySelf: 'end', width: '100%', maxWidth: '380px' }}>
                  {isLeft ? (
                    <div
                      style={{
                        background: isCurrent ? '#fefce8' : isUnlocked ? '#ffffff' : '#f8fafc',
                        border: isCurrent
                          ? '2px solid #f59e0b'
                          : isUnlocked
                          ? '1px solid #86efac'
                          : '1px solid #e2e8f0',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem 1.5rem',
                        boxShadow: isCurrent ? '0 4px 16px rgba(245, 158, 11, 0.2)' : 'var(--shadow-sm)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isCurrent ? '#ca8a04' : '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          LEVEL {lvl.level_number}
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isCurrent ? '#ca8a04' : '#64748b' }}>
                          {lvl.required_xp} XP Required
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.3rem' }}>
                        {lvl.title} {isCurrent && <span style={{ color: '#ca8a04' }}>(YOU ARE HERE)</span>}
                      </h3>

                      <p style={{ fontSize: '0.85rem', color: isUnlocked ? '#15803d' : '#64748b', fontWeight: 600 }}>
                        Status: {isCurrent ? 'Tier Unlocked & Verified' : isUnlocked ? 'Unlocked & Verified' : 'Locked (Accumulate EcoXP to unlock)'}
                      </p>

                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {lvl.perks.map((perk, pIdx) => (
                            <div key={pIdx} style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Award size={12} style={{ color: '#16a34a', flexShrink: 0 }} />
                              <span>{perk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>

                {/* Central Circle Node */}
                <div style={{ justifySelf: 'center', zIndex: 3 }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: isUnlocked ? '#f59e0b' : '#ffffff',
                      border: isUnlocked ? '3px solid #fde047' : '3px solid #cbd5e1',
                      color: isUnlocked ? '#ffffff' : '#64748b',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 800,
                      fontSize: '1.1rem',
                      boxShadow: isCurrent ? '0 0 16px rgba(245, 158, 11, 0.5)' : 'none',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isUnlocked ? <Check size={26} strokeWidth={3} /> : lvl.level_number}
                  </div>
                </div>

                {/* Right Side Slot */}
                <div style={{ justifySelf: 'start', width: '100%', maxWidth: '380px' }}>
                  {!isLeft ? (
                    <div
                      style={{
                        background: isCurrent ? '#fefce8' : isUnlocked ? '#ffffff' : '#f8fafc',
                        border: isCurrent
                          ? '2px solid #f59e0b'
                          : isUnlocked
                          ? '1px solid #86efac'
                          : '1px solid #e2e8f0',
                        borderRadius: 'var(--radius-lg)',
                        padding: '1.25rem 1.5rem',
                        boxShadow: isCurrent ? '0 4px 16px rgba(245, 158, 11, 0.2)' : 'var(--shadow-sm)',
                        transition: 'all 0.3s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                        <span style={{ fontSize: '0.8rem', fontWeight: 800, color: isCurrent ? '#ca8a04' : isUnlocked ? '#16a34a' : '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          LEVEL {lvl.level_number}
                        </span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isCurrent ? '#ca8a04' : '#64748b' }}>
                          {lvl.required_xp} XP Required
                        </span>
                      </div>

                      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0f172a', marginBottom: '0.3rem' }}>
                        {lvl.title} {isCurrent && <span style={{ color: '#ca8a04' }}>(YOU ARE HERE)</span>}
                      </h3>

                      <p style={{ fontSize: '0.85rem', color: isUnlocked ? '#15803d' : '#64748b', fontWeight: 600 }}>
                        Status: {isCurrent ? 'Tier Unlocked & Verified' : isUnlocked ? 'Unlocked & Verified' : 'Locked (Accumulate EcoXP to unlock)'}
                      </p>

                      <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(0,0,0,0.06)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          {lvl.perks.map((perk, pIdx) => (
                            <div key={pIdx} style={{ fontSize: '0.8rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                              <Award size={12} style={{ color: '#16a34a', flexShrink: 0 }} />
                              <span>{perk}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
