export type AmountType = 'fixed' | 'ratio';

export type RegisterPayload = {
  agreed: boolean;
  amount: { type: 'fixed'; value: number } | { type: 'ratio'; value: number };
  bankLinked: boolean;
  sandboxMode: boolean;
  destinations: string[];
  memo: string;
};

export const DESTINATION_OPTIONS = [
  '국내 병원',
  '장학재단/학교',
  '사회복지/비영리',
  '국제구호',
  '환경/동물보호',
  '문화/예술',
] as const;
