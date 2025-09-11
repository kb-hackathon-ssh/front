import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { HandCoins } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { AmountType } from '../types';
import { PRESET_AMOUNTS, clampAmount, fmtKRW, toNum } from '../utils';

function StepHeader() {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-bold">
        2
      </div>
      <div className="flex items-start gap-3">
        <HandCoins className="mt-1 h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl">금액 · 비율 지정</h2>
          <p className="mt-2 text-lg text-muted-foreground md:text-xl">
            정액 또는 비율로 기부 범위를 설정합니다. 생전 언제든 수정·철회 가능합니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Step2Amount({
  amountType,
  setAmountType,
  fixedAmount,
  setFixedAmount,
  ratio,
  setRatio,
}: {
  amountType: AmountType;
  setAmountType: (v: AmountType) => void;
  fixedAmount: string;
  setFixedAmount: (v: string) => void;
  ratio: string;
  setRatio: (v: string) => void;
}) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <StepHeader />
      </CardHeader>
      <CardContent className="space-y-7">
        <RadioGroup
          value={amountType}
          onValueChange={(v) => setAmountType(v as AmountType)}
          className="grid gap-4 md:grid-cols-2"
        >
          <label className="flex items-center gap-3 rounded-lg border p-4">
            <RadioGroupItem id="fixed" value="fixed" className="h-5 w-5" />
            <span className="font-semibold text-xl">정액 지정</span>
          </label>
          <label className="flex items-center gap-3 rounded-lg border p-4">
            <RadioGroupItem id="ratio" value="ratio" className="h-5 w-5" />
            <span className="font-semibold text-xl">비율 지정</span>
          </label>
        </RadioGroup>

        {amountType === 'fixed' ? (
          <div className="grid gap-4">
            <Label htmlFor="fixedAmount" className="text-xl font-semibold">
              정액(원)
            </Label>

            <div className="flex flex-wrap gap-3">
              {PRESET_AMOUNTS.map((p) => (
                <Button
                  key={p.label}
                  type="button"
                  variant="outline"
                  size="lg"
                  className="h-12 px-5 text-lg select-none"
                  onClick={() => setFixedAmount(String(clampAmount(toNum(fixedAmount) + p.value)))}
                >
                  {p.label}
                </Button>
              ))}
            </div>

            <Input
              id="fixedAmount"
              inputMode="numeric"
              placeholder="예: 1,000,000"
              className="h-20 px-6 text-3xl md:text-4xl font-semibold tabular-nums tracking-tight leading-tight
                         placeholder:text-3xl md:placeholder:text-4xl placeholder:font-semibold placeholder:tracking-tight placeholder:leading-tight"
              value={fixedAmount}
              onChange={(e) => {
                const raw = e.target.value.replace(/[^0-9]/g, '');
                setFixedAmount(String(clampAmount(Number(raw))));
              }}
            />

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="secondary"
                className="h-10 px-4 text-lg rounded-md"
                onClick={() => setFixedAmount('0')}
              >
                초기화
              </Button>
              <span className="text-lg text-muted-foreground">
                팁: 버튼을 누를 때마다 금액이 누적됩니다.
              </span>
            </div>

            <p className="text-xl text-muted-foreground">현재 금액: {fmtKRW(toNum(fixedAmount))}</p>
          </div>
        ) : (
          <div className="grid gap-3">
            <Label htmlFor="ratio" className="text-xl font-semibold">
              비율(%)
            </Label>
            <Input
              id="ratio"
              inputMode="numeric"
              placeholder="예: 10"
              className="h-20 px-6 text-3xl md:text-4xl font-semibold tabular-nums tracking-tight leading-tight
                         placeholder:text-3xl md:placeholder:text-4xl placeholder:font-semibold placeholder:tracking-tight placeholder:leading-tight"
              value={ratio}
              onChange={(e) => setRatio(e.target.value.replace(/[^0-9]/g, ''))}
            />
            <p className="text-lg text-muted-foreground">1–100 사이의 정수를 권장합니다.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
