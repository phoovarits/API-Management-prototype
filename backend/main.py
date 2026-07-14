"""
CREDEN Data API — FastAPI POC
=============================

โปรไฟล์ proof-of-concept ของ "API Gateway" ตาม journey ข้อ 4–5:
  - แนบ key ผ่าน header `X-API-Key`
  - gateway เช็ค: key valid → status/expiry → permission (endpoint + field) → quota → log
  - FastAPI สร้าง Swagger ให้อัตโนมัติที่ /docs (และ ReDoc ที่ /redoc)

รัน:
    pip install -r requirements.txt
    uvicorn main:app --reload
    เปิด http://127.0.0.1:8000/docs

หมายเหตุ: ข้อมูลทั้งหมดเป็น mock ในหน่วยความจำ — เป็นโครงให้เห็น pattern เท่านั้น
ของจริงต้องต่อ DB (เก็บ contract/usage_log) + hash key + rate limiter ภายนอก
"""
from __future__ import annotations

from datetime import date, datetime
from enum import Enum
from typing import Annotated, Optional, Union

from fastapi import Depends, FastAPI, Header, HTTPException, status
from pydantic import BaseModel, Field

app = FastAPI(
    title="CREDEN Data API",
    version="0.1.0-poc",
    description=(
        "POC ของ API ข้อมูลนิติบุคคล CREDEN — แนบ key ผ่าน header `X-API-Key`.\n\n"
        "ทุก endpoint บังคับ permission ตาม **contract** ของลูกค้า "
        "(สิ่งที่ซื้อในขั้น 'เลือกข้อมูล' ของ journey)."
    ),
)


# ---------------------------------------------------------------------------
# Mock store — ของจริงคือ collection `contracts` ใน DB (ดู schema ใน Gaps & Plan)
# ---------------------------------------------------------------------------
class Permission(str, Enum):
    searching = "searching"
    general = "general"
    shareholder = "shareholder"
    director = "director"
    financial = "financial"
    procurement = "procurement"
    vat = "vat"


# key เต็มไม่เก็บดิบในของจริง (เก็บ sha256) — POC เก็บ plaintext เพื่อ demo เท่านั้น
CONTRACTS: dict[str, dict] = {
    "ak_live_demo_8f3a": {
        "customer_name": "Acme Co.",
        "environment": "production",
        "status": "active",
        "expire_date": date(2027, 12, 31),
        "permissions": {Permission.searching, Permission.general, Permission.financial},
        "financial_max_years": 3,  # ปีสูงสุดที่ซื้อไว้ (permission cap, ไม่ใช่แค่ param)
        "daily_quota": 1000,
        "called_today": 0,
    },
    "ak_test_demo_0001": {
        "customer_name": "Acme Co.",
        "environment": "uat",
        "status": "active",
        "expire_date": date(2027, 12, 31),
        "permissions": {Permission.searching, Permission.general, Permission.financial},
        "financial_max_years": 3,
        "daily_quota": 100,
        "called_today": 0,
    },
}

# mock data ของบริษัทตัวอย่าง — key = เลขนิติบุคคล
COMPANIES: dict[str, dict] = {
    "0105550000001": {
        "name_th": "บริษัท เอคมี จำกัด",
        "name_en": "Acme Company Limited",
        "juristic_id": "0105550000001",
        "registered_date": "2007-05-14",
        "status": "ดำเนินกิจการอยู่",
        "business_type": "การพัฒนาซอฟต์แวร์",
        "registered_capital": 5_000_000,
        "financials": [
            {"year": 2566, "total_assets": 42_000_000, "total_revenue": 31_500_000, "net_profit": 4_200_000},
            {"year": 2565, "total_assets": 38_000_000, "total_revenue": 28_000_000, "net_profit": 3_100_000},
            {"year": 2564, "total_assets": 35_000_000, "total_revenue": 25_500_000, "net_profit": 2_400_000},
        ],
    }
}
NAME_INDEX = {"เอคมี": "0105550000001", "acme": "0105550000001"}


