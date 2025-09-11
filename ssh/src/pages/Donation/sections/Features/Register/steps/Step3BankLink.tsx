import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { FileSignature } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Link } from 'react-router-dom';
import SignaturePad from '../components/SignaturePad';

function StepHeader() {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-bold">
        3
      </div>
      <div className="flex items-start gap-3">
        <FileSignature className="mt-1 h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl">은행 기부 기능 연동</h2>
          <p className="mt-2 text-lg text-muted-foreground md:text-xl">
            KB국민은행 ‘공식 기부 기능’과 연동되어 안전하게 등록됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Step3BankLink({
  bankLinked,
  setBankLinked,
  esignOpen,
  setEsignOpen,
  signatureDataUrl,
  setSignatureDataUrl,
}: {
  bankLinked: boolean;
  setBankLinked: (v: boolean) => void;
  esignOpen: boolean;
  setEsignOpen: (v: boolean) => void;
  signatureDataUrl: string | null;
  setSignatureDataUrl: (v: string | null) => void;
}) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <StepHeader />
      </CardHeader>
      <CardContent className="space-y-7">
        <div className="rounded-xl border p-5">
          <p className="mb-4 text-base text-muted-foreground">
            실제 환경에서는 KB국민은행의 공식 연동 절차(로그인/전자서명)를 진행합니다.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Button
              type="button"
              size="lg"
              className="h-12 px-7 text-lg"
              onClick={() => setBankLinked(true)}
              disabled={bankLinked}
            >
              {bankLinked ? '연결 완료' : 'KB 기부 기능 연동 시작'}
            </Button>
            {bankLinked && <span className="text-lg text-green-600">✔ 연결되었습니다.</span>}
          </div>

          <div className="mt-5 flex items-center gap-4">
            <Switch checked={esignOpen} onCheckedChange={setEsignOpen} id="esign" />
            <Label htmlFor="esign" className="cursor-pointer text-[1.05em]">
              전자서명 진행
            </Label>
          </div>

          {esignOpen && (
            <div className="mt-4 space-y-4 rounded-xl border bg-muted/20 p-4">
              <SignaturePad height={220} lineWidth={4} onSave={setSignatureDataUrl} />
              <div className="flex items-center gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  className="h-10 px-4"
                  onClick={() => setEsignOpen(false)}
                >
                  닫기
                </Button>
                {signatureDataUrl && (
                  <>
                    <img
                      src={signatureDataUrl}
                      alt="서명 미리보기"
                      className="h-16 rounded border bg-white"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="h-10 px-4"
                      onClick={() => setSignatureDataUrl(null)}
                    >
                      서명 삭제
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          <p className="mt-4 text-base text-muted-foreground">
            자세한 절차는{' '}
            <Link to="/donation/banks" className="text-primary underline">
              은행 연동 안내
            </Link>
            를 참고하세요.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
