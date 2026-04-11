import { useState } from 'react';
import { useTheme } from '../../hooks/useTheme.js';

export default function Card({ children, style, hover = false, ...rest }) {
  const { theme } = useTheme();
  const [hovered, setHovered] = useState(false);

  const cardStyle = {
    background: theme.surface,
    border: `1px solid ${theme.border}`,
    borderRadius: theme.radius.lg,
    padding: '20px',
    transition: `box-shadow ${theme.transition}, transform ${theme.transition}`,
    boxShadow: hover && hovered ? theme.shadow.md : 'none',
    transform: hover && hovered ? 'translateY(-2px)' : 'none',
    ...style,
  };

  return (
    <div
      style={cardStyle}
      onMouseEnter={hover ? () => setHovered(true) : undefined}
      onMouseLeave={hover ? () => setHovered(false) : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
