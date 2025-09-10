import { useMemo, useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { ShieldCheck, HandCoins, FileSignature, Building2, ReceiptText } from 'lucide-react';

type AmountType = 'fixed' | 'ratio';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [agreed, setAgreed] = useState(false);
  const [amountType, setAmountType] = useState<AmountType>('fixed');
  const [fixedAmount, setFixedAmount] = useState<string>('');
  const [ratio, setRatio] = useState<string>('');
  const [bankLinked, setBankLinked] = useState(false);
  const [sandboxMode] = useState(true);
  const [destinations, setDestinations] = useState<string[]>([]);
  const [memo, setMemo] = useState('');

  const [esignOpen, setEsignOpen] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);

  const [step, setStep] = useState(1);
  const maxStep = 5;

  const canNext = useMemo(() => {
    if (step === 1) return agreed;
    if (step === 2) {
      if (amountType === 'fixed') return !!Number(fixedAmount);
      return !!Number(ratio) && Number(ratio) > 0 && Number(ratio) <= 100;
    }
    if (step === 3) return bankLinked && !!signatureDataUrl;
    if (step === 4) return destinations.length > 0;
    return true;
  }, [step, agreed, amountType, fixedAmount, ratio, bankLinked, destinations, signatureDataUrl]);

  const next = () => setStep((s) => Math.min(maxStep, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const submit = () => {
    const payload = {
      agreed,
      amount:
        amountType === 'fixed'
          ? { type: 'fixed', value: Number(fixedAmount) }
          : { type: 'ratio', value: Number(ratio) },
      bankLinked,
      sandboxMode,
      destinations,
      memo,
    };
    console.log('submit payload', payload);
    alert('기부 의사 등록이 완료되었습니다.');
    navigate('/donation');
  };

  const StepBadge = ({ n, active }: { n: number; active: boolean }) => (
    <div
      className={`flex h-10 w-10 items-center justify-center rounded-full text-base font-bold ${
        active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
      }`}
    >
      {n}
    </div>
  );

  const StepHeader = ({
    n,
    icon: Icon,
    title,
    desc,
    active,
  }: {
    n: number;
    icon: any;
    title: string;
    desc: string;
    active: boolean;
  }) => (
    <div className="flex items-start gap-4">
      <StepBadge n={n} active={active} />
      <div className="flex items-start gap-3">
        <Icon className="mt-1 h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl">{title}</h2>
          <p className="mt-2 text-lg text-muted-foreground md:text-xl">{desc}</p>
        </div>
      </div>
    </div>
  );

  const PRESET_AMOUNTS = [
    { label: '만원', value: 10_000 },
    { label: '십만원', value: 100_000 },
    { label: '백만원', value: 1_000_000 },
    { label: '천만원', value: 10_000_000 },
    { label: '억원', value: 100_000_000 },
  ];

  const MAX_AMOUNT = 1_000_000_000_000;
  const clamp = (n: number) => Math.max(0, Math.min(n, MAX_AMOUNT));
  const toNum = (s: string) => Number(s || '0');
  const fmt = (v: number) => v.toLocaleString('ko-KR') + '원';

  function SignaturePad({
    height = 200,
    lineWidth = 3,
    onSave,
  }: {
    height?: number;
    lineWidth?: number;
    onSave: (dataUrl: string) => void;
  }) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
    const drawingRef = useRef(false);

    useEffect(() => {
      const canvas = canvasRef.current!;
      const container = containerRef.current!;
      const ctx = canvas.getContext('2d')!;
      ctxRef.current = ctx;

      const resize = () => {
        const dpr = Math.max(1, window.devicePixelRatio || 1);
        const width = container.clientWidth;
        const cssHeight = height;

        canvas.width = Math.floor(width * dpr);
        canvas.height = Math.floor(cssHeight * dpr);

        canvas.style.width = `${width}px`;
        canvas.style.height = `${cssHeight}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = '#111827';
      };

      resize();
      const ro = new ResizeObserver(resize);
      ro.observe(container);
      return () => ro.disconnect();
    }, [height, lineWidth]);

    const getPos = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
      const ctx = ctxRef.current!;
      const { x, y } = getPos(e);
      drawingRef.current = true;
      e.currentTarget.setPointerCapture(e.pointerId);
      ctx.beginPath();
      ctx.moveTo(x, y);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;
      const ctx = ctxRef.current!;
      const { x, y } = getPos(e);
      ctx.lineTo(x, y);
      ctx.stroke();
    };

    const onPointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawingRef.current) return;
      drawingRef.current = false;
      const ctx = ctxRef.current!;
      ctx.closePath();
      e.currentTarget.releasePointerCapture(e.pointerId);
    };

    const clear = () => {
      const canvas = canvasRef.current!;
      const ctx = ctxRef.current!;
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    };

    const save = () => {
      const dataUrl = canvasRef.current!.toDataURL('image/png');
      onSave(dataUrl);
    };

    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">서명을 입력해 주세요.</span>
          <div className="flex items-center gap-2">
            <Button type="button" variant="outline" className="h-9 px-3" onClick={clear}>
              지우기
            </Button>
            <Button type="button" className="h-9 px-4" onClick={save}>
              저장
            </Button>
          </div>
        </div>

        <div ref={containerRef} className="rounded-md border bg-white">
          <canvas
            ref={canvasRef}
            className="block touch-none rounded-md"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
          />
        </div>
        <p className="text-xs text-muted-foreground">팁: 마우스/트랙패드/터치 모두 지원합니다.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 text-lg md:text-xl">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-extrabold md:text-4xl">기부 의사 등록</h1>
        <Link
          to="/donation"
          className="text-base md:text-xl text-primary underline-offset-4 hover:underline"
        >
          ← 기부 소개로 돌아가기
        </Link>
      </div>

      <div className="mb-8 grid grid-cols-5 gap-3">
        {[1, 2, 3, 4, 5].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div className={`h-2 w-full rounded ${n <= step ? 'bg-primary' : 'bg-muted'}`} />
          </div>
        ))}
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <Card className="shadow-lg">
          <CardHeader>
            <StepHeader
              n={1}
              icon={ShieldCheck}
              title="본인 확인 및 동의"
              desc="전용 로그인(또는 본인인증) 후 진행됩니다."
              active={step === 1}
            />
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
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <Card className="shadow-lg">
          <CardHeader>
            <StepHeader
              n={2}
              icon={HandCoins}
              title="금액 · 비율 지정"
              desc="정액 또는 비율로 기부 범위를 설정합니다. 생전 언제든 수정·철회 가능합니다."
              active={step === 2}
            />
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
                      onClick={() => setFixedAmount(String(clamp(toNum(fixedAmount) + p.value)))}
                    >
                      {p.label}
                    </Button>
                  ))}
                </div>

                <Input
                  id="fixedAmount"
                  inputMode="numeric"
                  placeholder="예: 1,000,000"
                  className="
    h-20 px-6
    text-3xl md:text-4xl font-semibold tabular-nums tracking-tight leading-tight
    placeholder:text-3xl md:placeholder:text-4xl placeholder:font-semibold placeholder:tracking-tight placeholder:leading-tight
  "
                  value={fixedAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/[^0-9]/g, '');
                    setFixedAmount(String(clamp(Number(raw))));
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

                <p className="text-xl text-muted-foreground">
                  현재 금액: {fmt(toNum(fixedAmount))}
                </p>
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
                  className="
    h-20 px-6
    text-3xl md:text-4xl font-semibold tabular-nums tracking-tight leading-tight
    placeholder:text-3xl md:placeholder:text-4xl placeholder:font-semibold placeholder:tracking-tight placeholder:leading-tight
  "
                  value={ratio}
                  onChange={(e) => setRatio(e.target.value.replace(/[^0-9]/g, ''))}
                />
                <p className="text-lg text-muted-foreground">1–100 사이의 정수를 권장합니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <Card className="shadow-lg">
          <CardHeader>
            <StepHeader
              n={3}
              icon={FileSignature}
              title="은행 기부 기능 연동"
              desc="KB국민은행 ‘공식 기부 기능’과 연동되어 안전하게 등록됩니다."
              active={step === 3}
            />
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
                  <SignaturePad
                    height={220}
                    lineWidth={4}
                    onSave={(dataUrl) => {
                      setSignatureDataUrl(dataUrl);
                    }}
                  />
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
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <Card className="shadow-lg">
          <CardHeader>
            <StepHeader
              n={4}
              icon={Building2}
              title="기부처 선택"
              desc="병원·학교·비영리단체 등 원하는 곳을 고릅니다."
              active={step === 4}
            />
          </CardHeader>
          <CardContent className="space-y-7">
            <fieldset className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {[
                '국내 병원',
                '장학재단/학교',
                '사회복지/비영리',
                '국제구호',
                '환경/동물보호',
                '문화/예술',
              ].map((name) => (
                <label
                  key={name}
                  className="flex cursor-pointer items-center gap-4 rounded-lg border p-4"
                >
                  <Checkbox
                    className="h-5 w-5"
                    checked={destinations.includes(name)}
                    onCheckedChange={(v) => {
                      const checked = Boolean(v);
                      setDestinations((prev) =>
                        checked ? [...prev, name] : prev.filter((x) => x !== name),
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
                className="
      h-20 px-6
      text-3xl md:text-4xl font-semibold tracking-tight leading-tight
      placeholder:text-3xl md:placeholder:text-4xl placeholder:font-semibold placeholder:tracking-tight placeholder:leading-tight
    "
              />
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 5 */}
      {step === 5 && (
        <Card className="shadow-lg">
          <CardHeader>
            <StepHeader
              n={5}
              icon={ReceiptText}
              title="검토 및 제출"
              desc="지정한 내용대로 기부가 집행되고, 영수증이 발급됩니다."
              active={step === 5}
            />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-xl border p-5 text-[1.05em]">
              <div className="mb-3 text-xl font-semibold">요약</div>
              <ul className="space-y-2 text-muted-foreground">
                <li>동의 여부: {agreed ? '동의함' : '미동의'}</li>
                <li>
                  지정 방식:{' '}
                  {amountType === 'fixed'
                    ? `정액 ${Number(fixedAmount || 0).toLocaleString()}원`
                    : `비율 ${ratio || 0}%`}
                </li>
                <li>
                  은행 연동: {bankLinked ? '완료' : '미완료'} ({sandboxMode ? '샌드박스' : '실거래'}
                  )
                </li>
                <li>기부처: {destinations.length ? destinations.join(', ') : '선택 없음'}</li>
                <li>메모: {memo || '미등록'}</li>
              </ul>
              <p className="mt-4 text-base text-muted-foreground">
                제출 후에도 생전에는 언제든 <b className="text-foreground">수정·철회</b>가
                가능합니다.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button
          variant="ghost"
          size="lg"
          className="h-12 px-6 text-lg"
          onClick={prev}
          disabled={step === 1}
        >
          이전
        </Button>
        <div className="flex items-center gap-4">
          {step < maxStep ? (
            <Button size="lg" className="h-12 px-8 text-lg" onClick={next} disabled={!canNext}>
              다음
            </Button>
          ) : (
            <Button size="lg" className="h-12 px-8 text-lg" onClick={submit}>
              등록하기
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
