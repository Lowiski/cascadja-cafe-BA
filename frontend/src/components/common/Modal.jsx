import Icon from './Icon.jsx';

// Generic dialog shell used by the admin add-forms.
export default function Modal({ title, subtitle, onClose, children, actions }) {
  return (
    <div className="modal-scrim" role="dialog" aria-modal="true" aria-label={title}>
      <div className="modal">
        <header className="modal__head">
          <div>
            <h3>{title}</h3>
            {subtitle && <p>{subtitle}</p>}
          </div>
          {onClose && (
            <button className="icon-btn" type="button" onClick={onClose} aria-label="Close dialog">
              <Icon name="close" size={16} />
            </button>
          )}
        </header>
        <div className="modal__body">
          {children}
          {actions && <div className="modal__actions">{actions}</div>}
        </div>
      </div>
    </div>
  );
}
