import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ROUTING_PATH } from '@/routes/path.constants';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import logo2 from '@/assets/logo2.png';
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  CircleUser,
  Mic,
  MoreHorizontal,
  PanelLeftOpen,
  Phone,
  Send,
  Loader2,
} from 'lucide-react';
import AppSidebar from './appsidebar';

import { ChatBubble } from '@/pages/Chatbot/components/chat/ChatBubble';
import ChatDateDivider from '@/pages/Chatbot/components/chat/ChatDateDivider';
import { decorateMessages } from '@/pages/Chatbot/components/chat/chat-utils';
import type { ChatMessage } from '@/pages/Chatbot/components/chat/types';

// 16k 변환 유틸
import { blobToWav16kMono } from '@/pages/Donation/sections/Features/Register/utils/audio.ts';

type SpeechApiResponse = {
  userMessageText: string;
  chatbotMessageText: string;
  chatbotAudio: string | null;
  actionType: string | null;
  actionData: any | null;
  conversationContext: string | null;
};

type StartApiSuccess = {
  success: true;
  data: {
    greetingText?: string;
    options?: Array<{ text: string; message: string }>;
  };
  error: null;
};

type MessageApiSuccess = {
  success: true;
  data: {
    responseText: string;
    actionType?: 'SPEAK' | 'HIGHLIGHT_ELEMENT' | 'SHOW_VIDEO';
    actionData?: any;
    conversationContext?: string | null;
  };
  error: null;
};

type MessageApiError = {
  success: false;
  data: null;
  error: { message?: string; status?: number } | null;
};

