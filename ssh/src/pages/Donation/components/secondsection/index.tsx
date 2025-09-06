export default function Meaning() {
  return (
    <section id="meaning" className="w-full">
      <div className="mx-auto grid max-w-screen-xl grid-cols-1 gap-8 px-6 py-14 md:grid-cols-2 md:gap-12">
        {/* 이미지 교체 예정 */}
        <div className="aspect-[4/3] w-full rounded-xl bg-muted shadow-sm" aria-hidden />
        <div className="flex flex-col justify-center">
          <h2 className="text-xl font-semibold md:text-2xl">
            당신의 재산, 뜻깊은 나눔으로 이어집니다
          </h2>
          <div className="mt-4 space-y-4 leading-7 text-muted-foreground">
            <p>
              삶은 언제 끝날지 알 수 없지만, 그 뜻은 사라지지 않아야 합니다. 평생 모은 재산이 내
              의도와 다르게 흘러가는 대신, 사회에 의미 있게 쓰이길 바라는 마음을 지켜드립니다.
            </p>
            <p>
              이 서비스는 장기기증처럼{' '}
              <b className="text-foreground">생전에 미리 기부 의사를 등록</b>하면, 사후에도{' '}
              <b className="text-foreground">안전하고 투명하게</b> 나눔이 이어지도록 돕습니다.
            </p>
            <p className="text-foreground">
              모든 기부 절차는 은행에서 제공하는 <b>공식 기부 기능</b>과 연동되어 처리됩니다.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
