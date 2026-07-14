import { useMemo, useState } from 'react'
import Badge from '../components/Badge.jsx'
import UsagePanel from '../components/UsagePanel.jsx'
import ConfirmModal from '../components/ConfirmModal.jsx'
import PermissionPicker from '../components/PermissionPicker.jsx'
import { API_CATALOG, STATUS_META } from '../data/apiCatalog.js'
import { fmtDate, daysUntil, maskKey, copyText, generateApiKey } from '../utils.js'

const PAGE_SIZE = 8

export default function CustomerList({ customers, onUpdate, onDelete, onShowKeys }) {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(customers[0]?._id || null)
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(null)
  const [confirm, setConfirm] = useState(null) // { title, message, danger, onConfirm }
  const [copied, setCopied] = useState('')

  const filtered = useMemo(() => {
    return customers.filter((c) => {
      const matchQ =
        !query ||
        c.customer_name.toLowerCase().includes(query.toLowerCase()) ||
        c.contact_email?.toLowerCase().includes(query.toLowerCase())
      const matchS = statusFilter === 'all' || c.status === statusFilter
      return matchQ && matchS
    })
  }, [customers, query, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)
  const selected = customers.find((c) => c._id === selectedId) || null

  const flash = (msg) => {
    setCopied(msg)
    setTimeout(() => setCopied(''), 1600)
  }

  const startEdit = () => {
    setDraft({
      permissions: JSON.parse(JSON.stringify(selected.permissions)),
      rateLimit: { ...selected.rateLimit },
      expire_date: selected.expire_date?.slice(0, 10),
      active_date: selected.active_date?.slice(0, 10),
      contact_email: selected.contact_email,
    })
    setEditing(true)
  }

  const saveEdit = () => {
    onUpdate(selected._id, {
      permissions: draft.permissions,
      rateLimit: { rpm: Number(draft.rateLimit.rpm), dailyQuota: Number(draft.rateLimit.dailyQuota) },
      expire_date: new Date(draft.expire_date).toISOString(),
      active_date: new Date(draft.active_date).toISOString(),
      contact_email: draft.contact_email,
      updatedDtm: new Date().toISOString(),
    })
    setEditing(false)
    flash('บันทึกการแก้ไขแล้ว')
  }

  // ---- การกระทำ (actions) ----
  const doSuspendToggle = () => {
    const next = selected.status === 'suspended' ? 'active' : 'suspended'
    setConfirm({
      title: next === 'suspended' ? 'ระงับการใช้งาน?' : 'เปิดใช้งานอีกครั้ง?',
      message:
        next === 'suspended'
          ? `ลูกค้า "${selected.customer_name}" จะถูกบล็อกการเรียก API ทันที`
          : `ลูกค้า "${selected.customer_name}" จะกลับมาเรียก API ได้`,
      danger: next === 'suspended',
      confirmLabel: next === 'suspended' ? 'ระงับ' : 'เปิดใช้งาน',
      onConfirm: () => {
        onUpdate(selected._id, { status: next, updatedDtm: new Date().toISOString() })
        setConfirm(null)
        flash(next === 'suspended' ? 'ระงับการใช้งานแล้ว' : 'เปิดใช้งานแล้ว')
      },
    })
  }

  const doRegenerate = (env) => {
    setConfirm({
      title: `Regenerate ${env.toUpperCase()} key?`,
      message: `ออก key ใหม่สำหรับ ${env}. (ของจริงควรให้ key เก่ายัง valid ช่วงสั้น ๆ) จะแสดง key เต็มครั้งเดียว`,
      danger: false,
      confirmLabel: 'Regenerate',
      onConfirm: () => {
        const fresh = generateApiKey(env)
        const others = selected.apiKeys.filter((k) => k.environment !== env)
        onUpdate(selected._id, { apiKeys: [...others, fresh], updatedDtm: new Date().toISOString() })
        setConfirm(null)
        onShowKeys(selected, [fresh])
      },
    })
  }

  const doRevoke = (keyId) => {
    setConfirm({
      title: 'Revoke key นี้?',
      message: `key ${keyId} จะใช้งานไม่ได้ทันที (แยกจากการลบลูกค้า)`,
      danger: true,
      confirmLabel: 'Revoke',
      onConfirm: () => {
        const keys = selected.apiKeys.map((k) =>
          k.keyId === keyId ? { ...k, revokedDtm: new Date().toISOString() } : k
        )
        onUpdate(selected._id, { apiKeys: keys, updatedDtm: new Date().toISOString() })
        setConfirm(null)
        flash('Revoke key แล้ว')
      },
    })
  }

  const doDelete = () => {
    setConfirm({
      title: 'ลบลูกค้า (soft delete)?',
      message: `ลบ "${selected.customer_name}" — ใน production ควรเป็น soft delete เก็บ audit ไว้`,
      danger: true,
      confirmLabel: 'ลบ',
      onConfirm: () => {
        onDelete(selected._id)
        setConfirm(null)
        setSelectedId(null)
        flash('ลบลูกค้าแล้ว')
      },
    })
  }

  return (
    <div className="list-layout">
      {/* ฝั่งซ้าย: list */}
      <aside className="list-pane">
        <div className="list-controls">
          <input
            className="input"
            placeholder="ค้นหาชื่อลูกค้า / อีเมล…"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(1)
            }}
          />
          <select
            className="input"
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value)
              setPage(1)
            }}
          >
            <option value="all">ทุกสถานะ</option>
            {Object.entries(STATUS_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>

        <div className="list-items">
          {pageItems.map((c) => {
            const dleft = daysUntil(c.expire_date)
            return (
              <button
                key={c._id}
                className={'list-item' + (c._id === selectedId ? ' active' : '')}
                onClick={() => {
                  setSelectedId(c._id)
                  setEditing(false)
                }}
              >
                <div className="list-item-top">
                  <span className="list-item-name">{c.customer_name}</span>
                  <Badge status={c.status} />
                </div>
                <div className="list-item-sub">
                  <span>{c.contact_email}</span>
                  {dleft !== null && dleft <= 30 && c.status !== 'expired' && (
                    <span className="warn-pill">เหลือ {dleft} วัน</span>
                  )}
                </div>
              </button>
            )
          })}
          {pageItems.length === 0 && <div className="empty">ไม่พบลูกค้า</div>}
        </div>

        <div className="pager">
          <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            ‹
          </button>
          <span>{page} / {totalPages}</span>
          <button className="btn btn-ghost btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            ›
          </button>
          <span className="muted">· {filtered.length} ราย</span>
        </div>
      </aside>

      {/* ฝั่งขวา: detail */}
      <section className="detail-pane">
        {!selected && <div className="empty big">เลือกลูกค้าทางซ้ายเพื่อดูรายละเอียด</div>}

        {selected && !editing && (
          <>
            <header className="detail-head">
              <div>
                <h2>{selected.customer_name}</h2>
                <div className="detail-sub">
                  <Badge status={selected.status} />
                  <span className="muted">{selected.contact_email}</span>
                  <span className="muted">· dashboard: <code>{selected.dashboard?.username}</code></span>
                </div>
              </div>
              <div className="detail-actions">
                <button className="btn btn-primary btn-sm" onClick={startEdit}>แก้ไข</button>
                <button className="btn btn-ghost btn-sm" onClick={doSuspendToggle}>
                  {selected.status === 'suspended' ? 'เปิดใช้งาน' : 'ระงับ'}
                </button>
                <button className="btn btn-danger btn-sm" onClick={doDelete}>ลบ</button>
              </div>
            </header>

            {copied && <div className="toast">{copied}</div>}

            <div className="detail-grid">
              <Info label="วันเปิดใช้งาน" value={fmtDate(selected.active_date)} />
              <Info label="วันหมดอายุสัญญา" value={fmtDate(selected.expire_date)} />
              <Info label="สร้างเมื่อ" value={fmtDate(selected.createDtm)} />
              <Info label="แก้ไขล่าสุด" value={fmtDate(selected.updatedDtm)} />
            </div>

            {/* API Keys */}
            <div className="block">
              <div className="block-head">
                <h3>API Keys</h3>
                <span className="muted">เก็บเป็น hash — โชว์เต็มครั้งเดียวตอนสร้าง</span>
              </div>
              <div className="keys">
                {selected.apiKeys.map((k) => (
                  <div key={k.keyId} className={'key-row' + (k.revokedDtm ? ' revoked' : '')}>
                    <div>
                      <span className={'env-tag ' + k.environment}>{k.environment}</span>
                      <code className="key-mask">{maskKey(k)}</code>
                      {k.revokedDtm && <span className="warn-pill">revoked</span>}
                    </div>
                    <div className="key-row-actions">
                      <span className="muted small">{k.baseUrl}</span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          copyText(k.keyId)
                          flash('คัดลอก keyId แล้ว')
                        }}
                      >
                        copy
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => doRegenerate(k.environment)}>
                        regenerate
                      </button>
                      {!k.revokedDtm && (
                        <button className="btn btn-danger btn-sm" onClick={() => doRevoke(k.keyId)}>
                          revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Usage */}
            <div className="block">
              <div className="block-head"><h3>Usage / Quota</h3></div>
              <UsagePanel usage={selected.usage} rateLimit={selected.rateLimit} />
            </div>

            {/* Permissions */}
            <div className="block">
              <div className="block-head"><h3>สิทธิ์การใช้งาน (field-level)</h3></div>
              <PermissionSummary permissions={selected.permissions} />
            </div>
          </>
        )}

        {selected && editing && (
          <div className="edit-form">
            <header className="detail-head">
              <h2>แก้ไข — {selected.customer_name}</h2>
              <div className="detail-actions">
                <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>ยกเลิก</button>
                <button className="btn btn-primary btn-sm" onClick={saveEdit}>บันทึก</button>
              </div>
            </header>

            <div className="form-grid">
              <Field label="อีเมลติดต่อ">
                <input className="input" value={draft.contact_email}
                  onChange={(e) => setDraft({ ...draft, contact_email: e.target.value })} />
              </Field>
              <Field label="วันเปิดใช้งาน">
                <input type="date" className="input" value={draft.active_date}
                  onChange={(e) => setDraft({ ...draft, active_date: e.target.value })} />
              </Field>
              <Field label="วันหมดอายุสัญญา">
                <input type="date" className="input" value={draft.expire_date}
                  onChange={(e) => setDraft({ ...draft, expire_date: e.target.value })} />
              </Field>
              <Field label="Rate limit (rpm)">
                <input type="number" className="input" value={draft.rateLimit.rpm}
                  onChange={(e) => setDraft({ ...draft, rateLimit: { ...draft.rateLimit, rpm: e.target.value } })} />
              </Field>
              <Field label="Daily quota">
                <input type="number" className="input" value={draft.rateLimit.dailyQuota}
                  onChange={(e) => setDraft({ ...draft, rateLimit: { ...draft.rateLimit, dailyQuota: e.target.value } })} />
              </Field>
            </div>

            <h3 className="mt">แก้ไขสิทธิ์</h3>
            <PermissionPicker
              permissions={draft.permissions}
              onChange={(permissions) => setDraft({ ...draft, permissions })}
            />
          </div>
        )}
      </section>

      <ConfirmModal
        open={!!confirm}
        title={confirm?.title}
        message={confirm?.message}
        danger={confirm?.danger}
        confirmLabel={confirm?.confirmLabel}
        onCancel={() => setConfirm(null)}
        onConfirm={confirm?.onConfirm}
      />
    </div>
  )
}

function Info({ label, value }) {
  return (
    <div className="info">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
    </label>
  )
}

function PermissionSummary({ permissions }) {
  return (
    <div className="perm-summary">
      {API_CATALOG.map((api) => {
        const v = permissions[api.key]
        const on = Array.isArray(v) ? v.length > 0 : !!v
        return (
          <div key={api.key} className={'perm-summary-row' + (on ? '' : ' off')}>
            <span className="perm-summary-name">{on ? '✓' : '✗'} {api.label}</span>
            {Array.isArray(v) && v.length > 0 && (
              <span className="perm-summary-fields">
                {v.map((f) => <span key={f} className="tag">{f}</span>)}
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
