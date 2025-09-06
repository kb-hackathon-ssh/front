import { useState } from 'react';
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

import {
  ArrowLeft,
  Bell,
  Bot,
  ChevronDown,
  CircleUser,
  Mic,
  MoreHorizontal,
  PanelLeftOpen,
  Phone,
  Send,
} from 'lucide-react';
import AppSidebar from './appsidebar';

export default function Chatbot() {
  const navigate = useNavigate();
  const [value, setValue] = useState('');
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <TooltipProvider>
      <SidebarProvider>
        <div className="flex h-dvh w-full bg-background text-foreground">
          {desktopOpen && (
            <AppSidebar
              className="hidden md:flex sidebar-xl"
              onClose={() => setDesktopOpen(false)}
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
                      <Bot className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="p-0 w-[320px]">
                    <AppSidebar className="block sidebar-xl" />
                  </SheetContent>
                </Sheet>
              </div>
              {/* 사용자 정보 및 날짜 수정 예정 */}
              <div className="mx-auto flex items-center gap-2 text-sm text-muted-foreground">
                <CircleUser className="h-4 w-4" /> 구석현
                <Separator orientation="vertical" className="mx-1 h-4" />
                2025년 8월 25일
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
                <div className="mx-auto w-full max-w-5xl px-4 pb-24 pt-10">
                  <div className="relative mx-auto max-w-3xl rounded-2xl border border-border bg-card p-10 text-center">
                    <div className="mx-auto mb-6 grid h-10 w-10 place-items-center rounded-full bg-primary/10">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>

                    <h2 className="text-lg font-semibold">
                      빠르게 선택해서 안내받으실 수 있습니다
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      자주 묻는 항목을 선택하거나 메시지를 입력해 보세요.
                    </p>

                    <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
                      {[
                        {
                          title: '우리 서비스\n전체적으로\n설명받기',
                          color: 'bg-primary/80 text-primary-foreground',
                        },
                        {
                          title: '챗봇 서비스\n이용 방법',
                          color: 'bg-primary/80 text-primary-foreground',
                        },
                        {
                          title: '현금 인출기\n(ATM 기계)\n위치 찾기\n이용 방법',
                          color: 'bg-primary/80 text-primary-foreground',
                        },
                        {
                          title: '보이스 피싱\n확인하는 서비스\n이용 방법',
                          color: 'bg-primary/80 text-primary-foreground',
                        },
                      ].map((item, i) => (
                        <Card
                          key={i}
                          className={`cursor-pointer border border-border transition hover:shadow-md ${item.color}`}
                        >
                          <CardContent className="flex h-40 items-center justify-center p-4 text-center">
                            <span
                              className="whitespace-pre-line text-base font-semibold leading-snug"
                              dangerouslySetInnerHTML={{
                                __html: item.title.replace(/\n/g, '<br/>'),
                              }}
                            />
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <div className="sticky bottom-0 z-10 border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="mx-auto flex w-full max-w-3xl items-end gap-2 px-4 py-3">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" aria-label="더보기">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>첨부</TooltipContent>
                  </Tooltip>

                  <Input
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="궁금한 내용을 적어주세요."
                    className="min-h-11 flex-1 bg-background"
                  />

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="secondary" size="icon" aria-label="음성 입력">
                        <Mic className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>음성 입력</TooltipContent>
                  </Tooltip>

                  <Button
                    size="icon"
                    aria-label="전송"
                    className="ring-offset-background focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    <Send className="h-4 w-4" />
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