export default function Chatbot() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 음성 녹음/업로드 관련
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [uploading, setUploading] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 대화 상태
  const [conversationContext, setConversationContext] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const objectUrlsRef = useRef<string[]>([]);
  const audioRefs = useRef<Record<number, HTMLAudioElement | null>>({});

  // start API
  const [greetingText, setGreetingText] = useState<string>('');
  const [quickSelections, setQuickSelections] = useState<Array<{ text: string; message: string }>>(
    [],
  );
  const [startLoading, setStartLoading] = useState<boolean>(false);

  // 글자 크기 & 볼륨 (로컬 보존)
  const [fontPx, setFontPx] = useState<number>(() => {
    const saved = localStorage.getItem('chat.fontPx');
    return saved ? Number(saved) : 16;
  });
  const [volume, setVolume] = useState<number>(() => {
    const saved = localStorage.getItem('chat.volume');
    return saved ? Number(saved) : 0.8; // 0~1
  });

  // Web Speech TTS
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const speak = (text: string) => {
    if (!text) return;
    try {
      if (typeof window.speechSynthesis === 'undefined') return;
      // 진행 중인 발화 취소
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.volume = Math.max(0, Math.min(1, volume));
      u.lang = 'ko-KR';
      u.rate = 1.0;
      u.pitch = 1.0;
      speechRef.current = u;
      window.speechSynthesis.speak(u);
    } catch (e) {
      console.warn('TTS 실패:', e);
    }
  };

  // 마운트/언마운트
  useEffect(() => {
    // 언마운트 시 TTS/리소스 정리
    return () => {
      try {
        window.speechSynthesis?.cancel();
      } catch {}
      objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
      objectUrlsRef.current = [];
      stopTimer();
      stopTracks();
    };
  }, []);

  // start API 호출
  useEffect(() => {
    (async () => {
      try {
        setStartLoading(true);
        const res = await fetch('/api/public/chat/start', {
          method: 'GET',
          credentials: 'include',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: StartApiSuccess = await res.json();

        if (data?.success && data.data) {
          setGreetingText(
            data.data.greetingText ??
              '안녕하세요. 무엇을 도와드릴까요? 아래에서 항목을 선택하거나 메시지를 입력해 주세요.',
          );

          const raw = Array.isArray(data.data.options) ? data.data.options : [];
          const normalized = raw
            .map((it) => {
              const text = String(it?.text ?? '').trim();
              const msgRaw = typeof it?.message === 'string' ? it.message : '';
              const message = (msgRaw || text).trim();
              return { text, message };
            })
            .filter((it) => it.text.length > 0 && it.message.length > 0);

          setQuickSelections(normalized);
        }
      } catch (e) {
        console.error(e);
        // 폴백
        setGreetingText(
          "안녕하세요, 어르신. 디지털 금융 동반자 '마음 잇는 목소리'입니다.<br/>아래에서 원하시는 서비스를 선택하시거나, 편하게 말씀해주세요.",
        );

        setQuickSelections([
          { text: '주변 ATM 찾기 안내', message: 'ATM은 어떻게 찾아요?' },
          { text: '보이스피싱 진단 안내', message: '보이스피싱은 어떻게 확인해요?' },
          { text: '유산 기부 방법 안내', message: '유산 기부는 어떻게 해요?' },
        ]);
      } finally {
        setStartLoading(false);
      }
    })();
  }, []);

  // 로컬스토리지 동기화
  useEffect(() => localStorage.setItem('chat.fontPx', String(fontPx)), [fontPx]);
  useEffect(() => localStorage.setItem('chat.volume', String(volume)), [volume]);

  // 볼륨 변경 시 <audio>에 반영
  useEffect(() => {
    Object.values(audioRefs.current).forEach((el) => {
      if (el) el.volume = volume;
    });
  }, [volume]);

  // MediaRecorder util
  const pickMime = () => {
    const MR = (window as any).MediaRecorder;
    if (!MR) return '';
    if (MR.isTypeSupported('audio/webm')) return 'audio/webm';
    if (MR.isTypeSupported('audio/mp4')) return 'audio/mp4';
    if (MR.isTypeSupported('audio/ogg')) return 'audio/ogg';
    return '';
  };
  const startTimer = () => {
    stopTimer();
    timerRef.current = window.setInterval(() => setSeconds((s) => s + 1), 1000);
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

  // Base64 -> Blob URL
  const base64ToUrl = (base64: string, mime = 'audio/mpeg') => {
    try {
      const byteStr = atob(base64);
      const bytes = new Uint8Array(byteStr.length);
      for (let i = 0; i < byteStr.length; i++) bytes[i] = byteStr.charCodeAt(i);
      const blob = new Blob([bytes], { type: mime });
      const url = URL.createObjectURL(blob);
      objectUrlsRef.current.push(url);
      return url;
    } catch {
      return null;
    }
  };

  // ===== 액션 처리기 =====
  const performAction = (
    actionType: string,
    actionData: any,
    patch: (x: Partial<ChatMessage>) => void,
  ) => {
    switch (actionType) {
      case 'HIGHLIGHT_ELEMENT': {
        const sel = actionData?.elementId as string | undefined;
        if (sel) {
          const el = document.querySelector(sel) as HTMLElement | null;
          if (el) {
            el.classList.add('ring-4', 'ring-primary', 'ring-offset-2', 'rounded-md');
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            setTimeout(() => {
              el.classList.remove('ring-4', 'ring-primary', 'ring-offset-2', 'rounded-md');
            }, 2000);
          }
        }
        break;
      }
      case 'SHOW_VIDEO': {
        const url = actionData?.videoUrl as string | undefined;
        if (url) patch({ videoUrl: url });
        break;
      }
      case 'SPEAK': {
        // speak는 sendTextMessage에서 next.text로 호출
        break;
      }
      default:
        break;
    }
  };

  // ===== 텍스트 메시지 전송 =====
  const sendTextMessage = async (userText: string) => {
    const msg = (userText ?? '').trim();
    if (!msg) return;

    // 1) 사용자 메시지 먼저 화면에 출력
    setMessages((prev) => [...prev, { role: 'user', text: msg }]);

    try {
      const payload: Record<string, any> = { userMessage: msg };
      if (typeof conversationContext === 'string' && conversationContext.length > 0) {
        payload.conversationContext = conversationContext;
      }

      const res = await fetch('/api/public/chat/message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      const raw = await res.text();

      // 2) 타입 유니온으로 파싱
      let json: MessageApiSuccess | MessageApiError | null = null;
      try {
        json = raw ? (JSON.parse(raw) as MessageApiSuccess | MessageApiError) : null;
      } catch {
        // JSON 파싱 실패
      }

      // 3) HTTP 오류 처리
      if (!res.ok) {
        const detail = (json as MessageApiError)?.error?.message ?? raw ?? `HTTP ${res.status}`;
        throw new Error(detail);
      }

      // 4) 성공 응답 체크
      if (!json?.success || !json.data) {
        throw new Error(`Unexpected response: ${raw?.slice(0, 300)}`);
      }

      // 5) 데이터 구조 분해
      const { responseText, actionType, actionData, conversationContext: newCtx } = json.data;

      let next: ChatMessage = { role: 'assistant', text: responseText || '' };

      // 6) 액션 처리 (SHOW_VIDEO 등)
      if (actionType) {
        performAction(actionType, actionData, (patch) => {
          next = { ...next, ...patch };
        });
      }

      // 7) SPEAK 액션이면 즉시 TTS 실행
      if (actionType === 'SPEAK') {
        speak(next.text);
      }

      // 8) 메시지 출력
      setMessages((prev) => [...prev, next]);

      // 9) 컨텍스트 갱신
      if (typeof newCtx === 'string') {
        setConversationContext(newCtx || null);
      }
    } catch (e: any) {
      console.error('[chat/message] failed:', e);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: `서버가 요청을 처리하지 못했습니다.\n상세: ${e?.message ?? e}`,
        },
      ]);
    }
  };

  // 빠른 선택 클릭
  const handleQuickClick = (m: string) => {
    const msg = (m ?? '').trim();
    if (!msg) return;
    sendTextMessage(msg);
  };

  // ===== 음성 녹음/전송 =====
  const handleStartRecording = async () => {
    if (uploading) return;
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        alert('이 브라우저는 녹음을 지원하지 않습니다.');
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
        let wav16: Blob;
        try {
          wav16 = await blobToWav16kMono(raw, 16000);
        } catch (err) {
          console.error('16k 변환 실패, 원본으로 전송', err);
          wav16 = raw;
        }
        await sendSpeech(wav16);
        stopTimer();
        stopTracks();
        setSeconds(0);
      };

      setIsRecording(true);
      setSeconds(0);
      mr.start(100);
      startTimer();
    } catch (e: any) {
      alert(e?.message ?? '마이크 권한을 확인해 주세요.');
    }
  };

  const handleStopRecording = () => {
    if (!isRecording) return;
    setIsRecording(false);
    mediaRef.current?.stop();
  };

  const sendSpeech = async (wavBlob: Blob) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('audioFile', new File([wavBlob], 'speech.wav', { type: 'audio/wav' }));
      if (conversationContext) fd.append('conversationContext', conversationContext);

      const res = await fetch('/api/public/chat/speech', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data: SpeechApiResponse = await res.json();

      if (data.userMessageText) {
        setMessages((prev) => [...prev, { role: 'user', text: data.userMessageText }]);
      }

      let audioUrl: string | undefined;
      if (data.chatbotAudio) {
        audioUrl = base64ToUrl(data.chatbotAudio, 'audio/mpeg') ?? undefined;
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', text: data.chatbotMessageText || '(응답 없음)', audioUrl },
      ]);

      if (data.conversationContext) setConversationContext(data.conversationContext);

      if (data.actionType) {
        // 필요 시 음성 경로에서도 SHOW_VIDEO/HIGHLIGHT 처리 가능
        performAction(data.actionType, data.actionData, () => {});
      }
    } catch (err: any) {
      console.error(err);
      alert('음성 전송 중 오류가 발생했습니다.');
    } finally {
      setUploading(false);
    }
  };

  // UI
  const recordingBadge = isRecording ? (
    <span className="ml-2 inline-flex items-center gap-2 text-red-600 text-sm">
      <span className="inline-block h-2 w-2 rounded-full bg-red-600 animate-pulse" />
      녹음 중… {String(Math.floor(seconds / 60)).padStart(2, '0')}:
      {String(seconds % 60).padStart(2, '0')}
    </span>
  ) : null;

  const handleSendTextClick = () => {
    const msg = value.trim();
    if (!msg) return;
    setValue('');
    sendTextMessage(msg);
  };

  const bottomRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = useCallback(() => {
    // 1) 우선 기준점으로 스무스 스크롤
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });

    // 2) 레이아웃 확정 이후(iframe/audio 로드 등) 강제 보정
    requestAnimationFrame(() => {
      const viewport = bottomRef.current?.closest(
        '[data-radix-scroll-area-viewport]',
      ) as HTMLElement | null;
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-dvh w-full bg-background text-foreground">
          {desktopOpen && (
            <AppSidebar
              className="hidden md:flex sidebar-xl"
              onClose={() => setDesktopOpen(false)}
              fontPx={fontPx}
              setFontPx={setFontPx}
              volume={volume}
              setVolume={setVolume}
            />
          )}

          <div className="flex min-w-0 flex-1 flex-col">
            <div className="chat-topbar flex h-14 shrink-0 items-center gap-2 px-3">
              <Button
                variant="ghost"
                aria-label="뒤로가기"
                className="btn-ghost-brand flex items-center gap-3 px-4 py-2 text-lg font-bold"
                onClick={() => navigate(ROUTING_PATH.home)}
              >
                <ArrowLeft className="h-6 w-6" strokeWidth={3} />
                <span>나가기</span>
              </Button>

              <div className="hidden md:block">
                {!desktopOpen && (
                  <Button
                    variant="ghost"
                    className="btn-ghost-brand flex items-center gap-2"
                    onClick={() => setDesktopOpen(true)}
                    title="사이드바 열기"
                  >
                    <PanelLeftOpen className="h-5 w-5" />
                    <span>메뉴</span>
                  </Button>
                )}
              </div>

              <div className="md:hidden">
                <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                  <SheetTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="사이드바 열기"
                      className="btn-ghost-brand"
                    >
                      <img src={logo2} alt="Logo" className="h-5 w-5 object-contain" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[320px]">
                    <AppSidebar
                      className="block sidebar-xl"
                      fontPx={fontPx}
                      setFontPx={setFontPx}
                      volume={volume}
                      setVolume={setVolume}
                    />
                  </SheetContent>
                </Sheet>
              </div>

              <div className="mx-auto flex items-center gap-2 text-lg text-muted-foreground">
                <CircleUser className="h-4 w-4" /> 구석현
                <Separator orientation="vertical" className="mx-1 h-4" />
                2025년 8월 25일
                {recordingBadge}
              </div>

              <div className="ml-auto flex items-center gap-1">
                <Button size="icon" variant="ghost" aria-label="콜" className="btn-ghost-brand">
                  <Phone className="h-5 w-5" />
                </Button>
                <Button size="icon" variant="ghost" aria-label="알림" className="btn-ghost-brand">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium"
                  >
                    마이페이지
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="bg-popover text-popover-foreground border border-border"
                >
                  <DropdownMenuLabel>내 계정</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>프로필</DropdownMenuItem>
                  <DropdownMenuItem>설정</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>로그아웃</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex min-h-0 flex-1 flex-col chatbot-bg bg-primary/10">
              <ScrollArea className="flex-1">
                <div className="mx-auto w-full max-w-5xl px-2 pb-24 pt-10">
                  {/* 초기 카드: 환영문 + 빠른 선택 */}
                  <div className="relative mx-auto max-w-4xl rounded-2xl border border-border bg-card p-10 text-center">
                    <div className="mx-auto mb-6 grid h-10 w-10 place-items-center rounded-full bg-primary/10 overflow-hidden">
                      <img src={logo2} alt="Logo" className="h-10 w-10 object-contain" />
                    </div>

                    <h2 className="text-2xl md:text-3xl font-semibold whitespace-pre-line">
                      {startLoading ? '준비 중…' : greetingText}
                    </h2>

                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
                      {(quickSelections.length
                        ? quickSelections
                        : [
                            { text: '유산 기부 방법 안내', message: '유산 기부는 어떻게 해요?' },
                            { text: '주변 ATM 찾기 안내', message: 'ATM은 어떻게 찾아요?' },
                            {
                              text: '보이스피싱 진단 안내',
                              message: '보이스피싱은 어떻게 확인해요?',
                            },
                          ]
                      ).map((item, i) => (
                        <Card
                          key={`${item.text}-${i}`}
                          onClick={() => handleQuickClick(item.message)}
                          className="cursor-pointer border border-border transition hover:shadow-md bg-primary/80 text-primary-foreground"
                        >
                          <CardContent className="flex min-h-24 items-center justify-center p-4 text-center">
                            <span className="whitespace-normal break-words text-xl font-semibold leading-relaxed">
                              {item.text}
                            </span>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  <div
                    className="mx-auto mt-6 w-full max-w-5xl space-y-3 px-4 sm:px-6 md:px-8"
                    style={{ ['--chat-font-size' as any]: `${fontPx}px` }}
                  >
                    {decorateMessages(messages).map((node, idx) =>
                      node.type === 'date' ? (
                        <ChatDateDivider key={`d-${idx}-${node.dateKey}`} date={node.dateKey} />
                      ) : (
                        <ChatBubble
                          key={`m-${idx}`}
                          role={node.item.role}
                          text={node.item.text}
                          time={node.item.time}
                          showAvatar={node.item.showAvatar}
                          showTail={node.item.showTail}
                          stackPosition={node.item.stackPosition}
                          audioUrl={node.item.audioUrl}
                          videoUrl={node.item.videoUrl}
                          fontPx={fontPx}
                          volume={volume}
                        />
                      ),
                    )}
                    <div ref={bottomRef} aria-hidden="true" />
                  </div>
                </div>
              </ScrollArea>

              {/* 입력 영역 */}
              <div className="sticky bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex w-full max-w-3xl items-end gap-4 px-5 py-5 text-lg">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="더보기" className="h-12 w-12">
                        <MoreHorizontal className="h-7 w-7" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>첨부</TooltipContent>
                  </Tooltip>

                  <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="궁금한 내용을 적어주세요. (음성 전송은 오른쪽 마이크)"
                    className="min-h-14 flex-1 bg-background text-lg px-4"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendTextClick();
                      }
                    }}
                  />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant={isRecording ? 'destructive' : 'secondary'}
                        size="icon"
                        aria-label="음성 입력"
                        onClick={isRecording ? handleStopRecording : handleStartRecording}
                        disabled={uploading}
                        className={`h-12 w-12 ${uploading ? 'opacity-70' : ''}`}
                        title={isRecording ? '녹음 종료' : '녹음 시작'}
                      >
                        {uploading ? (
                          <Loader2 className="h-7 w-7 animate-spin" />
                        ) : (
                          <Mic className="h-7 w-7" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>{isRecording ? '녹음 종료' : '음성 입력'}</TooltipContent>
                  </Tooltip>

                  <Button
                    size="icon"
                    aria-label="전송"
                    onClick={handleSendTextClick}
                    className="h-12 w-12 ring-offset-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    title="텍스트 전송"
                  >
                    <Send className="h-7 w-7" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    </TooltipProvider>
  );
}
