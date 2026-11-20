import Icon from './Icon.jsx';

// Reusable confirmation dialog for destructive or irreversible actions.
export default function ConfirmModal({
  open = false,
  title = 'Are you sure?',
  message = '',
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
}) {
  if (!open) return null;
  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal">
        <header className="modal__head">
          <h3>{title}</h3>
        </header>
        <div className="modal__body">
          <p>{message}</p>
          <div className="modal__actions">
            <button type="button" className="btn btn--ghost" onClick={onCancel}>
              {cancelLabel}
            </button>
            <button type="button" className="btn btn--primary" onClick={onConfirm}>
              <Icon name="spark" size={16} /> {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
