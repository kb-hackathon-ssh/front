import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Building2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DESTINATION_OPTIONS } from '../types';

function StepHeader() {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-bold">
        4
      </div>
      <div className="flex items-start gap-3">
        <Building2 className="mt-1 h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl">기부처 선택</h2>
          <p className="mt-2 text-lg text-muted-foreground md:text-xl">
            병원·학교·비영리단체 등 원하는 곳을 고릅니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Step4Destinations({
  destinations,
  setDestinations,
  memo,
  setMemo,
}: {
  destinations: string[];
  setDestinations: (v: string[]) => void;
  memo: string;
  setMemo: (v: string) => void;
}) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <StepHeader />
      </CardHeader>
      <CardContent className="space-y-7">
        <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {DESTINATION_OPTIONS.map((name) => (
            <label
              key={name}
              className="flex cursor-pointer items-center gap-4 rounded-lg border p-4"
            >
              <Checkbox
                className="h-5 w-5"
                checked={destinations.includes(name)}
                onCheckedChange={(v) => {
                  const checked = Boolean(v);
                  setDestinations(
                    checked ? [...destinations, name] : destinations.filter((x) => x !== name),
                  );
                }}
              />
              <span className="text-[1.05em]">{name}</span>
            </label>
          ))}
        </fieldset>

        <div className="grid gap-3">
          <Label htmlFor="memo" className="text-xl font-semibold">
            특정 기관/용도 메모(선택)
          </Label>
          <Input
            id="memo"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            maxLength={120}
            placeholder="예: ○○대학교 장학금, ○○병원 소아암센터 등"
            className="h-20 px-6 text-3xl md:text-4xl font-semibold tracking-tight leading-tight
                       placeholder:text-3xl md:placeholder:text-4xl placeholder:font-semibold placeholder:tracking-tight placeholder:leading-tight"
          />
        </div>
      </CardContent>
    </Card>
  );
}
