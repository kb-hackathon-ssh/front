import { Separator } from "@/components/ui/separator";
import { Github, Slack, Instagram } from "lucide-react";

type LinkItem = { label: string; href: string };
type LinkGroup = { title: string; links: LinkItem[] };

const linkGroups: LinkGroup[] = [
  {
    title: "서비스 안내",
    links: [
      { label: "은행 서비스 배우기", href: "#" },
      { label: "ATM 위치 찾기", href: "#" },
      { label: "보이스 피싱 자가 진단하기", href: "#" },
      { label: "보이스 피싱 관련 정보 조회하기", href: "#" },
      { label: "기부하기", href: "#" },
      { label: "자주 묻는 질문", href: "#" },
    ],
  },
  {
    title: "고객 지원",
    links: [
      { label: "고객 센터", href: "#" },
      { label: "문의하기", href: "#" },
    ],
  },
  {
    title: "약관 및 정책",
    links: [
      { label: "이용 약관", href: "#" },
      { label: "개인정보 처리방침", href: "#" },
      { label: "위치 기반 서비스 이용약관", href: "#" },
    ],
  },
  {
    title: "회사 정보",
    links: [
      { label: "회사 소개", href: "#" },
      { label: "채용 안내", href: "#" },
      { label: "직원 소개", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className=" w-full max-w-screen-xl bg-white text-stone-700 
        mx-auto 
        justify-self-center self-center"
    >
      <div className="px-6 py-12">
        <div className="mb-10 flex justify-center">
          <div className="rounded border border-dashed px-8 py-6 text-sm font-semibold text-stone-800">
            Logo
          </div>
        </div>

        <div className="grid gap-10 text-center sm:grid-cols-2 lg:grid-cols-4">
          {linkGroups.map((group) => (
            <nav key={group.title}>
              <h3 className="mb-4 text-sm font-semibold text-stone-900">
                {group.title}
              </h3>
              <ul className="space-y-3 text-sm text-stone-600">
                {group.links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="hover:text-stone-900 hover:underline"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <Separator className="my-8" />

        <div className="flex items-center justify-center gap-6 py-2">
          <a
            aria-label="Github"
            href="#"
            className="transition hover:opacity-80"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            aria-label="Slack"
            href="#"
            className="transition hover:opacity-80"
          >
            <Slack className="h-5 w-5" />
          </a>
          <a
            aria-label="Instagram"
            href="#"
            className="transition hover:opacity-80"
          >
            <Instagram className="h-5 w-5" />
          </a>
        </div>

        <Separator className="my-8" />

        <div className="grid gap-8 md:grid-cols-2">
          <div className="text-sm text-stone-500">
            <p className="mb-4">© 2025 SSH All Rights Reserved.</p>
            <p className="font-medium text-stone-700">(주) 마음 잇는 목소리</p>
            <p>사업자 등록번호 : 123-45-67890 | 대표 : 성소희</p>
            <p>
              호스팅 서비스 : (주) 마음 잇는 목소리 | 통신판매업 신고번호 :
              2025-서울중구-00001 사업자정보확인
            </p>
            <p>04520 서울특별시 중구 세종대로 110, 7층 (펜텀타워, 신어타워)</p>
            <p>고객센터 : 1234-0000 | 이메일 : 마음잇는목소리@gmail.com</p>
          </div>

          <div className="text-sm text-stone-500">
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:underline">
                  이용약관
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  개인정보 처리방침
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  위치기반서비스 이용약관
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  영상정보처리기기 운영·관리 방침
                </a>
              </li>
              <li>
                <a href="#" className="hover:underline">
                  금융소비자보호 안내
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-stone-400">
          All Rights Reserved
        </div>
      </div>
    </footer>
  );
}
