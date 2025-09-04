import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative isolate w-full bg-background pb-16">
      <div
        aria-hidden
        className="
          absolute left-1/2 -translate-x-1/2 z-0
          w-[100vw] h-[100vw] -top-[50vw]
          rounded-full
          bg-[radial-gradient(ellipse_at_center,_#ecfdf5_0%,_#e6fff5_35%,_#d1fae5_65%,_#a7f3d0_100%)]
        "
      />

      <div className="relative z-10 mx-auto w-full max-w-screen-lg px-6">
        <div className="h-[50vw] flex flex-col items-center justify-center text-center gap-4 sm:gap-6 md:gap-8">
          <h1 className="text-4xl font-extrabold sm:text-2xl md:text-6xl">
            <span className="block">대화로 이어지는 당신의 금융 동반자</span>
            <span className="block mt-4">마음잇는 목소리</span>
          </h1>

          <p className="text-base text-muted-foreground sm:text-lg">
            우리 사이트 한줄 소개
          </p>

          <Waveform className="h-28 w-full max-auto" />

          <h2 className="text-2xl font-semibold sm:text-3xl">
            지금 바로 사용해보세요
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-5">
            <Button
              size="lg"
              className="rounded-full px-20 py-8 text-2xl shadow-md hover:shadow-lg"
            >
              시작하기
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="rounded-full px-20 py-8 text-2xl shadow-md hover:shadow-lg"
            >
              더 알아보기
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Waveform({ className = "" }: { className?: string }) {
  const base = [
    60, 96, 78, 64, 72, 66, 56, 82, 60, 82, 56, 66, 72, 64, 78, 96, 60,
  ];
  const scale = 1.4;
  const mid = 60;
  const vbH = 120;

  const scaled = base.map((h) => h * scale);
  const maxH = Math.max(...scaled);
  const safety = 0.95;
  const fit = Math.min(1, (vbH * safety) / maxH);
  const heights = scaled.map((h) => h * fit);

  return (
    <svg
      viewBox="0 0 520 120"
      className={className + " drop-shadow-[0_6px_12px_rgba(2,132,199,0.20)]"}
      role="img"
      aria-label="음성 파형"
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="waveBar" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#67e8f9" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {heights.map((h, i) => {
        const barW = 16;
        const gap = 14;
        const x = 20 + i * (barW + gap);
        const y = mid - h / 2;
        const delay = (i % 6) * 0.08;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width={barW}
            height={h}
            rx={8}
            fill="url(#waveBar)"
            className="origin-center animate-[pulse_2.2s_ease-in-out_infinite]"
            style={{ animationDelay: `${delay}s` }}
          />
        );
      })}
    </svg>
  );
}
