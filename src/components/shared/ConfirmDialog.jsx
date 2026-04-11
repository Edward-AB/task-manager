import { useTheme } from '../../hooks/useTheme.js';
import Modal from './Modal.jsx';
import Button from './Button.jsx';

export default function ConfirmDialog({
  open,
  onConfirm,
  onCancel,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  danger = false,
}) {
  const { theme } = useTheme();

  return (
    <Modal open={open} onClose={onCancel} title={title} width={420}>
      {message && (
        <p style={{ color: theme.textSecondary, fontSize: theme.font.body, lineHeight: 1.6, margin: '0 0 20px' }}>
          {message}
        </p>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <Button variant="secondary" onClick={onCancel} size="sm">
          Cancel
        </Button>
        <Button variant={danger ? 'danger' : 'primary'} onClick={onConfirm} size="sm">
          {confirmText}
        </Button>
      </div>
    </Modal>
  );
}
