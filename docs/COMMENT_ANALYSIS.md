# วิเคราะห์ comment รีวิว — API Management (29-6-2569)

> วิเคราะห์ comment รอบรีวิว prototype ลงวันที่ **29 มิ.ย. 2569 (2026-06-29)**
> อัปเดตล่าสุด: **2026-07-14** · กลุ่มผู้อ่าน: Dev + Product
>
> **แหล่ง comment ต้นฉบับ:** `OneDrive/เอกสาร/Obsidian Vault/comment api menagement 29-6-2569.md`
> **โน้ตวิเคราะห์เดิม:** `API Management CREDEN - Gaps & Plan.md`, `จดไอเดีย API MANAGEMENT CREDEN DATA.md`

---

## 1. สรุปผู้บริหาร (TL;DR)

comment มี 5 ประเด็น — ลงมือรอบแรกไปแล้วเป็นส่วนใหญ่ แต่ยังมี business decision ค้าง 1 เรื่อง

| # | comment โดยย่อ | สถานะ | หลักฐาน / งานที่เหลือ |
|---|----------------|-------|----------------------|
| ① | วาง **journey** ลูกค้า (เอาข้อมูลอะไร → generate API) | 🟡 ทำบางส่วน | มี `docs/journey.drawio` แล้ว — ยังไม่ผูกเข้าเอกสาร/แอปให้เห็นชัด |
| ② | เอาคำ **"ทีละเส้น" ออก** (ให้เลือกหลายรายการ) | ✅ ทำแล้ว | แก้ `CreateCustomer.jsx` เป็น "(เลือกได้หลายรายการ)" แล้ว |
| ③ | **flow 6 step** + แนวคิด "API = สัญญา" | 🟡 ทำบางส่วน | จับใน journey/โน้ตแล้ว แต่ **schema ยังเป็น customer-level** ไม่ใช่ contract-level |
| ④ | ลง **FastAPI** — auto Swagger | ✅ ทำแล้ว | มี `backend/` POC เต็ม (gateway + Swagger + permission cap) |
| ⑤ | ปรับ **Daily quota** สำหรับของจริง | 🔴 ค้าง | เป็น business decision — ยังไม่เคาะโมเดล quota |

> ⚠️ **ข้อสังเกตสำคัญ:** งานรอบแรกทั้งหมด (`backend/`, `docs/`, การแก้ `CreateCustomer.jsx`)
> **ยังไม่ได้ commit ขึ้น git** — ถ้าเครื่องมีปัญหางานหายได้ → แนะนำ commit เป็นอย่างแรก (ดู §4)

**คะแนนรวมจากผู้รีวิว:** เชิงบวก — _"ดูดีเลยล่ะ … ตัวจัดการ API ดูดีเลยล่ะพี่"_ จุดที่ต้องปรับจริงมีหลักๆ แค่เรื่อง quota

---

## 2. วิเคราะห์รายข้อ

### ① วาง Customer Journey

> _"อาจจะต้องวาง journey เช่น ลูกค้าเอาข้อมูลอะไรบ้าง แล้วเราค่อย generate api มาให้ฟิว"_

**ตีความ:** ผู้รีวิวอยากเห็นภาพ end-to-end ว่าลูกค้าเดินทางยังไง — ตั้งแต่บอกความต้องการ (อยากได้ข้อมูลอะไร)
จนถึงตอนเราออก API key ให้ ไม่ใช่แค่หน้าจอ admin เดี่ยวๆ

**ทำไปแล้ว:**
- วาด journey diagram → `docs/journey.drawio` (เปิดใน app.diagrams.net ผ่านลิงก์ใน `docs/url.txt`)
- flow ในแอปจริงสะท้อน journey นี้แล้ว: Create (3 ขั้น) → generate keys → รายละเอียด/แก้ไข (ดู `docs/APP_GUIDE.md`)

**ช่องว่างที่เหลือ:**
- diagram ยังเป็นไฟล์แยก — คนอ่านเอกสารไม่เห็นถ้าไม่เปิด draw.io
- ยังไม่มีมุม "customer journey" จริง (ฝั่งลูกค้า) แยกจาก "admin journey" (ฝั่งเรา)

