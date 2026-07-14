import { useState } from 'react'
import { API_CATALOG } from '../data/apiCatalog.js'
import { copyText } from '../utils.js'

export default function KeysGenerated({ customer, keys, onDone }) {
  const [copied, setCopied] = useState('')
  const flash = (m) => { setCopied(m); setTimeout(() => setCopied(''), 1500) }

  const prod = keys.find((k) => k.environment === 'production')
  const sampleKey = prod || keys[0]

  // หา endpoint ตัวอย่างจากสิทธิ์ที่ซื้อ (กลุ่มแรกที่เปิด)
  const isOn = (v) => (Array.isArray(v) ? v.length > 0 : !!v)
  const firstEnabled = API_CATALOG.find((api) => api.key !== 'searching' && isOn(customer.permissions[api.key]))
  const exampleEndpoint = '/' + (firstEnabled ? firstEnabled.key : 'general')
  const exampleReqBody =
    exampleEndpoint === '/searching'
      ? { query: 'บริษัท ตัวอย่าง', type: 'company' }
      : { juristic_id: '0105556000001' }

  return (
    <div className="keys-page">
      <div className="success-head">
        <div className="success-icon">✓</div>
        <div>
          <h2>สร้างลูกค้า "{customer.customer_name}" สำเร็จ</h2>
          <p className="muted">บันทึก API key ทั้ง 2 เดี๋ยวนี้ — จะไม่แสดงเต็มอีก (เก็บเป็น hash)</p>
        </div>
      </div>

      {copied && <div className="toast">{copied}</div>}

      <div className="keys-grid">
        {keys.map((k) => (
          <div key={k.keyId} className={'key-card ' + k.environment}>
            <div className="key-card-head">
              <span className={'env-tag ' + k.environment}>{k.environment}</span>
              <span className="muted small">{k.baseUrl}</span>
            </div>
            <div className="key-full">
              <code>{k.fullKey}</code>
              <button className="btn btn-primary btn-sm" onClick={() => { copyText(k.fullKey); flash('คัดลอก ' + k.environment + ' key แล้ว') }}>
                copy
              </button>
            </div>
            <div className="muted small">keyId: {k.keyId} · last4: {k.last4}</div>
          </div>
        ))}
      </div>

      <div className="warn-banner">
        ⚠ key เต็มจะแสดงครั้งเดียว — ฝั่ง production เก็บแค่ SHA-256 hash + last4 เท่านั้น
      </div>

      {/* วิธีแนบ key ใน header */}
      <div className="block">
        <div className="block-head"><h3>วิธีแนบ API key ใน header</h3></div>
        <CodeBlock
          onCopy={(t) => { copyText(t); flash('คัดลอกแล้ว') }}
          text={`curl -X POST "${sampleKey.baseUrl}${exampleEndpoint}" \\
  -H "X-API-Key: ${sampleKey.fullKey}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(exampleReqBody)}'`}
        />
      </div>

      {/* ตัวอย่าง request / response */}
      <div className="two-col">
        <div className="block">
          <div className="block-head"><h3>ตัวอย่าง Request payload</h3><span className="muted small">POST {exampleEndpoint}</span></div>
          <CodeBlock onCopy={(t) => { copyText(t); flash('คัดลอกแล้ว') }} text={JSON.stringify(exampleReqBody, null, 2)} />
        </div>
        <div className="block">
          <div className="block-head"><h3>ตัวอย่าง Response</h3><span className="muted small">envelope: data / meta / error</span></div>
          <CodeBlock
            onCopy={(t) => { copyText(t); flash('คัดลอกแล้ว') }}
            text={JSON.stringify(sampleResponse(exampleEndpoint, customer), null, 2)}
          />
        </div>
      </div>

      {/* integration guide ตามสิทธิ์ที่ซื้อ */}
      <div className="block">
        <div className="block-head"><h3>Endpoint ที่ลูกค้ารายนี้เรียกได้</h3></div>
        <ul className="endpoint-list">
          {API_CATALOG.map((api) => {
            const v = customer.permissions[api.key]
            const on = Array.isArray(v) ? v.length > 0 : !!v
            if (!on) return null
            return (
              <li key={api.key}>
                <code>POST /{api.key}</code>
                <span className="muted">— {api.desc}</span>
                {Array.isArray(v) && v.length > 0 && <span className="tag">{v.length} field</span>}
              </li>
            )
          })}
        </ul>
      </div>

      <div className="card-actions center">
        <button className="btn btn-primary" onClick={onDone}>เสร็จสิ้น → ไปหน้า List</button>
      </div>
    </div>
  )
}

function CodeBlock({ text, onCopy }) {
  return (
    <div className="codeblock">
      <button className="codeblock-copy" onClick={() => onCopy(text)}>copy</button>
      <pre><code>{text}</code></pre>
    </div>
  )
}

function sampleResponse(endpoint, customer) {
  const meta = { quota_remaining: customer.rateLimit.dailyQuota - 1 }
  if (endpoint === '/searching') {
    return {
      data: { results: [{ registration_no: '0105556000001', company_name: 'บริษัท ตัวอย่าง จำกัด' }] },
      meta,
      error: null,
    }
  }
  if (endpoint === '/financial') {
    return {
      data: {
        registration_no: '0105556000001',
        fiscal_year: 2568,
        total_assets: 125000000,
        total_revenue: 98000000,
        net_profit: 12400000,
        roa_pct: 9.9,
        roe_pct: 14.2,
      },
      meta,
      error: null,
    }
  }
  return {
    data: {
      registration_no: '0105556000001',
      company_name: 'บริษัท ตัวอย่าง จำกัด',
      business_status: 'ยังดำเนินกิจการอยู่',
      registered_capital: 5000000,
    },
    meta,
    error: null,
  }
}
