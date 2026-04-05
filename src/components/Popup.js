import React, { createContext, useContext, useState, useCallback } from 'react';

const PopupContext = createContext(null);

let _showToast = null;
let _showConfirm = null;

// Standalone functions usable outside React components
export const toast = (message, type = 'info') => _showToast?.(message, type);
export const confirmDialog = (message) => new Promise(resolve => _showConfirm?.(message, resolve));

const ICONS = {
  success: '✓',
  error: '✕',
  info: 'ℹ',
  warning: '⚠',
};

const COLORS = {
  success: { bg: '#f0fdf4', border: '#86efac', icon: '#16a34a', text: '#15803d' },
  error:   { bg: '#fef2f2', border: '#fca5a5', icon: '#dc2626', text: '#b91c1c' },
  info:    { bg: '#eff6ff', border: '#93c5fd', icon: '#2563eb', text: '#1d4ed8' },
  warning: { bg: '#fffbeb', border: '#fcd34d', icon: '#d97706', text: '#b45309' },
};

export const PopupProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirm, setConfirm] = useState(null); // { message, resolve }

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500);
  }, []);

  const showConfirm = useCallback((message, resolve) => {
    setConfirm({ message, resolve });
  }, []);

  _showToast = showToast;
  _showConfirm = showConfirm;

  const handleConfirm = (result) => {
    confirm?.resolve(result);
    setConfirm(null);
  };

  return (
    <PopupContext.Provider value={{ showToast, showConfirm }}>
      {children}

      {/* Toast Container */}
      <div style={{ position: 'fixed', top: 16, right: 16, zIndex: 99999, display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
        {toasts.map(t => {
          const c = COLORS[t.type] || COLORS.info;
          return (
            <div key={t.id} style={{
              display: 'flex', alignItems: 'flex-start', gap: 10,
              background: c.bg, border: `1px solid ${c.border}`,
              borderRadius: 12, padding: '12px 16px',
              boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
              animation: 'slideIn 0.25s ease',
              minWidth: 260,
            }}>
              <span style={{ width: 22, height: 22, borderRadius: '50%', background: c.icon, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0, marginTop: 1 }}>
                {ICONS[t.type]}
              </span>
              <p style={{ margin: 0, fontSize: '0.85rem', color: '#111', lineHeight: 1.5, flex: 1 }}>{t.message}</p>
              <button onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9ca3af', fontSize: '1rem', padding: 0, lineHeight: 1, flexShrink: 0 }}>×</button>
            </div>
          );
        })}
      </div>

      {/* Confirm Modal */}
      {confirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 99998 }}>
          <div style={{ background: '#fff', borderRadius: 16, padding: '28px 28px 20px', width: 360, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', animation: 'fadeIn 0.2s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <span style={{ width: 36, height: 36, borderRadius: '50%', background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>⚠</span>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#111' }}>Confirm Action</h3>
            </div>
            <p style={{ margin: '0 0 20px', fontSize: '0.875rem', color: '#555', lineHeight: 1.6 }}>{confirm.message}</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button onClick={() => handleConfirm(false)}
                style={{ padding: '8px 20px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', color: '#444' }}>
                Cancel
              </button>
              <button onClick={() => handleConfirm(true)}
                style={{ padding: '8px 20px', borderRadius: 8, border: 'none', background: '#D26600', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn { from { opacity: 0; transform: translateX(40px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes fadeIn  { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </PopupContext.Provider>
  );
};

export const usePopup = () => useContext(PopupContext);