**คำแนะนำ:**
- export journey เป็น PNG/SVG ฝังใน `docs/APP_GUIDE.md` หรือ README ให้เห็นทันที
- แยกให้ชัด 2 มุม: **Admin journey** (สร้าง/จัดการลูกค้า) กับ **Customer journey** (รับ key → ยิง API → ดู usage ใน dashboard)

---

### ② เอาคำ "ทีละเส้น" ออก

> _"ในรูปบอกทีละเส้น แต่ให้เลือกทั้ง นิติบุคคลกับชื่อบุคคล น่าจะต้องเอาคำว่า ทีละเส้นออก"_

**ตีความ:** คำว่า "ทีละเส้น" สื่อว่าเลือกได้ทีละอย่าง แต่จริงๆ ระบบให้เลือกได้หลายรายการพร้อมกัน
(ทั้ง company + person ใน Searching, หลาย field ใน General ฯลฯ) — คำเลยขัดกับพฤติกรรมจริง

**ทำไปแล้ว:** ✅ แก้หัวข้อ step 2 ใน `src/pages/CreateCustomer.jsx` แล้ว
`"2. เลือก API & สิทธิ์ (ทีละเส้น)"` → `"2. เลือก API & สิทธิ์ (เลือกได้หลายรายการ)"`
(grep ทั้ง `src/` ไม่พบคำว่า "ทีละเส้น" เหลือแล้ว)

**ช่องว่างที่เหลือ:**
- ยังไม่ commit
- ประเด็นแฝงที่ผู้รีวิวชี้: **"person" (ชื่อบุคคล)** — ตอนนี้ Searching มี option `person` แต่ในโค้ดมีหมายเหตุ
  _"⚠ ยังไม่มี endpoint ปลายทาง"_ (ดู `src/data/apiCatalog.js`) → ยังต้องนิยามว่า person คืนข้อมูลอะไร (ดู §3)

**คำแนะนำ:** commit การแก้ไข + ยก "person คืนอะไร" ไปเป็นประเด็นตัดสินใจกับ PO

---

### ③ Flow 6 step + แนวคิด "API = สัญญา"

> _โจทย์ คือ รูปแบบของ_
> _0. Create account and contract_
> _1. api เป็นสัญญา_
> _2. เลือกข้อมูลที่ลูกค้าต้องการ_
> _3. Business logic ของการเลือกข้อมูล request **PO THINKING**_
> _4. Generate api_
> _5. Edit & delete & revoke & add transaction ระหว่างสัญญา เก็บ history_

**ตีความ (ตามที่เคาะกับผู้ใช้ 2026-06-29):**
- **"PO THINKING"** = **Product Owner** เป็นคนเคาะ business logic ของการเลือกข้อมูล (ไม่ใช่ Purchase Order)
- **"API = สัญญา (contract)"** — 1 สัญญาผูกชุดสิทธิ์ + ช่วงเวลา; ลูกค้า 1 รายอาจมีหลายสัญญา
- **"add transaction ระหว่างสัญญา + เก็บ history"** — ระหว่างอายุสัญญาต้องเพิ่ม/แก้รายการได้ และเก็บประวัติ

**ทำไปแล้ว:**
- flow นี้จับไว้ใน `docs/journey.drawio` + โน้ต Gaps & Plan
- แอปครอบ step 2 (เลือกข้อมูล field-level), step 4 (generate UAT+Prod key), step 5 บางส่วน
  (edit / revoke / regenerate / suspend / delete — ดู `CustomerList.jsx`)

**ช่องว่างที่เหลือ (สำคัญเชิงสถาปัตยกรรม):**
- schema ปัจจุบันผูกสิทธิ์/คีย์ที่ระดับ **customer** (ดู `src/data/mockCustomers.js`) — ยังไม่มี entity **contract**
- ยังไม่มี **"add transaction ระหว่างสัญญา"** และ **history log** ของการเปลี่ยนแปลงในสัญญา
- step 0 (create account + contract) กับ step 1 (api เป็นสัญญา) ยังไม่ถูกโมเดลเป็นของจริง

