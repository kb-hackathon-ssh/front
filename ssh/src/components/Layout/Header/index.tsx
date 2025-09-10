import { Link, useLocation } from 'react-router-dom';
import { ROUTING_PATH } from '@/routes/path.constants';
import { MessageSquare, CircleUserRound } from 'lucide-react';
import logo from '@/assets/logo1.png';

const toAbs = (seg: string) => (!seg ? '/' : seg.startsWith('/') ? seg : `/${seg}`);

export default function Header() {
  const { pathname } = useLocation();

  const NAV = [
    { label: '홈페이지', seg: ROUTING_PATH.home },
    { label: '채팅하기', seg: ROUTING_PATH.chatbot },
    { label: '보이스피싱 진단', seg: ROUTING_PATH.voicephishing },
    { label: '주변 ATM 찾기', seg: ROUTING_PATH.atmmap },
    { label: '유산 기부', seg: ROUTING_PATH.donation },
  ] as const;

  const isActive = (seg: string) => {
    const abs = toAbs(seg);
    return abs === '/' ? pathname === '/' : pathname.startsWith(abs);
  };

  const basePill =
    'inline-flex items-center gap-2 rounded-full font-semibold leading-none ' +
    'transition-colors duration-100 ease-out ' +
    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ' +
    'px-8 py-3 text-lg';
  const activePill = 'bg-primary/10 text-primary ring-1 ring-primary/20';
  const inactivePill = 'text-foreground/70 hover:bg-muted active:bg-muted/80';

  return (
    <header className="fixed top-0 z-50 w-full bg-background/90 backdrop-blur supports-[backdrop-filter]:backdrop-blur">
      <div className="mx-auto w-full max-w-screen-2xl px-6 py-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-20">
            <Link to={ROUTING_PATH.home} className="shrink-0">
              <img src={logo} alt="Logo" className="h-10 w-auto object-contain" />
            </Link>

            <nav className="flex flex-nowrap items-center gap-2">
              {NAV.map((item) => {
                const href = toAbs(item.seg);
                const active = isActive(item.seg);
                return (
                  <Link
                    key={item.label}
                    to={href}
                    aria-current={active ? 'page' : undefined}
                    className={[basePill, active ? activePill : inactivePill].join(' ')}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <nav className="flex items-center gap-3">
            <Link
              to={toAbs(ROUTING_PATH.setting)}
              aria-current={isActive(ROUTING_PATH.setting) ? 'page' : undefined}
              className={[
                basePill,
                isActive(ROUTING_PATH.setting) ? activePill : inactivePill,
              ].join(' ')}
            >
              <CircleUserRound className="h-5 w-5" />
              로그인/회원가입
            </Link>

            <Link
              to={toAbs(ROUTING_PATH.chatbot)}
              className={[
                basePill,
                'bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/95',
              ].join(' ')}
            >
              <MessageSquare className="h-5 w-5" />
              채팅 시작하기
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
