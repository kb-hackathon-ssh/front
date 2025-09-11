import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  MessageSquare,
  History,
  Users,
  Settings,
  PanelLeftClose,
  Volume2,
  Play,
} from 'lucide-react';
import logo2 from '@/assets/logo2.png';

export default function AppSidebar({
  className = '',
  onClose,
  fontPx,
  setFontPx,
  volume,
  setVolume,
}: {
  className?: string;
  onClose?: () => void;
  fontPx: number;
  setFontPx: (v: number | ((prev: number) => number)) => void;
  volume: number; // 0 ~ 1
  setVolume: (v: number) => void;
}) {
  // 현재 볼륨으로 0.4초 테스트 사운드
  const playTestSound = async () => {
    try {
      const Ctx = (window as any).AudioContext || (window as any).webkitAudioContext;
      if (!Ctx) return;
      const ctx = new Ctx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880;
      gain.gain.value = Math.max(0, Math.min(1, volume));
      osc.connect(gain).connect(ctx.destination);
      osc.start();
      setTimeout(() => {
        osc.stop();
        ctx.close();
      }, 400);
    } catch (e) {
      console.warn('Test sound failed', e);
    }
  };

  return (
    <Sidebar className={className}>
      <SidebarHeader className="bg-background">
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/10 overflow-hidden">
              <img src={logo2} alt="Logo" className="h-5 w-5 object-contain" />
            </div>
            <span className="font-semibold">마음 채팅</span>
          </div>

          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              aria-label="사이드바 닫기"
              className="btn-ghost-brand"
              onClick={onClose}
              title="사이드바 닫기"
            >
              <PanelLeftClose className="h-5 w-5" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="bg-background">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-accent hover:text-accent-foreground">
                  <MessageSquare /> 새 대화
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-accent hover:text-accent-foreground">
                  <History /> 과거 대화
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton className="hover:bg-accent hover:text-accent-foreground">
                  <Users /> 관련 부서 연결
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>

            <div className="mt-4 border-t border-border pt-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Settings className="h-4 w-4" />
                설정
              </div>

              {/* 글자 크기 */}
              <div className="mb-4 space-y-2">
                <div className="chat-subtitle">글자 크기</div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="btn-outline-brand"
                    onClick={() => setFontPx((v) => Math.max(12, Number(v) - 1))}
                    aria-label="글자 작게"
                  >
                    작게
                  </Button>
                  <div className="text-sm text-muted-foreground min-w-12 text-center">
                    {fontPx}px
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="btn-outline-brand"
                    onClick={() => setFontPx((v) => Math.min(24, Number(v) + 1))}
                    aria-label="글자 크게"
                  >
                    크게
                  </Button>
                </div>
                <input
                  type="range"
                  min={12}
                  max={24}
                  step={1}
                  value={fontPx}
                  onChange={(e) => setFontPx(Number(e.target.value))}
                  className="w-full"
                  aria-label="글자 크기 슬라이더"
                />
              </div>

              {/* 음성 출력 볼륨 */}
              <div className="space-y-2">
                <div className="chat-subtitle flex items-center gap-2">
                  <Volume2 className="h-4 w-4" />
                  음성 출력 볼륨
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Math.round(volume * 100)}
                    onChange={(e) => setVolume(Number(e.target.value) / 100)}
                    className="w-full"
                    aria-label="음성 볼륨 슬라이더"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    aria-label="테스트 사운드"
                    title="현재 볼륨으로 테스트 사운드 재생"
                    onClick={playTestSound}
                  >
                    <Play className="h-4 w-4" />
                  </Button>
                </div>
                <div className="text-xs text-muted-foreground">{Math.round(volume * 100)}%</div>
              </div>
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="bg-background border-t border-border">
        <Card className="mx-2 mb-2 bg-card border border-border">
          <CardHeader className="py-3">
            <CardTitle className="text-sm">이런 기능이 있으면 좋겠어요!</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <p className="text-xs text-muted-foreground">개선하면 좋을 점을 추천해주세요!</p>
            <Button className="mt-2 w-full" size="sm">
              작성하러 가기
            </Button>
          </CardContent>
        </Card>
      </SidebarFooter>
    </Sidebar>
  );
}
