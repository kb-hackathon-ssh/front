export default function Hero() {
  return (
    <section id="hero" className="w-full bg-blue-50">
      <div className="mx-auto max-w-screen-xl px-6 py-10 md:py-14">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          당신의 뜻, 사회에 이어집니다
        </h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground md:text-lg">
          평생 모은 재산을 원하는 곳에 기부하세요.
          <br className="hidden sm:block" />
          복잡한 절차 없이, 사전에 간단히 등록하면 사후에도 안전하게 뜻이 전달됩니다.
        </p>
      </div>
    </section>
  );
}