**คำแนะนำ:** ออกแบบ **contract-level schema** — ขยับ `permissions` / `apiKeys` / `rateLimit` / วันที่ ไปอยู่ใต้ contract:

```
Customer 1 ──< Contract (many)
                  ├─ permissions (field-level)
                  ├─ apiKeys [ uat, production ]
                  ├─ rateLimit / quota
                  ├─ active_date / expire_date / status
                  └─ transactions[] (history: created / edited / revoked / renewed …)
```

> เป็นงานออกแบบก้อนใหญ่ → ควรทำเป็น design doc แยกก่อนลงมือ (ดู §4 Phase A)

---

### ④ ลง FastAPI — auto Swagger

> _"ลองเอาไปลง code fast api python ดู มัน build api doc แบบ swagger ให้เลยนะ / Nestjs ก็มีล้ะ"_

**ตีความ:** ผู้รีวิวแนะให้พิสูจน์ว่าใช้ FastAPI แล้วได้ API docs (Swagger) อัตโนมัติ ลดงานเขียน docs มือ

**ทำไปแล้ว:** ✅ มี POC เต็มใน `backend/` (`main.py`, `README.md`, `requirements.txt`) พิสูจน์:
- Swagger UI อัตโนมัติที่ `/docs`, ReDoc ที่ `/redoc`, OpenAPI JSON ที่ `/openapi.json`
- pattern **API Gateway**: แนบ `X-API-Key` → เช็ค permission/quota/expiry → คืนข้อมูล
- Financial `maxYears` เป็น **permission cap** (ขอเกินสิทธิ์ตอบ 403)
- envelope มาตรฐาน `{ data, error }`

> **การตัดสินใจ stack:** เลือก **FastAPI (Python)** เพราะ auto-gen Swagger (เคาะแล้ว)

**ช่องว่างที่เหลือ (ระบุใน `backend/README.md` แล้ว):**
- ยัง in-memory — ต้องต่อ DB จริง
- key ยังเป็น plaintext ใน POC — ของจริงต้อง **hash (SHA-256)**
- rate limiter จริง (เช่น Redis) แทน counter ในหน่วยความจำ
- auth ฝั่ง admin/dashboard, audit log, versioning

**คำแนะนำ:** เก็บ FastAPI เป็น backend หลัก · commit POC · ต่อยอดตาม Phase ใน §4

---

### ⑤ ปรับ Business — Daily quota

> _"ดูดีเลยล่ะ แค่ถ้าเอาไปทำจริงอาจได้ปรับ Business ตัว Daily quota แน่ๆเลย แต่ตัวจัดการ API ดูดีเลยล่ะพี่"_

**ตีความ:** คำชม + จุดเดียวที่เตือนว่าจะต้องแก้ตอนทำจริงคือ **โมเดล daily quota** — ตอนนี้ยังหยาบ
(prototype มีแค่ `rateLimit.dailyQuota` ต่อ customer ตัวเดียว)

**ทำไปแล้ว:** prototype โชว์แนวคิด quota/วัน + แถบ usage (ดู `UsagePanel.jsx`) — แต่เป็น demo

**ช่องว่างที่เหลือ = ยังไม่เคาะ (business decision):** ดู §3 ด้านล่าง

**คำแนะนำ:** ยกเป็นวาระคุยกับทีม/PO ก่อน implement — เป็นตัวกำหนด billing model

---

## 3. ประเด็นที่ต้องเคาะกับทีม / PO

รวมคำถามที่ยังเปิดอยู่ ซึ่งกำหนด permission model + billing model — ควรตัดสินใจก่อนลงมือ backend เฟสถัดไป

### 3.1 จาก comment ③ (PO thinking)
1. **`person` (ชื่อบุคคล) คืนข้อมูลอะไร?** — endpoint ปลายทางทุกตัวรับ "เลขนิติบุคคล" แต่ยังไม่มี endpoint สำหรับบุคคล
2. **กติกา General Info vs endpoint เฉพาะ** (Director/Shareholder/Financial) — นิยามให้ชัดเพื่อ **กัน double-billing**
   - แนะนำ: General = snapshot เบาๆ / endpoint เฉพาะ = full detail หลายปี
