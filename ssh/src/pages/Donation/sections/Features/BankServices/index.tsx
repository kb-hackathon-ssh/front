import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function BankServices() {
  return (
    <section id="bank-services" className="w-full bg-blue-50">
      <div className="mx-auto max-w-screen-xl px-6 py-14">
        <h3 className="text-xl font-semibold md:text-2xl">은행에서 제공하는 기부 서비스</h3>

        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg">고향사랑기부 · KB 국민은행</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground md:text-base">
              <p>
                고향과 지역사회를 응원하는 나눔. 거주지가 아닌 지역에도 기부할 수 있는 제도입니다.
              </p>
              <p className="mt-2">
                세액공제 혜택과 답례품을 통해 기부의 기쁨을 두 배로 느껴보세요.
              </p>
            </CardContent>
          </Card>

          <Card className="rounded-xl shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-base md:text-lg">학교사랑기부 · KB 국민은행</CardTitle>
            </CardHeader>
            <CardContent className="text-sm leading-7 text-muted-foreground md:text-base">
              <p>
                작은 참여로 이어지는 큰 나눔. 걸음수·좋아요 미션으로 모은 성과가 학생들을 위한
                장학금으로 전달됩니다.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
