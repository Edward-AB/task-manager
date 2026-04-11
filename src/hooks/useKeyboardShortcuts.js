import { useEffect } from 'react';

/**
 * Global keyboard shortcuts for the dashboard.
 * Only fires when no input/textarea/select is focused.
 */
export default function useKeyboardShortcuts({
  onNewTask,
  onToggleTimer,
  onToggleTheme,
  onPrevDay,
  onNextDay,
  onEscape,
  onHelp,
}) {
  useEffect(() => {
    const handler = (e) => {
      const tag = document.activeElement?.tagName?.toLowerCase();
      if (tag === 'input' || tag === 'textarea' || tag === 'select') return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;

      switch (e.key) {
        case 'n':
        case 'N':
          e.preventDefault();
          onNewTask?.();
          break;
        case 't':
        case 'T':
          e.preventDefault();
          onToggleTimer?.();
          break;
        case 'd':
        case 'D':
          e.preventDefault();
          onToggleTheme?.();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          onPrevDay?.();
          break;
        case 'ArrowRight':
          e.preventDefault();
          onNextDay?.();
          break;
        case 'Escape':
          onEscape?.();
          break;
        case '?':
          e.preventDefault();
          onHelp?.();
          break;
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [onNewTask, onToggleTimer, onToggleTheme, onPrevDay, onNextDay, onEscape, onHelp]);
}
