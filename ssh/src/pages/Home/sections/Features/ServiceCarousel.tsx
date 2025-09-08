"use client";

import * as React from "react";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";
import { MessagesSquare, MapPinned, Heart, ClipboardCheck } from "lucide-react";

export default function ServiceCarousel() {
  const [api, setApi] = React.useState<CarouselApi | null>(null);
  const [activeIndex, setActiveIndex] = React.useState(0);

  React.useEffect(() => {
    if (!api) return;

    const onSelect = () => setActiveIndex(api.selectedScrollSnap());

    onSelect();
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  const services = [
    {
      icon: <MessagesSquare className="w-10 h-10 text-primary" />,
      title: "간편한 은행 안내 서비스",
      desc: "말로 하시면 글자로 바꿔주고, 글자는 소리로 읽어주는 기능을 지원합니다. 음성으로도, 문자로도 쉽고 편하게 은행 서비스를 이용할 수 있습니다.",
    },
    {
      icon: <MapPinned className="w-10 h-10 text-primary" />,
      title: "ATM 위치 안내",
      desc: "늦은 밤이나 인터넷 뱅킹을 쓰기 어려울 때, 내 주변에서 가까운 ATM을 바로 찾아드립니다. 은행 이름과 이용 가능 시간도 함께 알려주어 편리하고 안전하게 현금을 찾을 수 있습니다.",
    },
    {
      icon: <Heart className="w-10 h-10 text-primary" />,
      title: "사전 유산 서비스",
      desc: "내가 세상을 떠난 후 남은 재산이 어디에 쓰일지 알 수 없을 때, 미리 원하는 곳을 지정해 의미 있게 사용되도록 할 수 있습니다.",
    },
    {
      icon: <ClipboardCheck className="w-10 h-10 text-primary" />,
      title: "보이스 피싱 진단",
      desc: "내가 받은 연락이 혹시 보이스피싱일까? 의심될 때 직접 전화번호 또는 계좌번호를 조회해서 확인하고, 단계별 검사를 통해 자가 진단할 수 있습니다.",
    },
  ];

  return (
    <section className="w-full bg-gray-50 py-20">
      <div className="mx-auto max-w-screen-lg px-6 text-center">
        <p className="text-muted-foreground mb-2">
          우리 서비스를 소개하겠습니다
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold mb-10">
          "이제는 한줄 한줄 직접 대화하는 듯한 설명으로 금융 서비스에 다가가요"
        </h2>

        <Carousel
          className="mx-auto max-w-4xl"
          setApi={setApi}
          opts={{ loop: true, align: "center" }}
        >
          <CarouselContent>
            {services.map((s, i) => (
              <CarouselItem
                key={i}
                className="basis-full md:basis-1/3 px-4 py-12 flex justify-center"
              >
                <div
                  className={`bg-card text-card-foreground rounded-2xl p-6 transition-[transform,box-shadow] duration-300
                  ${
                    activeIndex === i
                      ? "scale-110 shadow-xl"
                      : "scale-95 opacity-75 shadow-md"
                  }`}
                >
                  <div className="mb-4 flex justify-center">{s.icon}</div>
                  <h3 className="text-lg font-semibold mb-2">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{s.desc}</p>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>

          <div className="mt-6 flex items-center justify-center gap-2">
            <CarouselPrevious className="static translate-y-0 top-auto left-auto right-auto h-10 w-10 rounded-full border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80" />
            <div className="mx-1 flex items-center gap-1.5" aria-hidden="true">
              <span className="h-2 w-2 rounded-full bg-primary/30"></span>
              <span className="h-2 w-2 rounded-full bg-primary/30"></span>
              <span className="h-2 w-2 rounded-full bg-primary/30"></span>
            </div>
            <CarouselNext className="static translate-y-0 top-auto left-auto right-auto h-10 w-10 rounded-full border border-border bg-secondary text-secondary-foreground hover:bg-secondary/80" />
          </div>
        </Carousel>
      </div>
    </section>
  );
}
