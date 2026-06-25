// แค็ตตาล็อก API ทั้งหมดที่ CREDEN ขายได้ (อ้างอิงจากโน้ต Obsidian)
// แต่ละเส้นมี payload type + field ย่อยที่ลูกค้าเลือกซื้อได้ (field-level permission)

export const API_CATALOG = [
  {
    key: 'searching',
    label: 'Searching',
    desc: 'ค้นหาด้วยชื่อ → คืนเลขนิติบุคคล',
    payload: 'String (ชื่อ)',
    returns: 'เลขนิติบุคคล',
    // เลือกได้ 1 หรือ 2 อย่าง
    options: [
      { key: 'company', label: 'company (นิติบุคคล)' },
      { key: 'person', label: 'person (บุคคล) — ⚠ ยังไม่มี endpoint ปลายทาง' },
    ],
  },
  {
    key: 'general',
    label: 'General Info',
    desc: 'Snapshot เบา ๆ (รับเลขนิติ)',
    payload: 'เลขนิติบุคคล',
    returns: 'ข้อมูลสรุปบริษัท + financial ปีล่าสุด',
    fields: [
      'ชื่อนิติบุคคล (ไทย)',
      'ชื่อนิติบุคคล (อังกฤษ)',
      'เลขทะเบียนนิติบุคคล',
      'เลขทะเบียนนิติบุคคล (เดิม)',
      'วันเดือนปีที่จดทะเบียน',
      'สถานภาพกิจการ',
      'ประเภทธุรกิจ',
      'จัดซื้อจัดจ้างภาครัฐ (จำนวน/มูลค่า)',
      'ที่อยู่',
      'ทุนจดทะเบียนปัจจุบัน',
      'มูลค่าบริษัท',
      'มูลค่าบริษัทรวม (หลัก+ย่อย)',
      'กรรมการ (ไทย)',
      'กรรมการ (อังกฤษ)',
      'ผู้ถือหุ้น',
      'operation year',
      'financial (ปีล่าสุด)',
    ],
  },
  {
    key: 'shareholder',
    label: 'Shareholder List',
    desc: 'รายชื่อผู้ถือหุ้นเต็ม (รับเลขนิติ)',
    payload: 'เลขนิติบุคคล',
    returns: 'รายการผู้ถือหุ้นแบบเต็ม',
    fields: [
      'Shareholders',
      'Authorized Signatories (TH)',
      'Shareholding Relationships',
      "Shareholders' Nationalities",
      'Shareholding Percentage (%)',
      'Share Value',
      'Number of Shares Held',
    ],
  },
  {
    key: 'director',
    label: 'Director',
    desc: 'รายชื่อกรรมการเต็ม (รับเลขนิติ)',
    payload: 'เลขนิติบุคคล',
    returns: 'รายการกรรมการแบบเต็ม',
  },
  {
    key: 'financial',
    label: 'Financial',
    desc: 'งบการเงินย้อนหลัง (รับเลขนิติ)',
    payload: 'เลขนิติบุคคล',
    returns: 'งบการเงินตามช่วงปีที่ซื้อ',
    // year-range = permission cap (maxYears)
    yearOptions: [
      { value: 1, label: 'ปีล่าสุด' },
      { value: 3, label: '3 ปีล่าสุด' },
      { value: 5, label: '5 ปีล่าสุด' },
      { value: 10, label: '10 ปีล่าสุด' },
    ],
  },
  {
    key: 'procurement',
    label: 'Procurement',
    desc: 'ข้อมูลจัดซื้อจัดจ้างภาครัฐ (รับเลขนิติ)',
    payload: 'เลขนิติบุคคล',
    returns: 'ประวัติจัดซื้อจัดจ้าง',
  },
  {
    key: 'vat',
    label: 'VAT',
    desc: 'ข้อมูล VAT (รับเลขนิติ)',
    payload: 'เลขนิติบุคคล',
    returns: 'ข้อมูลภาษีมูลค่าเพิ่ม',
  },
]

export const STATUS_META = {
  active: { label: 'ใช้งาน', color: '#16a34a', bg: '#dcfce7' },
  suspended: { label: 'ระงับชั่วคราว', color: '#d97706', bg: '#fef3c7' },
  expired: { label: 'หมดอายุ', color: '#6b7280', bg: '#f3f4f6' },
  revoked: { label: 'ยกเลิก', color: '#dc2626', bg: '#fee2e2' },
}
