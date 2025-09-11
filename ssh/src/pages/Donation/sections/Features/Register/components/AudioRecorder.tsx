import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { blobToWav16kMono } from '../utils/audio';

export default function AudioRecorder({
  onChange,
  maxSeconds = 120,
}: {
  onChange: (blob: Blob | null) => void;
  maxSeconds?: number;
}) {
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const pickMime = () => {
    const MR = (window as any).MediaRecorder;
    if (!MR) return '';
    if (MR.isTypeSupported('audio/webm')) return 'audio/webm';
    if (MR.isTypeSupported('audio/mp4')) return 'audio/mp4';
    if (MR.isTypeSupported('audio/ogg')) return 'audio/ogg';
    return '';
  };

  const start = async () => {
    try {
      setError(null);
      if (!navigator.mediaDevices?.getUserMedia) {
        setError('이 브라우저는 녹음을 지원하지 않습니다.');
        return;
      }
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];

      const mimeType = pickMime() || undefined;
      const mr = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      mediaRef.current = mr;

      mr.ondataavailable = (e) => e.data?.size && chunksRef.current.push(e.data);
      mr.onstop = async () => {
        const raw = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        try {
          // 여기서 16kHz 모노 WAV로 변환
          const wav16k = await blobToWav16kMono(raw, 16000);
          setBlob(wav16k);
          onChange(wav16k);
        } catch (err) {
          setError('16kHz 변환에 실패하여 원본 포맷으로 전달합니다.');
          setBlob(raw);
          onChange(raw);
        } finally {
          stopTimer();
          stopTracks();
        }
      };

      setIsRecording(true);
      setSeconds(0);
      mr.start(100);
      startTimer();
    } catch (e: any) {
      setError(e?.message ?? '마이크 권한을 확인해 주세요.');
    }
  };

  const stop = () => {
    mediaRef.current?.stop();
    setIsRecording(false);
  };

  const reset = () => {
    setIsRecording(false);
    setSeconds(0);
    setBlob(null);
    onChange(null);
    stopTimer();
    stopTracks();
    chunksRef.current = [];
    setError(null);
  };

  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => {
      setSeconds((s) => {
        if (s + 1 >= maxSeconds) stop();
        return s + 1;
      });
    }, 1000);
  };
  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const stopTracks = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  };

  useEffect(
    () => () => {
      stopTimer();
      stopTracks();
    },
    [],
  );

  const mm = String(Math.floor(seconds / 60)).padStart(2, '0');
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          음성 메모(최대 {Math.floor(maxSeconds / 60)}분) — 출력: WAV 16kHz 모노
        </span>
        {!isRecording ? (
          <Button type="button" className="h-9 px-4" onClick={start}>
            녹음 시작
          </Button>
        ) : (
          <Button type="button" variant="destructive" className="h-9 px-4" onClick={stop}>
            녹음 종료
          </Button>
        )}
      </div>

      <div className="rounded-lg border p-3">
        <div className="mb-2 text-sm text-muted-foreground">
          경과 시간: {mm}:{ss}
        </div>
        {blob ? (
          <div className="flex items-center gap-3">
            <audio controls src={URL.createObjectURL(blob)} className="w-full" />
            <Button type="button" variant="outline" className="h-9 px-3" onClick={reset}>
              다시 녹음
            </Button>
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            {isRecording ? '녹음 중… 마이크를 가까이 사용해 주세요.' : '아직 녹음 파일이 없습니다.'}
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-muted-foreground">
        일부 브라우저에서 OfflineAudioContext가 없으면 선형 보간으로 변환합니다.
      </p>
    </div>
  );
}
