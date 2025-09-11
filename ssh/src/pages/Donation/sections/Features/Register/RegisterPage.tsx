import { useMemo, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import Step1Consent from './steps/Step1Consent';
import Step2Amount from './steps/Step2Amount';
import Step3BankLink from './steps/Step3BankLink';
import Step4Destinations from './steps/Step4Destinations';
import Step5Review from './steps/Step5Review';
import type { AmountType, RegisterPayload } from './types';

export default function RegisterPage() {
  const navigate = useNavigate();

  const [voiceNote, setVoiceNote] = useState<Blob | null>(null);
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

  const submit = async () => {
    const payload: RegisterPayload = {
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

    if (voiceNote) {
      const fd = new FormData();
      fd.append('meta', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      const ext = voiceNote.type.includes('wav')
        ? 'wav'
        : voiceNote.type.includes('mp4')
          ? 'm4a'
          : voiceNote.type.includes('webm')
            ? 'webm'
            : 'dat';
      fd.append(
        'voiceNote',
        new File([voiceNote], `voice-note.${ext}`, {
          type: voiceNote.type || 'audio/wav',
        }),
      );

      console.log('FormData ready (payload + voiceNote)', payload, voiceNote);
    } else {
      console.log('submit payload (no voiceNote)', payload);
    }

    alert('기부 의사 등록이 완료되었습니다.');
    navigate('/donation');
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-12 text-lg md:text-XL">
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

      {/* 단계 */}
      {step === 1 && <Step1Consent agreed={agreed} setAgreed={setAgreed} />}
      {step === 2 && (
        <Step2Amount
          amountType={amountType}
          setAmountType={setAmountType}
          fixedAmount={fixedAmount}
          setFixedAmount={setFixedAmount}
          ratio={ratio}
          setRatio={setRatio}
        />
      )}
      {step === 3 && (
        <Step3BankLink
          bankLinked={bankLinked}
          setBankLinked={setBankLinked}
          esignOpen={esignOpen}
          setEsignOpen={setEsignOpen}
          signatureDataUrl={signatureDataUrl}
          setSignatureDataUrl={setSignatureDataUrl}
        />
      )}
      {step === 4 && (
        <Step4Destinations
          destinations={destinations}
          setDestinations={setDestinations}
          memo={memo}
          setMemo={setMemo}
        />
      )}
      {step === 5 && (
        <Step5Review
          agreed={agreed}
          amountType={amountType}
          fixedAmount={fixedAmount}
          ratio={ratio}
          bankLinked={bankLinked}
          sandboxMode={sandboxMode}
          destinations={destinations}
          memo={memo}
          voiceNote={voiceNote}
          setVoiceNote={setVoiceNote}
        />
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
