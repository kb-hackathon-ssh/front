import { useLocation, useNavigate } from "react-router-dom";
import { Menubar, MenubarMenu, MenubarTrigger } from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { ROUTING_PATH } from "@/routes/path.constants";
import { MessageSquare, CircleUserRound } from "lucide-react";

export default function Header() {
  const { pathname } = useLocation();
  const navigate = useNavigate();

  const NAV = [
    { label: "홈페이지", seg: ROUTING_PATH.home },
    { label: "채팅하기", seg: ROUTING_PATH.chatbot },
    { label: "보이스피싱 진단", seg: ROUTING_PATH.voicephishing },
    { label: "주변 ATM 찾기", seg: ROUTING_PATH.atmmap },
    { label: "기부", seg: ROUTING_PATH.donation },
  ] as const;

  const toAbs = (seg: string) => (seg === "" ? "/" : `/${seg}`);

  const handleNav = (seg: string) => {
    navigate(toAbs(seg));
  };

  const isActive = (seg: string) => {
    if (seg === "") return pathname === "/";
    return pathname.startsWith(`/${seg}`);
  };

  const loginActive = isActive(ROUTING_PATH.setting);

  return (
    <header className="fixed top-0 z-50 w-full bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-screen-xl items-center justify-between px-6">
        <Menubar className="border-transparent bg-transparent p-0 shadow-none">
          {NAV.map((item) => (
            <MenubarMenu key={item.label}>
              <MenubarTrigger
                onClick={() => handleNav(item.seg)}
                aria-current={isActive(item.seg) ? "page" : undefined}
                className={[
                  "cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  isActive(item.seg)
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted",
                ].join(" ")}
              >
                {item.label}
              </MenubarTrigger>
            </MenubarMenu>
          ))}
        </Menubar>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => handleNav(ROUTING_PATH.setting)}
            className={[
              "rounded-full px-4 py-2 text-sm font-medium transition-colors",
              loginActive
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted",
            ].join(" ")}
          >
            <CircleUserRound className="mr-2 h-4 w-4" />
            로그인/회원가입
          </Button>

          <Button
            size="sm"
            className="rounded-full"
            onClick={() => handleNav(ROUTING_PATH.chatbot)}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            채팅 시작하기
          </Button>
        </div>
      </div>
    </header>
  );
}
