import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ReceiptText } from 'lucide-react';
import AudioRecorder from '../components/AudioRecorder';
import type { AmountType } from '../types';

function StepHeader() {
  return (
    <div className="flex items-start gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground text-base font-bold">
        5
      </div>
      <div className="flex items-start gap-3">
        <ReceiptText className="mt-1 h-7 w-7 text-primary" />
        <div>
          <h2 className="text-2xl font-semibold md:text-3xl">검토 및 제출</h2>
          <p className="mt-2 text-lg text-muted-foreground md:text-xl">
            지정한 내용대로 기부가 집행되고, 영수증이 발급됩니다.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Step5Review({
  agreed,
  amountType,
  fixedAmount,
  ratio,
  bankLinked,
  sandboxMode,
  destinations,
  memo,
  voiceNote,
  setVoiceNote,
}: {
  agreed: boolean;
  amountType: AmountType;
  fixedAmount: string;
  ratio: string;
  bankLinked: boolean;
  sandboxMode: boolean;
  destinations: string[];
  memo: string;
  voiceNote: Blob | null;
  setVoiceNote: (b: Blob | null) => void;
}) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <StepHeader />
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
              은행 연동: {bankLinked ? '완료' : '미완료'} ({sandboxMode ? '샌드박스' : '실거래'})
            </li>
            <li>기부처: {destinations.length ? destinations.join(', ') : '선택 없음'}</li>
            <li>메모: {memo || '미등록'}</li>
          </ul>
          <p className="mt-4 text-base text-muted-foreground">
            제출 후에도 생전에는 언제든 <b className="text-foreground">수정·철회</b>가 가능합니다.
          </p>
        </div>

        <div className="mt-2 space-y-3 rounded-xl border p-5">
          <div className="mb-2 text-xl font-semibold">음성 메모(선택)</div>
          <AudioRecorder onChange={setVoiceNote} maxSeconds={120} />
          {voiceNote && (
            <p className="text-sm text-muted-foreground">
              첨부 예정 파일 크기: {(voiceNote.size / 1024).toFixed(1)} KB, 타입:{' '}
              {voiceNote.type || 'N/A'}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
