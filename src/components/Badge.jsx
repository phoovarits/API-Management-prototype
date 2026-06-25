import { STATUS_META } from '../data/apiCatalog.js'

export default function Badge({ status }) {
  const m = STATUS_META[status] || { label: status, color: '#374151', bg: '#e5e7eb' }
  return (
    <span className="badge" style={{ color: m.color, background: m.bg }}>
      <span className="badge-dot" style={{ background: m.color }} />
      {m.label}
    </span>
  )
}
