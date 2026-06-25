import { useState } from 'react'
import { API_CATALOG } from '../data/apiCatalog.js'
import { copyText } from '../utils.js'

const BASE_PROD = 'https://api.creden.co/v1'
const BASE_UAT = 'https://uat.api.creden.co/v1'

export default function ApiDocs() {
  const [copied, setCopied] = useState('')
  const flash = (m) => { setCopied(m); setTimeout(() => setCopied(''), 1500) }

  return (
    <div className="docs-page">
      <header className="docs-head">
        <h2>เอกสาร API</h2>
        <p className="muted">
          รายละเอียดแต่ละเส้น API ที่ CREDEN ให้บริการ — payload, response และ field ที่ได้รับ
          ทุก endpoint เป็น <code>POST</code> และต้องแนบ header <code>X-API-Key</code>
        </p>
        <div className="docs-base">
          <div><span className="env-tag production">prod</span> <code>{BASE_PROD}</code></div>
          <div><span className="env-tag uat">uat</span> <code>{BASE_UAT}</code></div>
        </div>
      </header>

      {copied && <div className="toast">{copied}</div>}

      {/* สารบัญ */}
      <nav className="docs-toc">
        {API_CATALOG.map((api) => (
          <a key={api.key} href={'#api-' + api.key} className="docs-toc-item">
            <code>/{api.key}</code> {api.label}
          </a>
        ))}
      </nav>

      {API_CATALOG.map((api) => (
        <ApiDocCard key={api.key} api={api} onCopy={(t) => { copyText(t); flash('คัดลอกแล้ว') }} />
      ))}
    </div>
  )
}

function ApiDocCard({ api, onCopy }) {
  const reqBody = sampleRequest(api)
  const curl = `curl -X POST "${BASE_PROD}/${api.key}" \\
  -H "X-API-Key: ak_live_xxxxxxxxxxxxxxxx" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(reqBody)}'`
  const fields = api.fields || (api.options ? api.options.map((o) => o.label) : null)

  return (
    <section id={'api-' + api.key} className="doc-card">
      <div className="doc-card-head">
        <span className="method-tag">POST</span>
        <code className="doc-endpoint">/{api.key}</code>
        <h3>{api.label}</h3>
      </div>
      <p className="muted doc-desc">{api.desc}</p>

      <div className="doc-io">
        <div><span className="muted small">Payload</span><strong>{api.payload}</strong></div>
        <div><span className="muted small">Returns</span><strong>{api.returns}</strong></div>
      </div>

      {fields && (
        <div className="doc-fields">
          <div className="muted small">{api.options ? 'ตัวเลือก' : 'Field ที่ได้รับ'}</div>
          <div className="perm-fields">
            {fields.map((f) => <span key={f} className="tag">{f}</span>)}
          </div>
        </div>
      )}

      {api.yearOptions && (
        <div className="doc-fields">
          <div className="muted small">ช่วงปีที่เลือกซื้อได้ (maxYears cap)</div>
          <div className="perm-fields">
            {api.yearOptions.map((y) => <span key={y.value} className="tag">{y.label}</span>)}
          </div>
        </div>
      )}

      <div className="two-col">
        <div>
          <div className="block-head"><h4>Request</h4><span className="muted small">POST /{api.key}</span></div>
          <CodeBlock text={JSON.stringify(reqBody, null, 2)} onCopy={onCopy} />
        </div>
        <div>
          <div className="block-head"><h4>Response</h4><span className="muted small">data / meta / error</span></div>
          <CodeBlock text={JSON.stringify(sampleResponse(api), null, 2)} onCopy={onCopy} />
        </div>
      </div>

      <div className="doc-curl">
        <div className="block-head"><h4>ตัวอย่าง cURL</h4></div>
        <CodeBlock text={curl} onCopy={onCopy} />
      </div>
    </section>
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

function sampleRequest(api) {
  if (api.key === 'searching') return { query: 'บริษัท ตัวอย่าง', type: 'company' }
  if (api.key === 'financial') return { juristic_id: '0105556000001', years: 3 }
  return { juristic_id: '0105556000001' }
}

function sampleResponse(api) {
  const meta = { quota_remaining: 9999, request_id: 'req_8f3a2c10' }
  switch (api.key) {
    case 'searching':
      return {
        data: { results: [{ juristic_id: '0105556000001', name_th: 'บริษัท ตัวอย่าง จำกัด' }] },
        meta,
        error: null,
      }
    case 'general':
      return {
        data: {
          juristic_id: '0105556000001',
          name_th: 'บริษัท ตัวอย่าง จำกัด',
          name_en: 'Example Co., Ltd.',
          status: 'ดำเนินกิจการ',
          registered_capital: 5000000,
          financial_latest: { year: 2025, total_revenue: 98000000 },
        },
        meta,
        error: null,
      }
    case 'shareholder':
      return {
        data: {
          juristic_id: '0105556000001',
          shareholders: [
            { name: 'นาย ก. ตัวอย่าง', percentage: 51, shares: 51000 },
            { name: 'นาง ข. ตัวอย่าง', percentage: 49, shares: 49000 },
          ],
        },
        meta,
        error: null,
      }
    case 'director':
      return {
        data: {
          juristic_id: '0105556000001',
          directors: [{ name_th: 'นาย ก. ตัวอย่าง', position: 'กรรมการผู้มีอำนาจ' }],
        },
        meta,
        error: null,
      }
    case 'financial':
      return {
        data: {
          juristic_id: '0105556000001',
          financials: [
            { year: 2025, total_assets: 125000000, total_revenue: 98000000, net_profit: 12400000 },
            { year: 2024, total_assets: 110000000, total_revenue: 91000000, net_profit: 9800000 },
            { year: 2023, total_assets: 98000000, total_revenue: 84000000, net_profit: 7600000 },
          ],
        },
        meta: { ...meta, years_returned: 3, max_years: 3 },
        error: null,
      }
    case 'procurement':
      return {
        data: {
          juristic_id: '0105556000001',
          procurement: { count: 24, total_value: 58200000, latest_year: 2025 },
        },
        meta,
        error: null,
      }
    case 'vat':
      return {
        data: { juristic_id: '0105556000001', vat_registered: true, vat_id: '0105556000001' },
        meta,
        error: null,
      }
    default:
      return { data: {}, meta, error: null }
  }
}
