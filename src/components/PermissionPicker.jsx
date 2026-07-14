import { API_CATALOG } from '../data/apiCatalog.js'

// ตัวเลือก permission แบบ field-level — ใช้ทั้งหน้า Create และ Edit
// value = object permissions ตาม schema ข้อ 1, onChange(newPermissions, newMaxYears)
export default function PermissionPicker({ permissions, onChange }) {
  const update = (patch) => {
    onChange({ ...permissions, ...patch })
  }

  const isEnabled = (key) => {
    const v = permissions[key]
    return Array.isArray(v) ? v.length > 0 : !!v
  }

  const toggleApi = (api) => {
    const on = isEnabled(api.key)
    if (api.options) {
      // เปิด = ใส่ option แรกเป็นค่าเริ่มต้น, ปิด = array ว่าง
      update({ [api.key]: on ? [] : [api.options[0].key] })
    } else if (api.fields) {
      // เปิด = เลือกทุกฟิลด์ก่อน (ลูกค้าค่อยตัดออก), ปิด = array ว่าง
      update({ [api.key]: on ? [] : [...api.fields] })
    } else {
      update({ [api.key]: !on })
    }
  }

  const toggleSub = (apiKey, subKey) => {
    const cur = Array.isArray(permissions[apiKey]) ? permissions[apiKey] : []
    const next = cur.includes(subKey) ? cur.filter((x) => x !== subKey) : [...cur, subKey]
    update({ [apiKey]: next })
  }

  return (
    <div className="perm-picker">
      {API_CATALOG.map((api) => {
        const on = isEnabled(api.key)
        const selected = Array.isArray(permissions[api.key]) ? permissions[api.key] : []
        return (
          <div key={api.key} className={'perm-card' + (on ? ' on' : '')}>
            <label className="perm-head">
              <input
                type="checkbox"
                checked={on}
                onChange={() => toggleApi(api)}
              />
              <div className="perm-head-text">
                <div className="perm-title">{api.label}</div>
                <div className="perm-desc">
                  {api.desc} · <code>payload: {api.payload}</code>
                </div>
              </div>
            </label>

            {on && api.options && (
              <div className="perm-subs">
                <div className="perm-subs-label">เลือกได้ 1–2 อย่าง:</div>
                {api.options.map((opt) => (
                  <label key={opt.key} className="perm-chip">
                    <input
                      type="checkbox"
                      checked={selected.includes(opt.key)}
                      onChange={() => toggleSub(api.key, opt.key)}
                    />
                    {opt.label}
                  </label>
                ))}
              </div>
            )}

            {on && api.fields && (
              <div className="perm-subs">
                <div className="perm-subs-label">เลือกฟิลด์ที่ลูกค้าซื้อ ({selected.length}/{api.fields.length}):</div>
                <div className="perm-fields">
                  {api.fields.map((f) => (
                    <label key={f} className="perm-chip">
                      <input
                        type="checkbox"
                        checked={selected.includes(f)}
                        onChange={() => toggleSub(api.key, f)}
                      />
                      {f}
                    </label>
                  ))}
                </div>
              </div>
            )}

          </div>
        )
      })}
    </div>
  )
}
