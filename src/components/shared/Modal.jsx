import { useEffect, useCallback } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export default function Modal({ open, onClose, title, children, width = 520 }) {
  const { theme } = useTheme();

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Escape') onClose?.();
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [open, handleKeyDown]);

  if (!open) return null;

  const backdropStyle = {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0,0,0,0.45)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    animation: 'modal-fade-in 0.2s ease',
  };

  const contentStyle = {
    background: theme.surface,
    borderRadius: theme.radius.lg,
    border: `1px solid ${theme.border}`,
    boxShadow: theme.shadow.xl,
    width: '90%',
    maxWidth: width,
    maxHeight: '85vh',
    overflow: 'auto',
    padding: '24px',
    animation: 'modal-scale-in 0.2s ease',
  };

  const titleStyle = {
    fontSize: theme.font.headingLg,
    fontWeight: 700,
    color: theme.textPrimary,
    marginBottom: '16px',
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <style>{`
        @keyframes modal-fade-in { from { opacity: 0; } to { opacity: 1; } }
        @keyframes modal-scale-in { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
      `}</style>
      <div style={contentStyle} onClick={(e) => e.stopPropagation()}>
        {title && <div style={titleStyle}>{title}</div>}
        {children}
      </div>
    </div>
  );
}
