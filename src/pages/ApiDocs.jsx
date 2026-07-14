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
  if (api.key === 'searching') return { query: 'ปตท', type: 'company' }
  return { juristic_id: '0107544000108' }
}

function sampleResponse(api) {
  const meta = { quota_remaining: 9999, request_id: 'req_8f3a2c10' }
  const jid = '0107544000108'
  switch (api.key) {
    case 'searching':
      return {
        data: {
          results: [
            { registration_no: jid, company_name: 'บริษัท ปตท. จำกัด (มหาชน)', business_status: 'ยังดำเนินกิจการอยู่' },
          ],
        },
        meta,
        error: null,
      }
    case 'general':
      return {
        data: {
          registration_no: jid,
          company_name: 'บริษัท ปตท. จำกัด (มหาชน)',
          business_status: 'ยังดำเนินกิจการอยู่',
          business_type: 'บริษัทมหาชนจำกัด',
          registration_date: '1 ต.ค. 2544',
          address: '555 ถนนวิภาวดีรังสิต จตุจักร กรุงเทพมหานคร',
        },
        meta,
        error: null,
      }
    case 'business':
      return {
        data: {
          registration_no: jid,
          registered_capital: 28562996250,
          company_value: 677784392923,
          business_size: 'Large',
          tsic_code: '19201 : การผลิตผลิตภัณฑ์ที่ได้จากโรงกลั่นปิโตรเลียม',
        },
        meta,
        error: null,
      }
    case 'trade_credit':
      return {
        data: { registration_no: jid, year: 2568, credit_term_days: 15, credit_limit_thb: 9593700000, financial_score: 2 },
        meta,
        error: null,
      }
    case 'ranking':
      return {
        data: { registration_no: jid, rank_thailand: 3, rank_bkk_metro: 3, rank_bangkok: 3 },
        meta,
        error: null,
      }
    case 'cash_cycle':
      return { data: { registration_no: jid, cash_cycle_days: 6 }, meta, error: null }
    case 'directors':
      return {
        data: {
          registration_no: jid,
          directors: [{ index: 1, partner: 'นายคงกระพัน อินทรแจ้ง' }],
          shareholders: [{ Firstname: 'กระทรวงการคลัง', pct_share: 51.38, Count_share: 14675631250 }],
        },
        meta,
        error: null,
      }
    case 'history':
      return {
        data: {
          registration_no: jid,
          capital_change_history: [{ index: 1, value: 20000000000, date_th: '1 ต.ค. 2544' }],
        },
        meta,
        error: null,
      }
    case 'financial':
      return {
        data: {
          registration_no: jid,
          fiscal_year: 2568,
          total_assets: 125000000,
          total_liabilities: 60000000,
          total_revenue: 98000000,
          net_profit: 12400000,
          roa_pct: 9.9,
          roe_pct: 14.2,
        },
        meta,
        error: null,
      }
    default:
      return { data: {}, meta, error: null }
  }
}
