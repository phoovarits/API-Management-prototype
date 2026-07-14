# CREDEN Data API — FastAPI POC

POC พิสูจน์ comment ④ ("ลองลง FastAPI — มัน build Swagger ให้เลย") และโชว์ pattern ของ
**API Gateway** ในขั้น 4–5 ของ journey: แนบ key → เช็ค permission/quota → คืนข้อมูล

## รัน

```bash
cd backend
python -m venv .venv && source .venv/Scripts/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

เปิด:
- **Swagger UI (auto)** → http://127.0.0.1:8000/docs
- **ReDoc** → http://127.0.0.1:8000/redoc
- **OpenAPI JSON** → http://127.0.0.1:8000/openapi.json

> นี่คือจุดที่ comment พูดถึง — ไม่ต้องเขียน API docs มือ FastAPI gen ให้จาก type hints/Pydantic

## ลองยิง (mock key)

ทุก request แนบ header `X-API-Key`. มี 2 key ใน `CONTRACTS`:

| key | env | quota/วัน | สิทธิ์ |
|-----|-----|-----------|--------|
| `ak_live_demo_8f3a` | production | 1000 | searching, general, financial (≤3 ปี) |
| `ak_test_demo_0001` | uat | 100 | เหมือนกัน |

```bash
# 1) ค้นชื่อ → ได้เลขนิติ
curl -X POST http://127.0.0.1:8000/v1/searching \
  -H "X-API-Key: ak_live_demo_8f3a" -H "Content-Type: application/json" \
  -d '{"query":"เอคมี"}'

# 2) เอาเลขนิติไปขอข้อมูลทั่วไป
curl -X POST http://127.0.0.1:8000/v1/general \
  -H "X-API-Key: ak_live_demo_8f3a" -H "Content-Type: application/json" \
  -d '{"juristic_id":"0105550000001"}'

# 3) งบการเงิน — ขอ 5 ปี แต่ contract ซื้อ 3 → ตอบ 403 (permission cap)
curl -X POST http://127.0.0.1:8000/v1/financial \
  -H "X-API-Key: ak_live_demo_8f3a" -H "Content-Type: application/json" \
  -d '{"juristic_id":"0105550000001","years":5}'
```

## สิ่งที่ POC โชว์ (map กับ Gaps & Plan)

- ✅ header `X-API-Key` มาตรฐาน (ข้อ 11.5)
- ✅ permission บังคับที่ gateway ระดับ endpoint + field (ข้อ 3)
- ✅ Financial `maxYears` เป็น permission cap ไม่ใช่แค่ param (ข้อ 11.3)
- ✅ envelope `{data, error}` มาตรฐาน (ข้อ 11.5)
- ✅ status/expiry/quota check + นับ usage (ข้อ 4, 6)
- ✅ Swagger auto (ข้อ 10)

## ของจริงต้องเพิ่ม (ยังไม่อยู่ใน POC)

- เก็บ contract/usage ใน DB จริง (ตอนนี้ in-memory)
- **hash key (sha256)** — POC เก็บ plaintext เพื่อ demo
- rate limiter จริง (Redis) — ตอนนี้นับ counter ในหน่วยความจำ
- auth ฝั่ง admin/dashboard, audit log, versioning ที่สมบูรณ์
