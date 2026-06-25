// ยูทิลิตี้สำหรับ prototype (mock — ไม่ใช่ของ production จริง)

const HEX = '0123456789abcdef'
function randHex(n) {
  let s = ''
  for (let i = 0; i < n; i++) s += HEX[Math.floor(Math.random() * 16)]
  return s
}

// สร้าง mock API key — โชว์เต็มครั้งเดียวตอนสร้าง หลังจากนั้นเก็บแค่ last4 + hash
export function generateApiKey(env = 'production') {
  const prefix = env === 'uat' ? 'ak_test' : 'ak_live'
  const body = randHex(32)
  const full = `${prefix}_${body}`
  return {
    keyId: `${prefix}_${body.slice(0, 4)}`,
    fullKey: full, // โชว์ครั้งเดียว — production จริงจะไม่เก็บค่านี้
    hashedKey: `sha256:${randHex(64)}`, // mock hash
    last4: body.slice(-4),
    environment: env,
    baseUrl: env === 'uat' ? 'https://uat.api.creden.co/v1' : 'https://api.creden.co/v1',
    createdDtm: new Date().toISOString(),
    revokedDtm: null,
    label: env === 'uat' ? 'uat-primary' : 'prod-primary',
  }
}

export function maskKey(k) {
  if (!k) return ''
  return `${k.keyId}••••••••${k.last4}`
}

export function fmtDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d)) return iso
  return d.toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function daysUntil(iso) {
  if (!iso) return null
  const ms = new Date(iso) - new Date()
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export function uid() {
  return 'cus_' + randHex(8)
}

export function copyText(text) {
  if (navigator.clipboard) navigator.clipboard.writeText(text)
}