3. **ถ้าซื้อ `financial` แต่ไม่ซื้อ `searching`** จะเอาเลขนิติมาจากไหน? (บังคับพ่วง searching หรือให้ลูกค้าส่งเอง)

### 3.2 จาก comment ⑤ (Daily quota model) — 3 แกนที่ต้องเลือก

| ประเด็น | ตัวเลือก |
|---------|----------|
| **ขอบเขต quota** | ต่อ contract · ต่อ key · หรือแยกต่อ endpoint |
| **รอบเวลา** | รายวัน · รายเดือน · หรือทั้งคู่ |
| **เมื่อเกิน** | บล็อก (429/403) · หรือคิด overage (เก็บเงินส่วนเกิน) |

> แนะนำเริ่มจาก **quota ต่อ contract + รายวัน + บล็อกเมื่อเกิน** (ง่ายสุด) แล้วค่อยเพิ่ม overage ทีหลัง

---

## 4. แผนงานต่อ (จัดลำดับความสำคัญ)

### ทำได้ทันที (Quick wins)
- [ ] **commit งานรอบแรก** ที่ยัง uncommitted (`backend/`, `docs/`, `CreateCustomer.jsx`) — กันงานหาย
- [ ] **export journey.drawio → PNG/SVG** ฝังใน `docs/APP_GUIDE.md` (ปิดงาน comment ①)
- [ ] จัดวาระประชุมกับ PO เคาะประเด็น §3

### Phase A — ออกแบบ Contract model (comment ③)
- [ ] เขียน design doc: contract-level schema (customer 1 : contract many) + transactions/history
- [ ] map schema เดิม → schema ใหม่ (ต่อยอดจาก `API Management CREDEN - Gaps & Plan.md`)

### Phase B — MVP backend จริง (comment ④ ต่อยอด)
- [ ] ต่อ DB จริง + **hash API key (SHA-256)** + hash password (bcrypt)
- [ ] CRUD ครบ + gateway auth → เช็ค status/expiry/permission

### Phase C — Usage & Quota (comment ⑤)
- [ ] `usage_logs` + rate limiter จริง (Redis)
- [ ] implement quota model ตามที่เคาะใน §3.2 + dashboard ดู history

### Phase D — Lifecycle & UAT & Polish
- [ ] expiry auto-block, email noti, renewal
- [ ] promote UAT → Production, sandbox
- [ ] analytics, audit log, API versioning

> ลำดับ Phase อ้างอิง "suggested phases" ในโน้ต `API Management CREDEN - Gaps & Plan.md` (§ ลำดับการทำ)

---

## 5. ภาคผนวก — ไฟล์อ้างอิง

**โน้ต Obsidian (ต้นทาง):**
- `OneDrive/เอกสาร/Obsidian Vault/comment api menagement 29-6-2569.md` — comment ต้นฉบับ
- `OneDrive/เอกสาร/Obsidian Vault/API Management CREDEN - Gaps & Plan.md` — วิเคราะห์ gaps 11 หัวข้อ + phases
- `OneDrive/เอกสาร/Obsidian Vault/จดไอเดีย API MANAGEMENT CREDEN DATA.md` — โน้ตไอเดียตั้งต้น

**ในโปรเจกต์:**
- `docs/journey.drawio` + `docs/url.txt` — journey diagram (comment ①)
- `docs/APP_GUIDE.md` — คู่มือแอป (แต่ละหน้า/ปุ่ม/schema)
- `backend/main.py` · `backend/README.md` — FastAPI POC (comment ④)
- `src/pages/CreateCustomer.jsx` — จุดที่แก้คำ "ทีละเส้น" (comment ②)
- `src/data/apiCatalog.js` · `src/data/mockCustomers.js` — แค็ตตาล็อก API + schema ปัจจุบัน

---

_เอกสารนี้เป็นบทวิเคราะห์ ณ 2026-07-14 — ไม่ได้แก้โค้ด/schema ใดๆ เมื่อมีการตัดสินใจใน §3 เพิ่มเติม กรุณาอัปเดต_
