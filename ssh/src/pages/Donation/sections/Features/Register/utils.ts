export const PRESET_AMOUNTS = [
  { label: '만원', value: 10_000 },
  { label: '십만원', value: 100_000 },
  { label: '백만원', value: 1_000_000 },
  { label: '천만원', value: 10_000_000 },
  { label: '억원', value: 100_000_000 },
];

const MAX_AMOUNT = 1_000_000_000_000;

export const clampAmount = (n: number) => Math.max(0, Math.min(n, MAX_AMOUNT));
export const toNum = (s: string) => Number(s || '0');
export const fmtKRW = (v: number) => v.toLocaleString('ko-KR') + '원';
