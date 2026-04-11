export default function LoadingSkeleton({ width = '100%', height = 16, style }) {
  const skeletonStyle = {
    width,
    height,
    borderRadius: '6px',
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border)',
    overflow: 'hidden',
    position: 'relative',
    ...style,
  };

  return (
    <div className="skeleton" style={skeletonStyle}>
      <style>{`
        .skeleton::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(
            90deg,
            transparent 0%,
            var(--border) 50%,
            transparent 100%
          );
          animation: skeleton-shimmer 1.5s ease infinite;
        }
        @keyframes skeleton-shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
