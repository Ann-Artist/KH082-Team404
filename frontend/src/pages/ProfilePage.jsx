import React, { useState } from 'react';
import AvatarSelector from '../components/AvatarSelector';
import { profileApi } from '../services/profileApi';
import { User, ShieldCheck, Mail, MapPin, CheckCircle } from 'lucide-react';
import '../styles/index.css';

export default function ProfilePage({ user, progression, onUserUpdated }) {
  const [selectedAvatarId, setSelectedAvatarId] = useState(user?.avatar_id || 'eco');
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!user) return null;

  const handleAvatarChange = async (newAvatarId) => {
    setSelectedAvatarId(newAvatarId);
    try {
      setSaving(true);
      const res = await profileApi.updateAvatar(user.id, newAvatarId);
      if (onUserUpdated) {
        onUserUpdated(res.data);
      }
      setSuccessMsg('Character avatar updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to update avatar:', err);
    } finally {
      setSaving(false);
    }
  };

  const avatarPath = `/src/assets/avatars/${user.avatar_id || 'eco'}.png`;

  return (
    <div className="page-container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--emerald-600)', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          <User size={18} /> My Character Profile
        </div>
        <h1 style={{ fontSize: '1.8rem', color: '#0f172a' }}>Eco Profile & Avatar</h1>
      </div>

      {successMsg && (
        <div style={{ background: '#ecfdf5', border: '1px solid #a7f3d0', color: 'var(--emerald-800)', padding: '0.75rem 1rem', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem' }}>
          <CheckCircle size={18} /> {successMsg}
        </div>
      )}

      {/* Main Profile Card */}
      <div className="eco-card" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
          <img
            src={avatarPath}
            alt={user.name}
            style={{ width: '90px', height: '90px', borderRadius: '50%', border: '4px solid var(--emerald-500)', objectFit: 'cover' }}
            onError={(e) => { e.target.src = '/src/assets/avatars/eco.png'; }}
          />

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <h2 style={{ fontSize: '1.6rem', color: '#0f172a' }}>{user.name}</h2>
              <span className="pill-badge pill-emerald">Level {progression?.level?.level_number || 1}</span>
            </div>

            <p style={{ fontSize: '0.95rem', color: 'var(--emerald-700)', fontWeight: 700, margin: '0.2rem 0 0.75rem 0' }}>
              {progression?.level?.title || 'Eco Starter'}
            </p>

            <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.88rem', color: '#64748b', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <Mail size={15} /> {user.email}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <MapPin size={15} /> {user.city}
              </span>
              <span>Age Group: {user.age_group}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Select Character Avatar Section */}
      <div className="eco-card">
        <h3 style={{ fontSize: '1.2rem', color: '#0f172a', marginBottom: '0.5rem' }}>Switch Game Character Avatar</h3>
        <p style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '1rem' }}>
          Choose your active EcoQuest character representation across the dashboard and activity history.
        </p>

        <AvatarSelector selectedAvatarId={selectedAvatarId} onSelectAvatar={handleAvatarChange} />
      </div>
    </div>
  );
}
