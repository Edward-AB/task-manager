import { useState, useRef, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

const MAX_LENGTH = 2000;

export default function MessageInput({ onSend, disabled }) {
  const { theme } = useTheme();
  const [text, setText] = useState('');
  const textareaRef = useRef(null);

  // Auto-grow
  useEffect(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lines = (text || '').split('\n').length;
    const max = 120;
    ta.style.height = Math.min(Math.max(36, ta.scrollHeight), max) + 'px';
  }, [text]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  const send = async () => {
    const content = text.trim();
    if (!content || disabled) return;
    const toSend = content.slice(0, MAX_LENGTH);
    setText('');
    try {
      await onSend?.(toSend);
    } catch {
      // on error we leave the input empty; the bubble will show failed state
    }
  };

  const counter = text.length;
  const showCounter = counter > 1800;

  return (
    <div style={{
      background: theme.surface,
      borderTop: `0.5px solid ${theme.border}`,
      padding: 10,
      position: 'relative',
    }}>
      <div style={{ position: 'relative' }}>
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_LENGTH))}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={1}
          style={{
            width: '100%',
            minHeight: 36,
            maxHeight: 120,
            padding: '8px 44px 8px 12px',
            borderRadius: 12,
            border: `0.5px solid ${theme.border}`,
            background: theme.bgSecondary,
            color: theme.textPrimary,
            fontSize: 12, fontFamily: 'inherit',
            lineHeight: 1.4,
            resize: 'none', outline: 'none',
          }}
          disabled={disabled}
        />
        {text.trim() && (
          <button
            onClick={send}
            style={{
              position: 'absolute',
              bottom: 4, right: 4,
              width: 28, height: 28, borderRadius: '50%',
              background: theme.accentBtn, color: theme.accentBtnText,
              border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: `transform 150ms ease`,
            }}
            aria-label="Send"
          >
            <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
              <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}
      </div>
      {showCounter && (
        <div style={{
          position: 'absolute', right: 14, bottom: -14,
          fontSize: 9, color: counter >= MAX_LENGTH ? theme.danger : theme.textTertiary,
          fontFamily: 'inherit',
        }}>
          {counter} / {MAX_LENGTH}
        </div>
      )}
    </div>
  );
}
