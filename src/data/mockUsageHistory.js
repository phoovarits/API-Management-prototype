// Mock API usage history ต่อ "ลูกค้า" แยกตาม environment (uat / production)
// prototype only — สร้างแบบ deterministic (seeded) เพื่อให้ค่าคงที่ทุกครั้งที่ render
// production จริงจะดึงจาก usage-log / time-series store

const ENDPOINTS = [
  '/searching',
  '/general',
  '/business',
  '/trade_credit',
  '/ranking',
  '/cash_cycle',
  '/directors',
  '/history',
  '/financial',
]

const DAYS = 14
const TODAY = '2026-06-26' // วันอ้างอิงของ prototype

// seeded PRNG (mulberry32) — ให้ตัวเลข mock เดิมทุกครั้ง
function seeded(seed) {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

function hashStr(s) {
  let h = 0
  for (let i = 0; i < s.length; i++) h = (Math.imul(h, 31) + s.charCodeAt(i)) >>> 0
  return h
}

function dateMinus(baseIso, days) {
  const d = new Date(baseIso + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

// permission ที่ลูกค้าซื้อ → endpoint ที่ "เรียกได้จริง" (ใช้สุ่ม top endpoint ให้สมจริง)
function allowedEndpoints(customer) {
  const perms = customer?.permissions || {}
  const eps = ENDPOINTS.filter((ep) => {
    const key = ep.slice(1)
    const v = perms[key]
    return Array.isArray(v) ? v.length > 0 : !!v
  })
  return eps.length ? eps : ['/general']
}

function buildEnvRows(customer, env) {
  const seed = hashStr(customer.customer_name + '|' + env)
  const rand = seeded(seed)
  const eps = allowedEndpoints(customer)

  // PROD เป็น traffic หลัก, UAT เบากว่ามาก
  const dailyBase =
    env === 'production'
      ? Math.max(50, customer.usage?.calledToday || 1500)
      : Math.max(10, Math.round((customer.usage?.calledToday || 1500) * 0.12))

  const suspended = customer.status === 'suspended' || customer.status === 'expired'

  const rows = []
  for (let i = DAYS - 1; i >= 0; i--) {
    const date = dateMinus(TODAY, i)
    // ลูกค้าที่ระงับ/หมดอายุ → ช่วงท้าย ๆ ปริมาณตกลงเหลือ 0
    const decay = suspended ? Math.max(0, (DAYS - 1 - i) / (DAYS - 1)) : 1
    const calls = Math.round(dailyBase * (0.55 + rand() * 0.9) * decay)
    const errors = Math.round(calls * rand() * 0.045)
    const latency = Math.round(110 + rand() * 360)
    const topEndpoint = eps[Math.floor(rand() * eps.length)]
    rows.push({ date, env, calls, errors, success: calls - errors, latency, topEndpoint })
  }
  return rows
}

function summarize(rows) {
  const calls = rows.reduce((s, r) => s + r.calls, 0)
  const errors = rows.reduce((s, r) => s + r.errors, 0)
  const latencyAvg = rows.length
    ? Math.round(rows.reduce((s, r) => s + r.latency, 0) / rows.length)
    : 0
  const peak = rows.reduce((m, r) => Math.max(m, r.calls), 0)
  const lastActive = [...rows].reverse().find((r) => r.calls > 0)?.date || null
  return {
    calls,
    errors,
    errorRate: calls ? errors / calls : 0,
    latencyAvg,
    peak,
    lastActive,
  }
}

// คืน { days, uat, production } — สร้างสด ๆ ต่อ customer (รองรับลูกค้าที่เพิ่งสร้างด้วย)
export function buildUsageHistory(customer) {
  if (!customer) return null
  const uatRows = buildEnvRows(customer, 'uat')
  const prodRows = buildEnvRows(customer, 'production')
  const days = uatRows.map((r) => r.date)
  return {
    days,
    uat: { rows: uatRows, summary: summarize(uatRows) },
    production: { rows: prodRows, summary: summarize(prodRows) },
  }
}

export const USAGE_DAYS = DAYS
