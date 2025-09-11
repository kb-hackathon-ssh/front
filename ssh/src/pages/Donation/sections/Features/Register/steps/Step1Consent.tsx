import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

function StepHeader() {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-bold">
        1
      </div>
      <div className="flex items-start gap-3">
        <ShieldCheck className="mt-1 h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl">본인 확인 및 동의</h2>
          <p className="mt-2 text-lg text-muted-foreground md:text-xl">
            전용 로그인(또는 본인인증) 후 진행됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Step1Consent({
  agreed,
  setAgreed,
}: {
  agreed: boolean;
  setAgreed: (v: boolean) => void;
}) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <StepHeader />
      </CardHeader>
      <CardContent className="space-y-6 md:space-y-7">
        <label className="flex cursor-pointer items-center gap-4">
          <Checkbox
            id="agree"
            className="h-5 w-5"
            checked={agreed}
            onCheckedChange={(v) => setAgreed(Boolean(v))}
          />
          <span className="text-xl">
            사전기부 안내 및 개인정보 처리에 <b>동의</b>합니다.
          </span>
        </label>
        <p className="text-base text-muted-foreground">
          약관과 처리방침은{' '}
          <Link to="/donation/banks" className="text-primary underline">
            은행 연동 안내
          </Link>
          에서 확인할 수 있습니다.
        </p>
      </CardContent>
    </Card>
  );
}
