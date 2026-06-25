export default function ConfirmModal({ open, title, message, danger, confirmLabel = 'ยืนยัน', onConfirm, onCancel }) {
  if (!open) return null
  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p className="modal-msg">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>ยกเลิก</button>
          <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
