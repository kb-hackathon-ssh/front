import { memo } from 'react';
import { cn } from '@/lib/utils'; // shadcn 유틸(없으면 className join 함수로 대체)
import logo2 from '@/assets/logo2.png';
import { CircleUser } from 'lucide-react';

export type ChatRole = 'user' | 'assistant';

export type ChatBubbleProps = {
  role: ChatRole;
  text: string;
  time?: string; // "오후 3:21" 같은 표시용
  showAvatar?: boolean; // 첫 말풍선에만 아바타
  showTail?: boolean; // 묶음의 마지막 말풍선에만 꼬리
  stackPosition?: 'single' | 'top' | 'mid' | 'bottom';
  audioUrl?: string;
  videoUrl?: string;
  fontPx?: number; // 글자 크기 동기화
  volume?: number;
};

function formatText(t: string) {
  return t.replace(/\n/g, '\n');
}

export const ChatBubble = memo(function ChatBubble({
  role,
  text,
  time,
  showAvatar = false,
  showTail = true,
  stackPosition = 'single',
  audioUrl,
  videoUrl,
  fontPx = 16,
  volume = 0.8,
}: ChatBubbleProps) {
  const isUser = role === 'user';

  return (
    <div
      className={cn('flex w-full items-end gap-2', isUser ? 'justify-end' : 'justify-start')}
      style={{ ['--chat-font-size' as any]: `${fontPx}px` }}
    >
      {/* 왼쪽 아바타 (assistant) */}
      {!isUser && (
        <div className="w-7 shrink-0 self-end">
          {showAvatar ? (
            <div className="h-7 w-7 overflow-hidden rounded-full border border-border bg-primary/10 grid place-items-center">
              <img src={logo2} alt="bot" className="h-full w-full object-contain" />
            </div>
          ) : (
            <div className="h-7 w-7" />
          )}
        </div>
      )}

      {/* 말풍선 + 시간 */}
      <div className={cn('flex max-w-[90%] items-end', isUser ? 'flex-row-reverse' : 'flex-row')}>
        <div
          className={cn(
            'kakao-bubble whitespace-pre-wrap px-3.5 py-2.5 text-[length:var(--chat-font-size)]',
            'rounded-2xl',
            isUser ? 'user' : 'assistant',
            showTail && 'tail',
            stackPosition === 'single' && 'rounded-2xl',
            stackPosition === 'top' && 'stack-top',
            stackPosition === 'mid' && 'stack-mid',
            stackPosition === 'bottom' && 'stack-bottom',
          )}
        >
          {formatText(text)}

          {videoUrl && (
            <div className="mt-2">
              <div className="aspect-video w-[72vw] max-w-[520px] overflow-hidden rounded-lg border">
                <iframe
                  className="h-full w-full"
                  src={
                    videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')
                      ? videoUrl.replace('watch?v=', 'embed/')
                      : videoUrl
                  }
                  title="안내 영상"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            </div>
          )}

          {audioUrl && (
            <audio
              className="mt-2 w-[72vw] max-w-[520px]"
              controls
              src={audioUrl}
              autoPlay={false}
              onLoadedMetadata={(e) => {
                const el = e.currentTarget as HTMLAudioElement;
                el.volume = Math.max(0, Math.min(1, volume));
              }}
            />
          )}
        </div>

        {/* 시간 */}
        {time && (
          <div className={cn('kakao-time mx-2', isUser ? 'order-0' : 'order-2')}>{time}</div>
        )}
      </div>

      {/* 오른쪽 아바타 (user) */}
      {isUser && (
        <div className="w-7 shrink-0 self-end">
          {showAvatar ? (
            <div className="h-7 w-7 grid place-items-center rounded-full border border-border bg-muted">
              <CircleUser className="h-4 w-4" />
            </div>
          ) : (
            <div className="h-7 w-7" />
          )}
        </div>
      )}
    </div>
  );
});
