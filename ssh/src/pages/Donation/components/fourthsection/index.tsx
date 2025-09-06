import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ShieldCheck, Building2, HandCoins, FileSignature, ReceiptText } from 'lucide-react';
import { Link } from 'react-router-dom';

// 추후 추가 페이지 생성
const REGISTER_PATH = '/donation/register';
const BANK_LINK_PATH = '/donation/banks';

type Step = {
  title: string;
  desc: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

const STEPS: Step[] = [
  {
    title: '본인 확인 및 동의',
    desc: '전용 로그인으로 본인 확인 후, 사전기부 안내에 동의합니다.',
    icon: ShieldCheck,
  },
  {
    title: '금액/비율 지정',
    desc: '정액 또는 비율로 기부 범위를 설정합니다. 생전 언제든 수정·철회 가능합니다.',
    icon: HandCoins,
  },
  {
    title: '은행 기부 기능 연동',
    desc: 'KB국민은행 ‘공식 기부 기능’과 연동되어 안전하게 등록됩니다.',
    icon: FileSignature,
  },
  {
    title: '기부처 선택',
    desc: '병원·학교·비영리단체 등 은행에서 제공하는 원하는 곳을 고릅니다.',
    icon: Building2,
  },
  {
    title: '등록 완료 · 사후 집행',
    desc: '사후에 지정한 내용대로 기부가 집행되고, 영수증이 발급됩니다.',
    icon: ReceiptText,
  },
];

export default function Steps() {
  return (
    <section id="steps" aria-labelledby="steps-title" className="w-full">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-10 px-6 py-14 lg:grid-cols-2">
        <div>
          <h3 id="steps-title" className="text-xl font-semibold md:text-2xl">
            기부 신청 방법 (단계별 안내)
          </h3>

          <ol role="list" className="mt-8 space-y-8">
            {STEPS.map((s, idx) => {
              const Icon = s.icon;
              return (
                <li key={s.title} className="relative">
                  <div className="absolute left-3 top-6 bottom-0 w-px bg-border" aria-hidden />
                  <span className="absolute left-0 top-0 grid h-6 w-6 place-items-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                    {idx + 1}
                  </span>

                  <div className="pl-10">
                    <div className="flex items-start gap-3">
                      <Icon className="mt-0.5 h-5 w-5 text-primary" aria-hidden />
                      <div>
                        <h4 className="text-base font-medium">{s.title}</h4>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">{s.desc}</p>
                      </div>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="flex">
          <Card className="my-auto w-full rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg">신청하기</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm leading-6 text-muted-foreground md:text-base">
              <p>
                등록 내용은 생전 언제든 <b className="text-foreground">수정·철회</b>할 수 있습니다.
              </p>
              <p>
                <b className="text-foreground">기부금 영수증</b> 발급 및 연말정산 연계가 가능합니다.
              </p>
              <p>
                개인·계좌 정보는 은행 시스템에서 <b className="text-foreground">암호화</b>되어
                처리됩니다.
              </p>

              <div className="pt-2 flex flex-col gap-3 sm:flex-row">
                <Button asChild className="rounded-full">
                  <Link to={REGISTER_PATH}>기부 의사 등록하기</Link>
                </Button>
                <Button asChild variant="ghost" className="rounded-full">
                  <Link to={BANK_LINK_PATH}>은행 연동 안내</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
