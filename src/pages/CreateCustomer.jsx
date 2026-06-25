import { useState } from 'react'
import PermissionPicker from '../components/PermissionPicker.jsx'
import { API_CATALOG } from '../data/apiCatalog.js'
import { uid, generateApiKey } from '../utils.js'

const emptyPermissions = {
  searching: [],
  general: [],
  shareholder: [],
  director: false,
  financial: false,
  procurement: false,
  vat: false,
}

export default function CreateCustomer({ existingNames, onCreate, onShowKeys }) {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    customer_name: '',
    contact_email: '',
    active_date: '',
    expire_date: '',
    dashUser: '',
    dashPass: '',
    rpm: 60,
    dailyQuota: 10000,
  })
  const [permissions, setPermissions] = useState(emptyPermissions)
  const [maxYears, setMaxYears] = useState(0)
  const [errors, setErrors] = useState({})

  const set = (k, v) => setForm({ ...form, [k]: v })

  const validateStep1 = () => {
    const e = {}
    if (!form.customer_name.trim()) e.customer_name = 'กรุณากรอกชื่อลูกค้า'
    else if (existingNames.some((n) => n.toLowerCase() === form.customer_name.trim().toLowerCase()))
      e.customer_name = 'ชื่อลูกค้าซ้ำกับที่มีอยู่'
    if (!form.contact_email.trim()) e.contact_email = 'กรุณากรอกอีเมล'
    if (!form.active_date) e.active_date = 'เลือกวันเปิดใช้งาน'
    if (!form.expire_date) e.expire_date = 'เลือกวันหมดอายุ'
    if (form.active_date && form.expire_date && form.active_date >= form.expire_date)
      e.expire_date = 'วันหมดอายุต้องหลังวันเปิดใช้งาน'
    if (!form.dashUser.trim()) e.dashUser = 'กรอก username dashboard'
    if (!form.dashPass.trim()) e.dashPass = 'กรอก password dashboard'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const anyPermission = API_CATALOG.some((api) => {
    const v = permissions[api.key]
    return Array.isArray(v) ? v.length > 0 : !!v
  })

  const submit = () => {
    const uatKey = generateApiKey('uat')
    const prodKey = generateApiKey('production')
    const newCustomer = {
      _id: uid(),
      customer_name: form.customer_name.trim(),
      contact_email: form.contact_email.trim(),
      status: 'active',
      apiKeys: [
        stripFull(prodKey),
        stripFull(uatKey),
      ],
      permissions,
      financialMaxYears: maxYears,
      rateLimit: { rpm: Number(form.rpm), dailyQuota: Number(form.dailyQuota) },
      usage: { calledToday: 0, calledTotal: 0, lastCalledDtm: null },
      active_date: new Date(form.active_date).toISOString(),
      createDtm: new Date().toISOString(),
      expire_date: new Date(form.expire_date).toISOString(),
      dashboard: { username: form.dashUser.trim() }, // passwordHash เก็บฝั่ง backend
      createdBy: 'admin_user',
      updatedDtm: new Date().toISOString(),
    }
    onCreate(newCustomer)
    // ส่ง key เต็มไปหน้า generate (โชว์ครั้งเดียว)
    onShowKeys(newCustomer, [prodKey, uatKey])
  }

  return (
    <div className="create-wrap">
      <Steps step={step} />

      {step === 1 && (
        <div className="card">
          <h2>1. ข้อมูลลูกค้า</h2>
          <div className="form-grid">
            <Field label="ชื่อลูกค้า (Customer name) *" error={errors.customer_name}>
              <input className="input" value={form.customer_name} onChange={(e) => set('customer_name', e.target.value)} />
            </Field>
            <Field label="อีเมลติดต่อ *" error={errors.contact_email}>
              <input className="input" value={form.contact_email} onChange={(e) => set('contact_email', e.target.value)} />
            </Field>
            <Field label="วันเปิดใช้งาน *" error={errors.active_date}>
              <input type="date" className="input" value={form.active_date} onChange={(e) => set('active_date', e.target.value)} />
            </Field>
            <Field label="วันหมดอายุสัญญา *" error={errors.expire_date}>
              <input type="date" className="input" value={form.expire_date} onChange={(e) => set('expire_date', e.target.value)} />
            </Field>
            <Field label="Username (dashboard) *" error={errors.dashUser}>
              <input className="input" value={form.dashUser} onChange={(e) => set('dashUser', e.target.value)} />
            </Field>
            <Field label="Password (dashboard) *" error={errors.dashPass}>
              <input type="password" className="input" value={form.dashPass} onChange={(e) => set('dashPass', e.target.value)} />
              <span className="hint">จะถูก hash (bcrypt) ฝั่ง backend — ไม่เก็บ plaintext</span>
            </Field>
          </div>
          <div className="card-actions">
            <button className="btn btn-primary" onClick={() => validateStep1() && setStep(2)}>ถัดไป →</button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="card">
          <h2>2. เลือก API & สิทธิ์ (ทีละเส้น)</h2>
          <p className="muted">เลือกเฉพาะ endpoint/field ที่ลูกค้าซื้อ — จะถูกบังคับที่ gateway จริงตอนยิง API</p>
          <PermissionPicker
            permissions={permissions}
            maxYears={maxYears}
            onChange={(p, y) => { setPermissions(p); setMaxYears(y) }}
          />
          <h3 className="mt">Rate limit / Quota</h3>
          <div className="form-grid">
            <Field label="Rate limit (rpm)">
              <input type="number" className="input" value={form.rpm} onChange={(e) => set('rpm', e.target.value)} />
            </Field>
            <Field label="Daily quota">
              <input type="number" className="input" value={form.dailyQuota} onChange={(e) => set('dailyQuota', e.target.value)} />
            </Field>
          </div>
          {!anyPermission && <div className="error-banner">ต้องเลือกอย่างน้อย 1 API</div>}
          <div className="card-actions">
            <button className="btn btn-ghost" onClick={() => setStep(1)}>← ย้อนกลับ</button>
            <button className="btn btn-primary" disabled={!anyPermission} onClick={() => setStep(3)}>ตรวจสอบ →</button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="card">
          <h2>3. ตรวจสอบก่อนสร้าง</h2>
          <div className="review">
            <ReviewRow label="ชื่อลูกค้า" value={form.customer_name} />
            <ReviewRow label="อีเมล" value={form.contact_email} />
            <ReviewRow label="ช่วงสัญญา" value={`${form.active_date} → ${form.expire_date}`} />
            <ReviewRow label="Dashboard user" value={form.dashUser} />
            <ReviewRow label="Rate limit" value={`${form.rpm} rpm · ${Number(form.dailyQuota).toLocaleString()}/วัน`} />
            <div className="review-row">
              <span className="info-label">API ที่ซื้อ</span>
              <div className="perm-summary">
                {API_CATALOG.map((api) => {
                  const v = permissions[api.key]
                  const on = Array.isArray(v) ? v.length > 0 : !!v
                  if (!on) return null
                  return (
                    <div key={api.key} className="perm-summary-row">
                      <span className="perm-summary-name">
                        ✓ {api.label}
                        {api.key === 'financial' && maxYears ? ` · สูงสุด ${maxYears} ปี` : ''}
                      </span>
                      {Array.isArray(v) && v.length > 0 && (
                        <span className="perm-summary-fields">
                          {v.map((f) => <span key={f} className="tag">{f}</span>)}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
          <div className="info-banner">
            เมื่อกดสร้าง ระบบจะ generate <strong>UAT key</strong> และ <strong>Production key</strong> พร้อมกัน
            และแสดง key เต็มให้คัดลอก <strong>เพียงครั้งเดียว</strong>
          </div>
          <div className="card-actions">
            <button className="btn btn-ghost" onClick={() => setStep(2)}>← ย้อนกลับ</button>
            <button className="btn btn-primary" onClick={submit}>สร้าง & generate keys</button>
          </div>
        </div>
      )}
    </div>
  )
}

function stripFull(k) {
  // เก็บลง store แบบไม่มี fullKey (เลียนแบบ production ที่เก็บแค่ hash)
  const { fullKey, ...rest } = k
  return rest
}

function Steps({ step }) {
  const labels = ['ข้อมูลลูกค้า', 'เลือก API & สิทธิ์', 'ตรวจสอบ']
  return (
    <div className="steps">
      {labels.map((l, i) => (
        <div key={l} className={'step' + (step === i + 1 ? ' active' : step > i + 1 ? ' done' : '')}>
          <span className="step-num">{step > i + 1 ? '✓' : i + 1}</span>
          <span>{l}</span>
        </div>
      ))}
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {error && <span className="field-error">{error}</span>}
    </label>
  )
}

function ReviewRow({ label, value }) {
  return (
    <div className="review-row">
      <span className="info-label">{label}</span>
      <span className="info-value">{value}</span>
    </div>
  )
}
