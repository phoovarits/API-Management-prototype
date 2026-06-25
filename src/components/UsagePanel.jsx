import { fmtDate } from '../utils.js'

export default function UsagePanel({ usage, rateLimit }) {
  const used = usage?.calledToday || 0
  const quota = rateLimit?.dailyQuota || 0
  const pct = quota ? Math.min(100, Math.round((used / quota) * 100)) : 0
  const barColor = pct >= 90 ? '#dc2626' : pct >= 70 ? '#d97706' : '#16a34a'

  return (
    <div className="usage-panel">
      <div className="usage-row">
        <span>โควต้าวันนี้</span>
        <span className="usage-num">
          {used.toLocaleString()} / {quota.toLocaleString()}
        </span>
      </div>
      <div className="usage-bar">
        <div className="usage-bar-fill" style={{ width: pct + '%', background: barColor }} />
      </div>
      <div className="usage-meta">
        <div>
          <span className="muted">Rate limit</span>
          <strong>{rateLimit?.rpm || '—'} rpm</strong>
        </div>
        <div>
          <span className="muted">เรียกสะสม</span>
          <strong>{(usage?.calledTotal || 0).toLocaleString()}</strong>
        </div>
        <div>
          <span className="muted">เรียกล่าสุด</span>
          <strong>{fmtDate(usage?.lastCalledDtm)}</strong>
        </div>
      </div>
    </div>
  )
}