# ---------------------------------------------------------------------------
# Gateway dependency — ขั้น auth + status/expiry + quota (permission เช็คใน endpoint)
# ---------------------------------------------------------------------------
async def authenticate(
    x_api_key: Annotated[str, Header(description="API key ของลูกค้า เช่น ak_live_…")]
) -> dict:
    contract = CONTRACTS.get(x_api_key)
    if contract is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "invalid API key")
    if contract["status"] != "active":
        raise HTTPException(status.HTTP_403_FORBIDDEN, f'contract {contract["status"]}')
    if contract["expire_date"] < date.today():
        raise HTTPException(status.HTTP_403_FORBIDDEN, "contract expired")
    if contract["called_today"] >= contract["daily_quota"]:
        raise HTTPException(status.HTTP_429_TOO_MANY_REQUESTS, "daily quota exceeded")
    contract["called_today"] += 1  # ของจริง: เขียน usage_log + ใช้ rate limiter จริง
    return contract


def require(contract: dict, perm: Permission) -> None:
    if perm not in contract["permissions"]:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            f"permission '{perm.value}' not in contract",
        )


ContractDep = Annotated[dict, Depends(authenticate)]


# ---------------------------------------------------------------------------
# Schemas — Pydantic ทำให้ Swagger โชว์ตัวอย่าง payload/response อัตโนมัติ
# ---------------------------------------------------------------------------
class Envelope(BaseModel):
    """envelope มาตรฐานทั้งระบบ — ตอบทุก endpoint แบบเดียวกัน"""
    data: Optional[Union[dict, list]] = None
    error: Optional[dict] = None


class SearchingRequest(BaseModel):
    query: str = Field(..., examples=["เอคมี"], description="ชื่อบริษัท (string)")


class GeneralRequest(BaseModel):
    juristic_id: str = Field(..., examples=["0105550000001"], description="เลขนิติบุคคล 13 หลัก")


class FinancialRequest(BaseModel):
    juristic_id: str = Field(..., examples=["0105550000001"])
    years: int = Field(1, ge=1, le=10, examples=[3], description="จำนวนปีย้อนหลังที่ขอ")


# ---------------------------------------------------------------------------
# Endpoints
# ---------------------------------------------------------------------------
@app.post("/v1/searching", response_model=Envelope, tags=["Searching"])
async def searching(body: SearchingRequest, contract: ContractDep):
    """ค้นด้วยชื่อ → คืนเลขนิติบุคคล (step 1 ของ 2-step lookup)"""
    require(contract, Permission.searching)
    hit = next((jid for kw, jid in NAME_INDEX.items() if kw in body.query.lower()), None)
    if not hit:
        return Envelope(data=[])
    c = COMPANIES[hit]
    return Envelope(data=[{"juristic_id": c["juristic_id"], "name_th": c["name_th"]}])


@app.post("/v1/general", response_model=Envelope, tags=["General"])
async def general(body: GeneralRequest, contract: ContractDep):
    """ข้อมูลทั่วไป (snapshot) จากเลขนิติบุคคล"""
    require(contract, Permission.general)
    c = COMPANIES.get(body.juristic_id)
    if not c:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "juristic_id not found")
    return Envelope(data={k: c[k] for k in
                          ("name_th", "name_en", "juristic_id", "registered_date",
                           "status", "business_type", "registered_capital")})


@app.post("/v1/financial", response_model=Envelope, tags=["Financial"])
async def financial(body: FinancialRequest, contract: ContractDep):
    """งบการเงินย้อนหลัง — บังคับ years <= ปีที่ลูกค้าซื้อ (permission cap)"""
    require(contract, Permission.financial)
    cap = contract["financial_max_years"]
    if body.years > cap:
        raise HTTPException(
            status.HTTP_403_FORBIDDEN,
            f"requested {body.years}y exceeds contract cap {cap}y",
        )
    c = COMPANIES.get(body.juristic_id)
    if not c:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "juristic_id not found")
    return Envelope(data={"juristic_id": c["juristic_id"],
                          "financials": c["financials"][: body.years]})


@app.get("/health", tags=["meta"])
async def health():
    return {"status": "ok", "ts": datetime.now().isoformat()}
