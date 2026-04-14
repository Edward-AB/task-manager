import { useTheme } from '../../hooks/useTheme.js';

const EMOJI_ONLY_RE = /^(\p{Extended_Pictographic}\u200d?)(\p{Extended_Pictographic}\u200d?){0,2}$/u;
const URL_RE = /(https?:\/\/[^\s<]+)/g;

function formatTime(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  const yesterday = new Date(now); yesterday.setDate(yesterday.getDate() - 1);
  const wasYesterday = d.toDateString() === yesterday.toDateString();
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  if (sameDay) return `${hh}:${mm}`;
  if (wasYesterday) return `Yesterday ${hh}:${mm}`;
  return `${d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} ${hh}:${mm}`;
}

function linkify(text) {
  const parts = [];
  let lastIndex = 0;
  let m;
  const re = new RegExp(URL_RE.source, 'g');
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(text.slice(lastIndex, m.index));
    parts.push({ url: m[0] });
    lastIndex = m.index + m[0].length;
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex));
  return parts;
}

function renderLines(text, theme) {
  const lines = (text || '').split('\n');
  return lines.map((line, i) => (
    <span key={i}>
      {linkify(line).map((part, j) => typeof part === 'string' ? (
        <span key={j}>{part}</span>
      ) : (
        <a key={j} href={part.url} target="_blank" rel="noopener noreferrer"
           style={{ color: theme.accent, textDecoration: 'underline' }}>
          {part.url}
        </a>
      ))}
      {i < lines.length - 1 && <br />}
    </span>
  ));
}

export default function MessageBubble({ message, isSelf, showReadReceipt, onRetry }) {
  const { theme } = useTheme();
  const content = message.content || '';
  const stripped = content.replace(/\s/g, '');
  const isEmojiOnly = stripped.length > 0 && stripped.length <= 10 && EMOJI_ONLY_RE.test(stripped);
  const failed = message._failed;
  const optimistic = message._optimistic;

  const sentBg = theme.accentBg;
  const sentText = theme.accentText;
  const recvBg = theme.bgSecondary;
  const recvText = theme.textPrimary;

  return (
    <div style={{
      display: 'flex',
      justifyContent: isSelf ? 'flex-end' : 'flex-start',
      padding: '2px 0',
    }}>
      <div style={{ maxWidth: '80%' }}>
        <div style={{
          padding: isEmojiOnly ? '4px 8px' : '8px 12px',
          background: isSelf ? sentBg : recvBg,
          color: isSelf ? sentText : recvText,
          border: `0.5px solid ${isSelf ? theme.accentBorder : theme.border}`,
          borderRadius: 12,
          borderBottomRightRadius: isSelf ? 4 : 12,
          borderBottomLeftRadius: isSelf ? 12 : 4,
          fontSize: isEmojiOnly ? 28 : 13,
          lineHeight: 1.4,
          wordBreak: 'break-word',
          opacity: optimistic ? 0.7 : 1,
          position: 'relative',
        }}>
          {renderLines(content, theme)}
          {failed && (
            <span style={{
              position: 'absolute', top: -8, right: -8,
              width: 16, height: 16, borderRadius: '50%',
              background: theme.danger, color: '#fff',
              fontSize: 10, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }} title="Failed to send">!</span>
          )}
        </div>
        <div style={{
          fontSize: 10, color: theme.textTertiary,
          marginTop: 2,
          textAlign: isSelf ? 'right' : 'left',
          display: 'flex', gap: 6,
          justifyContent: isSelf ? 'flex-end' : 'flex-start',
          alignItems: 'center',
        }}>
          {failed && onRetry && (
            <button
              onClick={() => onRetry(message)}
              style={{
                background: 'none', border: 'none',
                color: theme.danger, fontSize: 10, fontWeight: 600,
                cursor: 'pointer', padding: 0, fontFamily: 'inherit',
                textDecoration: 'underline',
              }}
              title="Retry send"
            >Retry</button>
          )}
          {failed && <span style={{ color: theme.danger }}>Failed to send</span>}
          {!failed && <span>{formatTime(message.created_at)}</span>}
          {!failed && showReadReceipt && message.read_at && <span>· Read</span>}
        </div>
      </div>
    </div>
  );
}
