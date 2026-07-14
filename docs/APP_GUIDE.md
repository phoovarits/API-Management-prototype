# คู่มือแอป — CREDEN API Management (Prototype)

> เอกสารนี้อธิบายว่าแต่ละหน้าของ prototype คืออะไร ทำอะไรได้ ใช้งานยังไง ปุ่มไหนทำงานอย่างไร
> รวมถึง schema ข้อมูล, สถาปัตยกรรม และข้อควรรู้สำหรับทีม Dev และ Product
>
> **กลุ่มผู้อ่าน:** Dev + Product · **สถานะ:** Prototype (ข้อมูล mock ทั้งหมด ยังไม่ต่อ backend จริง)

---

## สารบัญ

> เรียงตามลำดับความสำคัญ — เริ่มที่ "ภาพรวม + วิธีใช้" แล้วค่อยลงรายละเอียดทีละหน้า ปิดท้ายด้วย reference เชิงเทคนิค

1. [ภาพรวมระบบ](#1-ภาพรวมระบบ)
2. [เริ่มต้นใช้งาน (Quick Start)](#2-เริ่มต้นใช้งาน-quick-start)
3. [วิธีการใช้งาน (Common Tasks)](#3-วิธีการใช้งาน-common-tasks)
4. [โครงสร้างการนำทาง (Navigation)](#4-โครงสร้างการนำทาง-navigation)
5. [หน้า: รายชื่อลูกค้า (Customer List)](#5-หน้า-รายชื่อลูกค้า-customer-list)
6. [หน้า: สร้าง Customer API (Create)](#6-หน้า-สร้าง-customer-api-create)
7. [หน้า: Keys ที่สร้าง (Keys Generated)](#7-หน้า-keys-ที่สร้าง-keys-generated)
8. [หน้า: เอกสาร API (API Docs)](#8-หน้า-เอกสาร-api-api-docs)
9. [หน้า: ประวัติการใช้งาน (Usage History)](#9-หน้า-ประวัติการใช้งาน-usage-history)
10. [แค็ตตาล็อก API & ระบบสิทธิ์](#10-แค็ตตาล็อก-api--ระบบสิทธิ์)
11. [Schema ข้อมูล (Data Schema)](#11-schema-ข้อมูล-data-schema)
12. [สถาปัตยกรรม & การไหลของข้อมูล](#12-สถาปัตยกรรม--การไหลของข้อมูล)
13. [Component & Utility อ้างอิง](#13-component--utility-อ้างอิง)
14. [ข้อจำกัดของ Prototype & สิ่งที่ต้องทำต่อ](#14-ข้อจำกัดของ-prototype--สิ่งที่ต้องทำต่อ)

---

## 1. ภาพรวมระบบ

แอปนี้เป็นหน้า **Admin Console** สำหรับทีม CREDEN ใช้บริหารจัดการลูกค้าที่ซื้อบริการ API
(ข้อมูลนิติบุคคล เช่น งบการเงิน ผู้ถือหุ้น กรรมการ ฯลฯ) ครอบคลุมงานหลัก:

- **สร้างลูกค้าใหม่** พร้อมกำหนดสิทธิ์การเข้าถึง API ระดับ field และออก API key (UAT + Production)
- **ดู/แก้ไข** ข้อมูลลูกค้า สิทธิ์ rate limit วันหมดอายุ
- **จัดการ API key** — regenerate / revoke / copy
- **ระงับ (suspend) / เปิดใช้งาน / ลบ** ลูกค้า
- **ดูเอกสาร API** ของแต่ละ endpoint (payload / response / cURL)
- **ดูประวัติการใช้งาน** ย้อนหลังต่อรายลูกค้า แยก UAT / Production

### Stack

| ส่วน | เทคโนโลยี |
|------|-----------|
| UI | React 18 (function components + hooks) |
| Build | Vite 5 |
| Routing | **State-based** (`useState` ใน `App.jsx`) — ไม่มี react-router |
| Styling | CSS เดี่ยว (`src/styles.css`) |
| ข้อมูล | Mock ในหน่วยความจำ (`src/data/*`) — ไม่มี backend/DB |

> ⚠️ **prototype only:** ทุกอย่างเก็บใน state ของ React — รีเฟรชหน้า = ข้อมูลที่เพิ่ม/แก้ไขหายหมด กลับไปเป็น mock ตั้งต้น

---

## 2. เริ่มต้นใช้งาน (Quick Start)

```bash
npm install      # ติดตั้ง dependencies
npm run dev      # รัน dev server → http://localhost:5173
npm run build    # build ลงโฟลเดอร์ dist/
npm run preview  # เปิดดูผลที่ build แล้ว
```

### Deploy

| ปลายทาง | วิธี |
|---------|------|
| **GitHub Pages** | อัตโนมัติผ่าน `.github/workflows/deploy.yml` เมื่อ push ขึ้น `main` (ต้องตั้ง Settings → Pages → Source = **GitHub Actions**) |
| **Vercel** | Framework = **Vite** · Build = `npm run build` · Output = `dist` |

> `vite.config.js` ใช้ `base: './'` (relative path) จึงเปิดได้ทั้ง root (Vercel) และ subpath (GitHub Pages) โดยไม่ต้องแก้ config

---

## 3. วิธีการใช้งาน (Common Tasks)

ขั้นตอนทำงานที่ใช้บ่อย — อ้างอิงปุ่ม/หน้าจริงในแอป

### 3.1 สร้างลูกค้าใหม่ + ออก API key

1. กดเมนู **"+ สร้าง Customer API"**
2. **ขั้น 1 — ข้อมูลลูกค้า:** กรอกชื่อ, อีเมล, วันเปิด/หมดอายุ, username/password dashboard → กด **ถัดไป →**
   _(ถ้าชื่อซ้ำ หรือวันหมดอายุไม่หลังวันเปิด จะมี error ใต้ช่องและไปต่อไม่ได้)_
3. **ขั้น 2 — เลือก API & สิทธิ์:** ติ๊กเลือก endpoint ที่ลูกค้าซื้อ + เลือก field ย่อย, ตั้ง rate limit / daily quota → กด **ตรวจสอบ →**
   _(ต้องเลือกอย่างน้อย 1 API ปุ่มจึงจะกดได้)_
4. **ขั้น 3 — ตรวจสอบ:** ดูสรุป แล้วกด **สร้าง & generate keys**
5. ระบบพาไปหน้า **Keys Generated** → **คัดลอก UAT + Production key เก็บทันที** (โชว์ครั้งเดียว) → กด **เสร็จสิ้น**

### 3.2 ค้นหา / กรองลูกค้า

- หน้า **รายชื่อลูกค้า** → พิมพ์ในช่องค้นหา (ชื่อ **หรือ** อีเมล)
- ใช้ dropdown สถานะกรอง (ใช้งาน / ระงับ / หมดอายุ / ยกเลิก)
- เลื่อนหน้าด้วยปุ่ม `‹` `›` (หน้าละ 8 ราย)

### 3.3 แก้ไขข้อมูล / สิทธิ์ลูกค้า

1. เลือกลูกค้าจากลิสต์ซ้าย → กด **แก้ไข**
2. แก้อีเมล / วันที่ / rate limit / สิทธิ์ (ผ่าน PermissionPicker)
3. กด **บันทึก** (หรือ **ยกเลิก** เพื่อทิ้งการแก้ไข)

### 3.4 จัดการ API key

| ต้องการ | ทำที่ | ผลลัพธ์ |
|---------|-------|---------|
| คัดลอก keyId | ปุ่ม **copy** ที่แถว key | คัดลอก keyId (ไม่ใช่ key เต็ม) |
| ออก key ใหม่ | ปุ่ม **regenerate** → ยืนยัน | key เก่าถูกแทน, พาไปหน้า Keys Generated โชว์ key เต็มใหม่ |
| ยกเลิก key | ปุ่ม **revoke** → ยืนยัน | key ใช้ไม่ได้ทันที (ขึ้นป้าย revoked) |

### 3.5 ระงับ / เปิดใช้งาน / ลบลูกค้า

- เลือกลูกค้า → ปุ่ม **ระงับ** (สลับเป็น **เปิดใช้งาน** เมื่อถูกระงับอยู่) → ยืนยันใน modal
- ปุ่ม **ลบ** (สีแดง) → ยืนยันใน modal _(prototype ลบจริง; production ควรเป็น soft delete)_

### 3.6 ดูประวัติการใช้งาน

- เมนู **ประวัติการใช้งาน** → เลือกลูกค้าจาก dropdown → สลับ env (ทั้งหมด / UAT / Production)
- ดูการ์ดสรุป, กราฟแท่งรายวัน (ชี้ที่แท่งเพื่อดูตัวเลข), และตารางรายวัน

### 3.7 ดูเอกสาร API

- เมนู **เอกสาร API** → ใช้สารบัญ (TOC) กระโดดไป endpoint ที่ต้องการ → ปุ่ม **copy** คัดลอกตัวอย่าง request/response/cURL

---

## 4. โครงสร้างการนำทาง (Navigation)

แถบเมนูบนสุด (topbar) มี 4 ปุ่ม → set ค่า `tab`. ส่วนหน้า `keys` ไม่มีปุ่มในเมนู
เพราะเข้าได้ทางเดียวคือ "หลังสร้างลูกค้า" หรือ "หลัง regenerate key" เท่านั้น

```
 ┌────────────────────────────────────────────────────────────────┐
 │ CREDEN · API Management [prototype]                              │
 │  [ รายชื่อลูกค้า ] [ + สร้าง Customer API ] [ เอกสาร API ] [ ประวัติการใช้งาน ] │
 └────────────────────────────────────────────────────────────────┘
        │                  │                  │              │
        ▼                  ▼                  ▼              ▼
      list              create              docs          usage
        │                  │
        │                  └── (กดสร้างสำเร็จ) ──┐
        │                                        ▼
        └── (regenerate key) ────────────────► keys ──(เสร็จสิ้น)──► list
```

| ปุ่มเมนู | `tab` | หน้า |
|---------|-------|------|
| รายชื่อลูกค้า | `list` | [CustomerList](#5-หน้า-รายชื่อลูกค้า-customer-list) |
| + สร้าง Customer API | `create` | [CreateCustomer](#6-หน้า-สร้าง-customer-api-create) |
| เอกสาร API | `docs` | [ApiDocs](#8-หน้า-เอกสาร-api-api-docs) |
| ประวัติการใช้งาน | `usage` | [UsageHistory](#9-หน้า-ประวัติการใช้งาน-usage-history) |
| _(ไม่มีในเมนู)_ | `keys` | [KeysGenerated](#7-หน้า-keys-ที่สร้าง-keys-generated) |

---

## 5. หน้า: รายชื่อลูกค้า (Customer List)

**ไฟล์:** `src/pages/CustomerList.jsx` · **เข้าผ่าน:** เมนู "รายชื่อลูกค้า" (หน้าแรก default)

### หน้านี้คืออะไร
หน้าหลักสำหรับ **ดูและจัดการลูกค้าทั้งหมด** เป็น layout 2 ฝั่ง — ซ้ายคือลิสต์ + ค้นหา/กรอง ขวาคือรายละเอียดของลูกค้าที่เลือก

```
 ┌──────────────────────┬────────────────────────────────────────────┐
 │ [ค้นหาชื่อ/อีเมล…]    │  Acme Co., Ltd.   [ใช้งาน]                  │
 │ [ทุกสถานะ ▾]         │  ops@acme.com · dashboard: acme            │
 │ ──────────────────── │                  [แก้ไข] [ระงับ] [ลบ]      │
 │ • Acme Co.    [ใช้งาน]│ ────────────────────────────────────────── │
 │ • Globex      [ใช้งาน]│  วันเปิดใช้งาน | วันหมดอายุ | สร้าง | แก้ไข   │
 │ • ...        เหลือ 12 วัน│ ────────────────────────────────────────── │
 │                      │  ▸ API Keys      (mask + copy/regen/revoke) │
 │ ‹ 1/3 › · 21 ราย     │  ▸ Usage / Quota (แถบโควต้า)                 │
 │ (ฝั่งซ้าย = list)     │  ▸ สิทธิ์การใช้งาน (field-level)             │
 └──────────────────────┴────────────────────────────────────────────┘
```

### ฝั่งซ้าย — ลิสต์ & ตัวกรอง

| องค์ประกอบ | ทำอะไร |
|-----------|--------|
| ช่องค้นหา | กรองตามชื่อลูกค้า **หรือ** อีเมล (ไม่สนตัวพิมพ์ใหญ่เล็ก) · พิมพ์แล้วรีเซ็ตไปหน้า 1 |
| dropdown สถานะ | กรองตามสถานะ: ทุกสถานะ / ใช้งาน / ระงับชั่วคราว / หมดอายุ / ยกเลิก |
| รายการลูกค้า | กดเพื่อเลือก → แสดงรายละเอียดฝั่งขวา · มี [Badge](#badge) สถานะ |
| ป้าย "เหลือ N วัน" | โชว์อัตโนมัติเมื่อใกล้หมดอายุ (≤ 30 วัน และยังไม่ expired) |
| ปุ่ม `‹` `›` | เปลี่ยนหน้า (หน้าละ **8 ราย** — ค่า `PAGE_SIZE`) |

### ฝั่งขวา — รายละเอียด (โหมดดู)

ปุ่มหัวเรื่อง:

| ปุ่ม | สี | ทำอะไร | ยืนยันก่อนไหม |
|------|----|--------|--------------|
| **แก้ไข** | ฟ้า | สลับเข้าโหมดแก้ไข (ดูด้านล่าง) | — |
| **ระงับ / เปิดใช้งาน** | เทา | สลับสถานะ `active` ⇄ `suspended` | ✅ มี modal |
| **ลบ** | แดง | ลบลูกค้าออกจากลิสต์ | ✅ มี modal (ข้อความระบุว่าจริง ๆ ควรเป็น soft delete) |

บล็อก **API Keys** — แต่ละ key แสดงแบบ mask (`ak_live_xxxx••••••••9f3a`) พร้อมปุ่ม:

| ปุ่ม | ทำอะไร |
|------|--------|
| **copy** | คัดลอก `keyId` ลง clipboard (ไม่ใช่ key เต็ม — key เต็มดูได้ครั้งเดียวตอนสร้าง) |
| **regenerate** | ออก key ใหม่ของ environment นั้น แทนที่ตัวเก่า → เด้งไปหน้า [Keys Generated](#7-หน้า-keys-ที่สร้าง-keys-generated) เพื่อโชว์ key เต็ม · ✅ มี modal |
| **revoke** | ยกเลิก key (set `revokedDtm`) ใช้งานไม่ได้ทันที · ซ่อนถ้า key ถูก revoke ไปแล้ว · ✅ มี modal |

บล็อก **Usage / Quota** — ใช้ [UsagePanel](#usagepanel) แสดงโควต้าวันนี้ + rate limit + ยอดสะสม
บล็อก **สิทธิ์การใช้งาน** — สรุปว่าซื้อ API ไหน ✓/✗ และ field ย่อยที่เลือก

### ฝั่งขวา — โหมดแก้ไข
กด **แก้ไข** แล้วฟอร์มจะถูก prefill จากค่าปัจจุบัน (clone ออกมาเป็น `draft` ไม่แตะของจริงจนกด "บันทึก")

แก้ได้: อีเมลติดต่อ · วันเปิดใช้งาน · วันหมดอายุ · rate limit (rpm) · daily quota · และสิทธิ์ทั้งหมดผ่าน [PermissionPicker](#permissionpicker)

| ปุ่ม | ทำอะไร |
|------|--------|
| **ยกเลิก** | ทิ้ง draft ออกจากโหมดแก้ไข (ไม่บันทึก) |
| **บันทึก** | เรียก `updateCustomer` พร้อม set `updatedDtm` เป็นเวลาปัจจุบัน → toast "บันทึกการแก้ไขแล้ว" |

### Flow การจัดการ key

```
 [regenerate ENV]
        │
        ▼
 ┌─────────────────────────┐  ยกเลิก
 │  ConfirmModal "Regen?"   ├──────────► ปิด (ไม่ทำอะไร)
 └───────────┬─────────────┘
        ยืนยัน│
             ▼
   generateApiKey(env)  ─► updateCustomer (แทน key เดิมของ env นั้น)
             │
             ▼
   showKeys(customer, [keyใหม่])  ─► ไปหน้า KeysGenerated (โชว์ key เต็มครั้งเดียว)
```

---

## 6. หน้า: สร้าง Customer API (Create)

**ไฟล์:** `src/pages/CreateCustomer.jsx` · **เข้าผ่าน:** เมนู "+ สร้าง Customer API"

### หน้านี้คืออะไร
Wizard **3 ขั้นตอน** สำหรับสร้างลูกค้าใหม่ มีแถบ stepper บอกความคืบหน้าด้านบน

```
   ① ข้อมูลลูกค้า ──► ② เลือก API & สิทธิ์ ──► ③ ตรวจสอบ ──► [สร้าง & generate keys]
                                                                      │
                                                                      ▼
                                                              KeysGenerated
```

### ขั้น 1 — ข้อมูลลูกค้า
ฟอร์ม (ทุกช่อง * จำเป็น): ชื่อลูกค้า · อีเมล · วันเปิดใช้งาน · วันหมดอายุ · username dashboard · password dashboard

**Validation ก่อนไปขั้น 2** (ปุ่ม "ถัดไป →"):
- ชื่อ/อีเมล/วันที่/user/pass ต้องไม่ว่าง
- ชื่อลูกค้า **ห้ามซ้ำ** กับที่มีอยู่ (เทียบแบบ case-insensitive)
- วันหมดอายุต้อง **หลัง** วันเปิดใช้งาน
- ถ้าผิด → แสดง error ใต้ช่องนั้น ไม่ให้ไปต่อ

> 💡 password มี hint ว่า "จะถูก hash (bcrypt) ฝั่ง backend" — ใน prototype ไม่ได้เก็บ password เลย (เก็บแค่ username)

### ขั้น 2 — เลือก API & สิทธิ์
ใช้ [PermissionPicker](#permissionpicker) เลือก endpoint และ field ย่อยที่ลูกค้าซื้อ + ตั้ง rate limit / daily quota

- ปุ่ม "ตรวจสอบ →" จะ **disabled** จนกว่าจะเลือกอย่างน้อย 1 API (มี banner เตือน "ต้องเลือกอย่างน้อย 1 API")
- ปุ่ม "← ย้อนกลับ" กลับไปขั้น 1

### ขั้น 3 — ตรวจสอบก่อนสร้าง
สรุปทุกอย่างให้ดูก่อน: ชื่อ · อีเมล · ช่วงสัญญา · dashboard user · rate limit · รายการ API ที่ซื้อ (เฉพาะที่เปิด)

| ปุ่ม | ทำอะไร |
|------|--------|
| **← ย้อนกลับ** | กลับไปขั้น 2 |
| **สร้าง & generate keys** | สร้างลูกค้า + generate **UAT key และ Production key พร้อมกัน** → เด้งไปหน้า [Keys Generated](#7-หน้า-keys-ที่สร้าง-keys-generated) |

> สถานะลูกค้าใหม่ = `active`, usage เริ่มที่ 0 · key ที่เก็บลง store จะถูก **strip ค่า `fullKey` ออก** (เลียนแบบ production ที่เก็บแค่ hash) — `fullKey` ส่งไปโชว์หน้า KeysGenerated เท่านั้น

---

## 7. หน้า: Keys ที่สร้าง (Keys Generated)

**ไฟล์:** `src/pages/KeysGenerated.jsx` · **เข้าผ่าน:** หลังสร้างลูกค้า หรือหลัง regenerate key (ไม่มีในเมนู)

### หน้านี้คืออะไร
หน้าแสดง **API key เต็ม** ที่เพิ่ง generate — เป็นจุดเดียวที่เห็น key เต็มได้ **ครั้งเดียว**
(production จริงจะเก็บแค่ SHA-256 hash + last4) พร้อมตัวอย่างการนำไปใช้

### มีอะไรบ้าง

| ส่วน | รายละเอียด |
|------|-----------|
| การ์ด key | แต่ละ environment (prod/uat) โชว์ key เต็ม + ปุ่ม **copy** + keyId/last4 |
| แบนเนอร์เตือน | ⚠ ย้ำว่า key เต็มจะไม่แสดงอีก |
| วิธีแนบ key ใน header | ตัวอย่าง cURL ที่ใส่ `X-API-Key` จริง (เลือก endpoint ตามสิทธิ์ที่ซื้อ) + ปุ่ม copy |
| Request / Response ตัวอย่าง | payload + response (envelope `data` / `meta` / `error`) เลือก endpoint ตัวอย่างจากกลุ่มแรกที่ลูกค้าซื้อ |
| Endpoint ที่เรียกได้ | ลิสต์ทุก endpoint ที่ลูกค้ารายนี้มีสิทธิ์ (ดึงจาก `permissions`) |

| ปุ่ม | ทำอะไร |
|------|--------|
| **copy** (การ์ด/code block) | คัดลอกข้อความนั้นลง clipboard → toast |
| **เสร็จสิ้น → ไปหน้า List** | ล้าง `keysView` แล้วกลับไปหน้า `list` |

---

## 8. หน้า: เอกสาร API (API Docs)

**ไฟล์:** `src/pages/ApiDocs.jsx` · **เข้าผ่าน:** เมนู "เอกสาร API"

### หน้านี้คืออะไร
**เอกสารอ้างอิงแบบ static** ของทุก endpoint ที่ CREDEN ให้บริการ — generate จาก `API_CATALOG`
ไม่ขึ้นกับลูกค้าคนใด ทุก endpoint เป็น `POST` และต้องแนบ `X-API-Key`

### มีอะไรบ้าง
- หัวข้อแสดง base URL ทั้ง prod (`https://api.creden.co/v1`) และ uat (`https://uat.api.creden.co/v1`)
- **สารบัญ (TOC)** — ลิงก์ anchor ไปแต่ละ endpoint
- การ์ดต่อ endpoint: method + path · คำอธิบาย · payload/returns · field/ตัวเลือกที่มี · ตัวอย่าง Request/Response · cURL
- ปุ่ม **copy** ทุก code block → toast

> เนื้อหาทั้งหมดมาจาก `src/data/apiCatalog.js` + ฟังก์ชัน `sampleRequest`/`sampleResponse` ในไฟล์นี้ — แก้ที่ต้นทางแล้วหน้าจะอัปเดตตาม

---

## 9. หน้า: ประวัติการใช้งาน (Usage History)

**ไฟล์:** `src/pages/UsageHistory.jsx` · **ข้อมูล:** `src/data/mockUsageHistory.js` · **เข้าผ่าน:** เมนู "ประวัติการใช้งาน"

### หน้านี้คืออะไร
แดชบอร์ดดูปริมาณการเรียก API **ย้อนหลัง 14 วัน** ต่อรายลูกค้า แยก UAT / Production

```
 ┌──────────────────────────────────────────────────────────────┐
 │ ประวัติการใช้งาน API      ลูกค้า: [Acme ▾]  [ทั้งหมด|UAT|Production] │
 │ ──────────────────────────────────────────────────────────── │
 │  ┌── UAT ──────────┐  ┌── Production ──────┐   (การ์ดสรุป/env) │
 │  │ 4,820 เรียก      │  │ 41,300 เรียก       │                  │
 │  │ err% · latency · │  │ err% · latency ·   │                  │
 │  │ peak · ล่าสุด     │  │ peak · ล่าสุด       │                  │
 │  └─────────────────┘  └────────────────────┘                  │
 │                                                                │
 │  การเรียกรายวัน (กราฟแท่ง prod+uat ต่อวัน) ▒▒█ ▒█ ▒▒█ ...        │
 │                                                                │
 │  ตารางรายวัน: วันที่ | env | เรียก | สำเร็จ | error | err% | latency | top endpoint │
 └──────────────────────────────────────────────────────────────┘
```

### ตัวควบคุม

| องค์ประกอบ | ทำอะไร |
|-----------|--------|
| dropdown ลูกค้า | เลือกลูกค้าที่จะดู |
| ปุ่มแบ่งส่วน (segmented) | กรอง env ที่แสดง: ทั้งหมด / UAT / Production (มีผลทั้งการ์ดสรุป กราฟ และตาราง) |

### สิ่งที่แสดง
- **การ์ดสรุปต่อ env** — ยอดเรียกรวม, error rate (เป็น warn ถ้า ≥ 3%), latency เฉลี่ย, peak/วัน, ใช้งานล่าสุด
- **กราฟแท่งรายวัน** — เลื่อนชี้ที่แท่ง (`title`) เพื่อดูจำนวนเรียกของวันนั้น
- **ตารางรายวัน** — เรียงวันล่าสุดบนสุด, error % ที่ ≥ 3% จะถูก highlight

> 📊 ข้อมูลเป็น **mock แบบ deterministic** (seeded PRNG จากชื่อลูกค้า) — ค่าเดิมทุกครั้งที่เปิด
> ลูกค้าที่ `suspended`/`expired` กราฟช่วงท้ายจะ decay ลงเหลือ 0 · วันอ้างอิง = `2026-06-26`

---

## 10. แค็ตตาล็อก API & ระบบสิทธิ์

**ไฟล์:** `src/data/apiCatalog.js` — single source ของรายการ API ทั้งหมด
อ้างอิงจาก model จริง `API_Management_Model.xlsx` (2 เส้น: SEARCH API + DATA API แยก 8 กลุ่ม A–H)

| key | กลุ่ม | ชื่อ | payload | สิทธิ์เป็นแบบ |
|-----|------|------|---------|--------------|
| `searching` | SEARCH | Search API (ค้นชื่อ/เลขทะเบียน → เลขนิติ) | ชื่อ ≥3 ตัวอักษร / เลขทะเบียน | **options** (company / person) |
| `general` | A | ข้อมูลทั่วไป (General Info) | เลขนิติบุคคล 13 หลัก | **fields** (15) |
| `business` | B | ข้อมูลธุรกิจ (Business Info) | เลขนิติบุคคล 13 หลัก | **fields** (8) |
| `trade_credit` | C | เครดิตทางการค้า (Trade Credit) | เลขนิติบุคคล 13 หลัก | **fields** (4) |
| `ranking` | D | อันดับธุรกิจ (Business Ranking) | เลขนิติบุคคล 13 หลัก | **fields** (3) |
| `cash_cycle` | E | วงจรเงินสด (Cash Cycle) | เลขนิติบุคคล 13 หลัก | **fields** (1) |
| `directors` | F | กรรมการ / ผู้ถือหุ้น (Directors & Shareholders) | เลขนิติบุคคล 13 หลัก | **fields** (10) |
| `history` | G | ประวัติการเปลี่ยนแปลง (Change History) | เลขนิติบุคคล 13 หลัก | **fields** (3) |
| `financial` | H | ตัวเลขทางการเงิน (Financial Data) | เลขนิติบุคคล 13 หลัก | **fields** (56) |

### สิทธิ์มี 2 รูปแบบ (field-level ทั้งหมด)

1. **options** — `searching` เลือกโหมดค้นหา (`company` / `person`) → value = array ของ key ที่เลือก
2. **fields** — กลุ่ม A–H เลือก field ย่อยที่ลูกค้าซื้อ → value = array ของชื่อ field (ไทย) ที่เลือก

> array ว่าง = ไม่ได้ซื้อกลุ่มนั้น · เปิดเมื่อ `length > 0`
> สิทธิ์เหล่านี้ในระบบจริงจะถูกบังคับที่ **API gateway** ตอนลูกค้ายิง API (prototype แค่เก็บค่า)

### Package presets (อ้างอิง — ยังไม่ผูก UI)

`PACKAGES` ใน `apiCatalog.js` เก็บ mapping tier → กลุ่มที่เข้าถึงได้: **STARTER** (A,B) · **PROFESSIONAL** (A–F) · **ENTERPRISE** (A–H) · **PAY-PER-CALL** (A–H)

---

## 11. Schema ข้อมูล (Data Schema)

โครงสร้างข้อมูลทั้งหมดที่ใช้ในแอป — ช่วยให้ฝั่ง backend ออกแบบ API/DB ให้ตรงกัน

### 11.1 Customer — `src/data/mockCustomers.js`

อ็อบเจ็กต์ลูกค้า 1 ราย:

| field | type | คำอธิบาย |
|-------|------|----------|
| `_id` | string | id ภายใน เช่น `cus_a1b2c3d4` |
| `customer_name` | string | ชื่อลูกค้า (ห้ามซ้ำ) |
| `contact_email` | string | อีเมลติดต่อ |
| `status` | enum | `active` \| `suspended` \| `expired` \| `revoked` |
| `apiKeys` | ApiKey[] | รายการ key (โดยปกติมี production + uat) — ดู [11.2](#112-apikey) |
| `permissions` | Permissions | สิทธิ์ระดับ field (searching + กลุ่ม A–H) — ดู [11.3](#113-permissions) |
| `rateLimit` | RateLimit | `{ rpm, dailyQuota }` |
| `usage` | Usage | ตัวเลขการใช้งานปัจจุบัน — ดู [11.5](#115-usage) |
| `active_date` | ISO string | วันเริ่มสัญญา |
| `createDtm` | ISO string | วันสร้างเรคคอร์ด |
| `expire_date` | ISO string | วันหมดอายุสัญญา |
| `dashboard` | object | `{ username }` (password เก็บฝั่ง backend แบบ hash) |
| `createdBy` | string | ผู้สร้าง (mock = `admin_user`) |
| `updatedDtm` | ISO string | แก้ไขล่าสุด |

### 11.2 ApiKey

| field | type | คำอธิบาย | โชว์ได้ไหม |
|-------|------|----------|-----------|
| `keyId` | string | id ย่อ เช่น `ak_live_8f3a` | ✅ |
| `last4` | string | 4 ตัวท้ายของ key | ✅ |
| `fullKey` | string | **key เต็ม** — มีเฉพาะตอนเพิ่ง generate (ไม่เก็บลง store) | ⚠ ครั้งเดียว |
| `hashedKey` | string | mock `sha256:...` (production เก็บแค่ตัวนี้) | ❌ |
| `environment` | enum | `production` \| `uat` | ✅ |
| `baseUrl` | string | base URL ตาม env | ✅ |
| `label` | string | เช่น `prod-primary` / `uat-primary` | ✅ |
| `createdDtm` | ISO string | วันออก key | ✅ |
| `revokedDtm` | ISO string \| null | เวลาที่ถูก revoke (null = ยังใช้ได้) | ✅ |

> prefix: production = `ak_live_*`, uat = `ak_test_*`

### 11.3 Permissions

key ตรงกับ `API_CATALOG` — ชนิดของ value ขึ้นกับรูปแบบสิทธิ์ (ดู [หัวข้อ 10](#10-แค็ตตาล็อก-api--ระบบสิทธิ์))

```js
permissions: {
  searching:    ['company'],                          // options (company / person)
  general:      ['ชื่อนิติบุคคล ภาษาไทย', ...],          // A · fields
  business:     ['ทุนจดทะเบียนปัจจุบัน (บาท)', ...],     // B · fields
  trade_credit: ['คะแนนทางการเงิน (คะแนน)', ...],       // C · fields
  ranking:      ['อันดับระดับประเทศ', ...],             // D · fields
  cash_cycle:   ['วงจรเงินสด'],                         // E · fields
  directors:    ['กรรมการ', 'ผู้ถือหุ้น', ...],          // F · fields
  history:      [],                                    // G · fields (ว่าง = ไม่ได้ซื้อ)
  financial:    ['ปีงบการเงิน', 'รวมสินทรัพย์', ...],     // H · fields
}
```

| ค่า | หมายความว่า |
|-----|-------------|
| `[]` (array ว่าง) | ไม่ได้ซื้อกลุ่มนั้น |
| `['x','y']` (array มีสมาชิก) | ซื้อเฉพาะ option/field ที่ระบุ |

### 11.4 RateLimit

| field | type | คำอธิบาย |
|-------|------|----------|
| `rpm` | number | จำนวน request ต่อนาทีสูงสุด |
| `dailyQuota` | number | จำนวน request ต่อวันสูงสุด |

### 11.5 Usage (ค่าปัจจุบัน)

| field | type | คำอธิบาย |
|-------|------|----------|
| `calledToday` | number | เรียกไปแล้ววันนี้ (ใช้คำนวณแถบโควต้า) |
| `calledTotal` | number | เรียกสะสมทั้งหมด |
| `lastCalledDtm` | ISO string \| null | เวลาเรียกล่าสุด |

### 11.6 UsageHistory Row — `src/data/mockUsageHistory.js`

แถวสถิติรายวันต่อ environment (สร้าง 14 แถว/ env แบบ seeded):

| field | type | คำอธิบาย |
|-------|------|----------|
| `date` | string `YYYY-MM-DD` | วันที่ |
| `env` | enum | `production` \| `uat` |
| `calls` | number | เรียกทั้งหมดวันนั้น |
| `success` | number | สำเร็จ (= calls − errors) |
| `errors` | number | error |
| `latency` | number | latency เฉลี่ย (ms) |
| `topEndpoint` | string | endpoint ที่ถูกเรียกมากสุด (สุ่มจากสิทธิ์ที่ซื้อ) |

ตัว `buildUsageHistory(customer)` คืน `{ days, uat, production }` โดยแต่ละ env มี `{ rows, summary }`
ส่วน `summary` = `{ calls, errors, errorRate, latencyAvg, peak, lastActive }`

### 11.7 ตัวอย่างเต็ม (อ้างอิง)

```js
{
  _id: 'cus_a1b2c3d4',
  customer_name: 'Acme Co., Ltd.',
  contact_email: 'ops@acme.com',
  status: 'active',
  apiKeys: [
    { keyId: 'ak_live_8f3a', last4: '9f3a', environment: 'production',
      baseUrl: 'https://api.creden.co/v1', label: 'prod-primary',
      createdDtm: '2025-01-15T03:00:00Z', revokedDtm: null },
    { keyId: 'ak_test_2c10', last4: '4d21', environment: 'uat',
      baseUrl: 'https://uat.api.creden.co/v1', label: 'uat-primary',
      createdDtm: '2025-01-15T03:00:00Z', revokedDtm: null },
  ],
  permissions: {
    searching: ['company'],
    general: ['ชื่อนิติบุคคล ภาษาไทย', 'เลขทะเบียนนิติบุคคล', 'สถานภาพกิจการ', 'ที่อยู่'],
    business: ['ทุนจดทะเบียนปัจจุบัน (บาท)', 'ขนาดธุรกิจ', 'กลุ่มธุรกิจ (TSIC)'],
    trade_credit: ['เครดิตเทอมที่เหมาะสม (วัน)', 'วงเงินเครดิตที่เหมาะสม (บาท)', 'คะแนนทางการเงิน (คะแนน)'],
    ranking: ['อันดับระดับประเทศ'], cash_cycle: ['วงจรเงินสด'],
    directors: ['กรรมการ', 'ผู้ถือหุ้น', 'สัดส่วนการถือหุ้น (%)'], history: [],
    financial: ['ปีงบการเงิน', 'รวมสินทรัพย์', 'รายได้รวม', 'กำไร (ขาดทุน) สุทธิ', 'ROA (%)', 'ROE (%)'],
  },
  rateLimit: { rpm: 60, dailyQuota: 10000 },
  usage: { calledToday: 3240, calledTotal: 184320, lastCalledDtm: '2026-06-26T08:12:00Z' },
  active_date: '2025-01-20T00:00:00Z',
  createDtm: '2025-01-15T03:00:00Z',
  expire_date: '2026-07-20T00:00:00Z',
  dashboard: { username: 'acme' },
  createdBy: 'admin_user',
  updatedDtm: '2026-06-01T00:00:00Z',
}
```

### ความหมายของ `status`

| status | ความหมาย | สี (Badge) |
|--------|----------|-----------|
| `active` | ใช้งานปกติ | เขียว |
| `suspended` | ระงับชั่วคราว (บล็อกการเรียก API) | ส้ม |
| `expired` | หมดอายุสัญญา | เทา |
| `revoked` | ยกเลิก | แดง |

---

## 12. สถาปัตยกรรม & การไหลของข้อมูล

`App.jsx` เป็น **single source of truth** — ถือ state กลาง 3 ตัว และส่ง callback ลงไปให้แต่ละหน้า:

| State | ชนิด | หน้าที่ |
|-------|------|---------|
| `tab` | string | หน้าที่กำลังแสดง: `list` \| `create` \| `docs` \| `usage` \| `keys` |
| `customers` | array | รายชื่อลูกค้าทั้งหมด (เริ่มจาก `mockCustomers`) |
| `keysView` | object \| null | ข้อมูล key เต็มที่จะโชว์ในหน้า Keys Generated `{ customer, keys }` |

```
                         ┌─────────────────────────────────────────┐
                         │                App.jsx                    │
                         │  state: tab · customers · keysView        │
                         │  fn: createCustomer · updateCustomer ·    │
                         │      deleteCustomer · showKeys            │
                         └─────────────────────────────────────────┘
                              │ props (data ↓) / callbacks (event ↑)
        ┌──────────────┬──────┴───────┬──────────────┬──────────────┐
        ▼              ▼              ▼              ▼              ▼
   CustomerList   CreateCustomer  KeysGenerated   ApiDocs      UsageHistory
   (list)         (create)        (keys)          (docs)       (usage)
        │              │              ▲
        │              │              │ showKeys(customer, fullKeys)
        └──────────────┴──────────────┘
              ออก key ใหม่ → เด้งไปหน้า keys เพื่อโชว์ key เต็ม "ครั้งเดียว"
```

**หลักการสำคัญ:** หน้าลูกย่อยไม่ได้แก้ข้อมูลเอง — มันเรียก callback ที่ได้รับมาจาก `App.jsx`
แล้ว `App.jsx` เป็นคนอัปเดต `customers` ทำให้ทุกหน้าเห็นข้อมูลตรงกันเสมอ

### Callback ที่ App ส่งลงไป

| ฟังก์ชัน | ทำอะไร |
|----------|--------|
| `createCustomer(customer)` | เพิ่มลูกค้าใหม่ไว้บนสุดของลิสต์ |
| `updateCustomer(id, patch)` | merge ข้อมูลบางส่วนเข้าลูกค้าที่ระบุ (ใช้กับแก้ไข/ระงับ/regenerate/revoke) |
| `deleteCustomer(id)` | ลบลูกค้าออกจากลิสต์ |
| `showKeys(customer, keys)` | สลับไปหน้า `keys` พร้อมส่ง key เต็มไปแสดง |

---

## 13. Component & Utility อ้างอิง

### Components (`src/components/`)

#### Badge
ป้ายสถานะลูกค้า — แปลง `status` เป็นป้ายสี+ข้อความตาม `STATUS_META`

#### PermissionPicker
ตัวเลือกสิทธิ์ field-level ใช้ร่วมกันทั้งหน้า Create และ Edit รับ `permissions`, callback `onChange(permissions)`
- ติ๊กหัวข้อ = เปิด/ปิดทั้งกลุ่ม (เปิดครั้งแรก default เลือกทุก field / option แรก)
- ติ๊ก chip ย่อย = เลือก field/option รายตัวในกลุ่ม A–H

#### UsagePanel
แถบโควต้ารายวัน + rate limit + ยอดสะสม — สีแถบเปลี่ยนตาม % การใช้ (เขียว < 70% · ส้ม ≥ 70% · แดง ≥ 90%)

#### ConfirmModal
modal ยืนยันแบบ reusable — ปิดได้ด้วยคลิกพื้นหลัง/ยกเลิก · ปุ่มยืนยันเป็นสีแดงเมื่อ `danger=true`
ใช้กับทุก action ที่อันตราย (ระงับ/ลบ/regenerate/revoke)

### Utilities (`src/utils.js`)

| ฟังก์ชัน | ทำอะไร |
|----------|--------|
| `generateApiKey(env)` | สร้าง mock key (`ak_live_*`/`ak_test_*`) พร้อม fullKey/hash/last4/baseUrl |
| `maskKey(k)` | แปลงเป็นรูป mask `keyId••••••••last4` |
| `fmtDate(iso)` | format วันที่เป็นไทย (พ.ศ.) |
| `daysUntil(iso)` | จำนวนวันคงเหลือถึงวันที่ระบุ (ใช้กับป้ายเตือนหมดอายุ) |
| `uid()` | สร้าง id ลูกค้า `cus_xxxxxxxx` |
| `copyText(text)` | คัดลอกลง clipboard |

---

## 14. ข้อจำกัดของ Prototype & สิ่งที่ต้องทำต่อ

ส่วนนี้ช่วยทีมแยกว่าอะไรคือ "งานที่เหลือ" เมื่อจะทำของจริง:

| ด้าน | สถานะปัจจุบัน (prototype) | สิ่งที่ต้องทำต่อ |
|------|--------------------------|----------------|
| ข้อมูล | เก็บใน React state — รีเฟรชแล้วหาย | ต่อ backend + DB จริง |
| API key | generate ฝั่ง client, โชว์ fullKey | ออก/hash key ฝั่ง server (SHA-256), ไม่ส่ง fullKey กลับมา |
| Auth | ไม่มี login | ระบบ login + สิทธิ์ admin |
| การบังคับสิทธิ์ | เก็บค่าเฉย ๆ | บังคับจริงที่ API gateway |
| Usage data | mock seeded 14 วัน | ดึงจาก usage-log / time-series store จริง |
| ลบลูกค้า | ลบออกจาก array จริง | ทำเป็น soft delete + เก็บ audit |
| password dashboard | ไม่ได้เก็บ | hash (bcrypt) ฝั่ง backend |

---

_เอกสารนี้สรุปจากซอร์สโค้ด ณ ปัจจุบัน — เมื่อแก้พฤติกรรมหน้าใด กรุณาอัปเดตหัวข้อที่เกี่ยวข้องด้วย_
