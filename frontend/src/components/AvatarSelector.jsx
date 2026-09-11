import React from 'react';
import avatars from '../data/avatarConfig';
import '../styles/components.css';

export default function AvatarSelector({ selectedAvatarId, onSelectAvatar }) {
  return (
    <div className="avatar-selector-container">
      <label className="field-label" style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
        Choose Your Game Character Avatar
      </label>
      <div className="avatar-grid">
        {avatars.map((av) => {
          const isSelected = av.id === selectedAvatarId;
          return (
            <div
              key={av.id}
              className={`avatar-option-card ${isSelected ? 'selected' : ''}`}
              onClick={() => onSelectAvatar(av.id)}
            >
              <img src={av.image} alt={av.name} className="avatar-img" />
              <span className="avatar-name">{av.name}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
