# CREDEN — API Management (Prototype)

React (Vite) frontend prototype สำหรับระบบบริหารจัดการ API ของ CREDEN
อ้างอิงจากโน้ตออกแบบ *"API Management CREDEN — Gaps & Plan"*

> ⚠️ เป็น **prototype ฝั่ง frontend** ใช้ mock data ทั้งหมด ยังไม่มี backend จริง
> (key hashing, gateway enforcement, usage logging ฯลฯ เป็น UI mock)

## ฟีเจอร์

### Tab 1 — รายชื่อลูกค้า (List / Detail)
- List + ค้นหา / filter สถานะ / pagination
- Detail panel: status, วันเปิด/หมดอายุ, API keys (masked, แยก UAT/Prod),
  Usage/Quota, rate limit, permission แบบ field-level
- Actions: แก้ไข, ระงับ/เปิดใช้งาน, regenerate key, revoke key, ลบ (พร้อม confirm modal)

### Tab 2 — สร้าง Customer API (3-step wizard)
1. ข้อมูลลูกค้า + dashboard credential (พร้อม validation)
2. เลือก API ทีละเส้น (field-level permission) + rate limit / quota
3. ตรวจสอบ → สร้าง

### หน้า Keys
- Generate **UAT + Production key** พร้อมกัน, โชว์ key เต็มครั้งเดียว
- ตัวอย่างวิธีแนบ `X-API-Key` header + sample request/response (`{ data, meta, error }`)
- Endpoint guide เฉพาะที่ลูกค้าซื้อ

## Schema (ใหม่ ตาม Gaps & Plan)
- API key เก็บเป็น hash + `last4` (ไม่เก็บ plaintext)
- `environment` อยู่ที่ระดับ **key** (uat / production)
- `permissions` เป็น object **field-level** แทน field `service` เดิม
- Financial `maxYears` = permission cap

## เริ่มใช้งาน

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build → dist/
```

## โครงสร้าง

```
src/
  App.jsx                 # tab + shared state
  pages/
    CustomerList.jsx      # Tab 1: list + detail + actions
    CreateCustomer.jsx    # Tab 2: create wizard
    KeysGenerated.jsx     # หน้าแสดง key หลังสร้าง
  components/
    PermissionPicker.jsx  # เลือก API field-level (create + edit)
    UsagePanel.jsx
    ConfirmModal.jsx
    Badge.jsx
  data/
    apiCatalog.js         # แค็ตตาล็อก API + field ทั้งหมด
    mockCustomers.js      # ข้อมูลตัวอย่าง
  utils.js
```
