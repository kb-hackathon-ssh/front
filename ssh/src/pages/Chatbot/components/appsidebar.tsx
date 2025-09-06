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
import { Bot, MessageSquare, History, Users, Settings, PanelLeftClose } from 'lucide-react';

export default function AppSidebar({
  className = '',
  onClose,
}: {
  className?: string;
  onClose?: () => void;
}) {
  return (
    <Sidebar className={className}>
      <SidebarHeader className="bg-background">
        <div className="flex items-center justify-between px-2 py-1.5">
          <div className="flex items-center gap-2">
            <div className="grid h-7 w-7 place-items-center rounded-full bg-primary/10">
              <Bot className="h-4 w-4 text-primary" />
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

            {/* 수정 예정 */}
            <div className="mt-4 border-t border-border pt-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <Settings className="h-4 w-4" />
                설정
                <span className="chat-chip">준비중</span>
              </div>

              <div className="mb-4 space-y-2">
                <div className="chat-subtitle">글자 크기</div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="btn-outline-brand" disabled>
                    작게
                  </Button>
                  <div className="text-sm text-muted-foreground">14px</div>
                  <Button variant="outline" size="sm" className="btn-outline-brand" disabled>
                    크게
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <div className="chat-subtitle">음성 출력 볼륨</div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  defaultValue={80}
                  className="w-full opacity-60"
                  disabled
                />
                <div className="text-xs text-muted-foreground">80% (미구현)</div>
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
