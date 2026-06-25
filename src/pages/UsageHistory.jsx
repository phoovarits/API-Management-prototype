import { useMemo, useState } from 'react'
import Badge from '../components/Badge.jsx'
import { buildUsageHistory, USAGE_DAYS } from '../data/mockUsageHistory.js'
import { fmtDate } from '../utils.js'

const ENVS = [
  { key: 'all', label: 'ทั้งหมด' },
  { key: 'uat', label: 'UAT' },
  { key: 'production', label: 'Production' },
]

export default function UsageHistory({ customers }) {
  const [customerId, setCustomerId] = useState(customers[0]?._id || null)
  const [env, setEnv] = useState('all') // all | uat | production

  const customer = customers.find((c) => c._id === customerId) || null
  const history = useMemo(() => buildUsageHistory(customer), [customer])

  const showUat = env === 'all' || env === 'uat'
  const showProd = env === 'all' || env === 'production'

  // ค่าสูงสุดสำหรับ scale ของ bar chart (ดูจาก env ที่กำลังแสดง)
  const peak = useMemo(() => {
    if (!history) return 1
    let m = 1
    if (showUat) m = Math.max(m, history.uat.summary.peak)
    if (showProd) m = Math.max(m, history.production.summary.peak)
    return m
  }, [history, showUat, showProd])

  return (
    <div className="usage-history">
      <header className="uh-head">
        <div>
          <h2>ประวัติการใช้งาน API</h2>
          <p className="muted">
            ปริมาณการเรียก API ย้อนหลัง {USAGE_DAYS} วัน ต่อรายลูกค้า — แยก UAT / Production
            <span className="proto-pill" style={{ marginLeft: 8 }}>mock data</span>
          </p>
        </div>
        <div className="uh-controls">
          <label className="field">
            <span className="field-label">ลูกค้า</span>
            <select className="input" value={customerId || ''} onChange={(e) => setCustomerId(e.target.value)}>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>{c.customer_name}</option>
              ))}
            </select>
          </label>
          <div className="seg">
            {ENVS.map((e) => (
              <button
                key={e.key}
                className={'seg-btn' + (env === e.key ? ' active' : '')}
                onClick={() => setEnv(e.key)}
              >
                {e.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {!customer && <div className="empty big">ยังไม่มีลูกค้า</div>}

      {customer && history && (
        <>
          <div className="uh-customer">
            <Badge status={customer.status} />
            <span className="muted">{customer.contact_email}</span>
          </div>

          {/* สรุปต่อ environment */}
          <div className="uh-summary">
            {showUat && <EnvSummary env="uat" label="UAT" data={history.uat.summary} />}
            {showProd && <EnvSummary env="production" label="Production" data={history.production.summary} />}
          </div>

          {/* กราฟแท่งรายวัน */}
          <div className="block">
            <div className="block-head">
              <h3>การเรียกรายวัน</h3>
              <span className="muted small">เลื่อนชี้ที่แท่งเพื่อดูจำนวน</span>
            </div>
            <div className="uh-chart">
              {history.days.map((date, i) => {
                const u = history.uat.rows[i]
                const p = history.production.rows[i]
                return (
                  <div className="uh-bar-col" key={date} title={`${date}\nUAT: ${u.calls.toLocaleString()}\nProd: ${p.calls.toLocaleString()}`}>
                    <div className="uh-bars">
                      {showProd && (
                        <div className="uh-bar production" style={{ height: pct(p.calls, peak) }} />
                      )}
                      {showUat && (
                        <div className="uh-bar uat" style={{ height: pct(u.calls, peak) }} />
                      )}
                    </div>
                    <span className="uh-bar-label">{date.slice(5)}</span>
                  </div>
                )
              })}
            </div>
            <div className="uh-legend">
              {showProd && <span><i className="dot production" /> Production</span>}
              {showUat && <span><i className="dot uat" /> UAT</span>}
            </div>
          </div>

          {/* ตารางรายวัน */}
          <div className="block">
            <div className="block-head"><h3>รายละเอียดรายวัน</h3></div>
            <div className="uh-table-wrap">
              <table className="uh-table">
                <thead>
                  <tr>
                    <th>วันที่</th>
                    <th>Env</th>
                    <th className="num">เรียกทั้งหมด</th>
                    <th className="num">สำเร็จ</th>
                    <th className="num">error</th>
                    <th className="num">error %</th>
                    <th className="num">latency เฉลี่ย</th>
                    <th>endpoint ยอดนิยม</th>
                  </tr>
                </thead>
                <tbody>
                  {history.days
                    .map((date, i) => {
                      const rows = []
                      if (showProd) rows.push(history.production.rows[i])
                      if (showUat) rows.push(history.uat.rows[i])
                      return rows
                    })
                    .flat()
                    .reverse()
                    .map((r) => (
                      <tr key={r.env + r.date}>
                        <td>{fmtDate(r.date)}</td>
                        <td><span className={'env-tag ' + r.env}>{r.env === 'production' ? 'prod' : 'uat'}</span></td>
                        <td className="num">{r.calls.toLocaleString()}</td>
                        <td className="num">{r.success.toLocaleString()}</td>
                        <td className="num">{r.errors.toLocaleString()}</td>
                        <td className={'num' + (r.calls && r.errors / r.calls >= 0.03 ? ' warn' : '')}>
                          {r.calls ? ((r.errors / r.calls) * 100).toFixed(1) : '0.0'}%
                        </td>
                        <td className="num">{r.latency} ms</td>
                        <td><code>{r.topEndpoint}</code></td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function pct(v, max) {
  return Math.round((v / max) * 100) + '%'
}

function EnvSummary({ env, label, data }) {
  return (
    <div className={'uh-sum-card ' + env}>
      <div className="uh-sum-head">
        <span className={'env-tag ' + env}>{label}</span>
        <span className="muted small">{USAGE_DAYS} วันล่าสุด</span>
      </div>
      <div className="uh-sum-main">{data.calls.toLocaleString()}</div>
      <div className="uh-sum-sub muted">เรียกทั้งหมด</div>
      <div className="uh-sum-grid">
        <div>
          <span className="muted small">error rate</span>
          <strong className={data.errorRate >= 0.03 ? 'warn' : ''}>{(data.errorRate * 100).toFixed(2)}%</strong>
        </div>
        <div>
          <span className="muted small">latency เฉลี่ย</span>
          <strong>{data.latencyAvg} ms</strong>
        </div>
        <div>
          <span className="muted small">peak/วัน</span>
          <strong>{data.peak.toLocaleString()}</strong>
        </div>
        <div>
          <span className="muted small">ใช้งานล่าสุด</span>
          <strong>{data.lastActive ? fmtDate(data.lastActive) : '—'}</strong>
        </div>
      </div>
    </div>
  )
}
