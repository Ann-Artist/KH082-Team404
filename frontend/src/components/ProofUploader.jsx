import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import '../styles/components.css';

export default function ProofUploader({ onFileSelect, label = 'Upload Photo Proof' }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (onFileSelect) {
      onFileSelect(file);
    }
  };

  // Demo file shortcut generator if camera/file not picked
  const handleDemoSample = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');

    // Create a demo canvas proof image
    ctx.fillStyle = '#0e1713';
    ctx.fillRect(0, 0, 400, 300);
    ctx.fillStyle = '#22c55e';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('🌱 Verified EcoQuest Proof', 50, 140);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '14px sans-serif';
    ctx.fillText(`Captured: ${new Date().toLocaleTimeString()}`, 50, 170);

    canvas.toBlob((blob) => {
      const demoFile = new File([blob], `demo-proof-${Date.now()}.png`, { type: 'image/png' });
      processFile(demoFile);
    }, 'image/png');
  };

  return (
    <div style={{ marginTop: '1rem', width: '100%' }}>
      <label style={{ fontWeight: 600, fontSize: '0.9rem', color: '#0f172a', display: 'block', marginBottom: '0.5rem' }}>
        {label}
      </label>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/png, image/jpeg, image/jpg, image/webp"
        style={{ display: 'none' }}
      />

      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed #cbd5e1',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          background: '#f8faf8',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
      >
        {previewUrl ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={previewUrl}
              alt="Proof Preview"
              style={{ maxHeight: '180px', borderRadius: '12px', objectFit: 'cover', border: '2px solid var(--emerald-500)' }}
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--emerald-600)', fontWeight: 600, fontSize: '0.88rem' }}>
              <CheckCircle size={18} />
              <span>{selectedFile?.name || 'Proof image selected'}</span>
            </div>
            <span style={{ fontSize: '0.78rem', color: '#64748b' }}>Click to change photo</span>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.75rem' }}>
            <div
              style={{
                width: '54px',
                height: '54px',
                borderRadius: '50%',
                background: 'var(--emerald-50)',
                color: 'var(--emerald-600)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <UploadCloud size={28} />
            </div>

            <div>
              <span style={{ fontWeight: 700, color: '#0f172a', display: 'block' }}>
                Upload or Take Photo Proof
              </span>
              <span style={{ fontSize: '0.82rem', color: '#64748b' }}>
                Supports JPG, PNG, WEBP (Max 10MB)
              </span>
            </div>
          </div>
        )}
      </div>

      {!previewUrl && (
        <div style={{ textAlign: 'center', marginTop: '0.65rem' }}>
          <button
            type="button"
            className="btn-secondary"
            style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
            onClick={handleDemoSample}
          >
            <ImageIcon size={14} /> Use Demo Sample Photo
          </button>
        </div>
      )}
    </div>
  );
}
