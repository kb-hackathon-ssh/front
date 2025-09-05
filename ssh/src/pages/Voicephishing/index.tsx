import { useState, useCallback } from 'react';
import { Phone, CreditCard, ShieldAlert } from 'lucide-react';

const VoicephishingPage = () => {
  const [input, setInput] = useState('');
  const [type, setType] = useState<'phone' | 'account'>('phone');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<
    Array<{
      id: string;
      type: 'phone' | 'account';
      value: string;
      reports: number;
      lastReported?: string;
      source?: string;
      risk?: 'low' | 'medium' | 'high';
    }>
  >([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleLookup = useCallback(() => {
    const q = input.trim();
    setHasSearched(true);
    setError(null);
    if (!q) {
      setResults([]);
      setIsLoading(false);
      setError(type === 'phone' ? '전화번호를 입력해 주세요.' : '계좌번호를 입력해 주세요.');
      return;
    }
    setIsLoading(true);
    // 백엔드 연동 전이므로 즉시 완료 처리
    setResults([]);
    setIsLoading(false);
  }, [input, type]);

  return (
    <main className="w-full bg-white">
      <section className="relative isolate h-[500px] md:h-[560px] w-full">
        <img
          src="/images/voicephishing-bg.jpg"
          alt="보이스피싱 배경"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/40 to-black/80" />

        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-center px-4 text-center text-white">
          <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs tracking-tight backdrop-blur-sm">
            <ShieldAlert className="h-4 w-4" />
            안전한 금융생활을 위한 신고·조회 허브
          </span>
          <h1 className="text-4xl font-extrabold leading-tight md:text-[42px]">
            의심 번호 조회 서비스
          </h1>
          <p className="mt-3 max-w-2xl text-sm md:text-base text-white/85">
            보이스피싱이 의심되는 전화번호 혹은 계좌번호를 조회해
            <br className="hidden md:block" />
            관련 신고 및 접수 횟수를 바로 확인하세요.
          </p>
        </div>

        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 w-full px-4">
          <div className="flex flex-col items-center">
            <div className="pointer-events-auto relative mx-auto max-w-3xl w-full rounded-3xl bg-white/90 shadow-2xl backdrop-blur-xl ring-1 ring-black/5">
              <div className="flex items-stretch w-full">
                <div className="flex items-center pl-2 pr-3">
                  <div className="inline-flex rounded-full bg-gray-100 p-1">
                    <button
                      type="button"
                      aria-pressed={type === 'phone'}
                      onClick={() => setType('phone')}
                      className={`px-3 py-1.5 text-sm rounded-full ${type === 'phone' ? 'bg-white shadow text-emerald-700' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                      전화번호
                    </button>
                    <button
                      type="button"
                      aria-pressed={type === 'account'}
                      onClick={() => setType('account')}
                      className={`px-3 py-1.5 text-sm rounded-full ${type === 'account' ? 'bg-white shadow text-emerald-700' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                      계좌번호
                    </button>
                  </div>
                </div>

                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleLookup();
                  }}
                  className="flex-1 w-full"
                >
                  <input
                    aria-label={type === 'phone' ? '전화번호 입력' : '계좌번호 입력'}
                    aria-describedby="lookup-helper"
                    inputMode={type === 'phone' ? 'tel' : 'numeric'}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder={
                      type === 'phone'
                        ? '의심되는 전화번호를 입력하세요 (예: 010-1234-5678)'
                        : '의심되는 계좌번호를 입력하세요 (숫자만)'
                    }
                    className="w-full bg-transparent pl-4 py-3 rounded-2xl text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 border-0 caret-emerald-600"
                  />
                </form>
              </div>
            </div>
            <p
              id="lookup-helper"
              className="mx-auto mt-2 max-w-4xl px-2 text-center text-xs text-gray-500"
            >
              {type === 'phone'
                ? '예: 010-1234-5678 (하이픈 없이도 가능)'
                : '예: 숫자만 입력하세요'}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto mt-8 max-w-5xl px-4">
        {isLoading && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-700 shadow-sm">
            조회 중입니다…
          </div>
        )}
        {!isLoading && error && (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
            {error}
          </div>
        )}
        {!isLoading && !error && hasSearched && results.length === 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600 shadow-sm">
            검색 결과가 없습니다.
          </div>
        )}
        {!isLoading && !error && results.length > 0 && (
          <ul className="space-y-3">
            {results.map((r) => (
              <li key={r.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm text-gray-500">
                      {r.type === 'phone' ? '전화번호' : '계좌번호'}
                    </div>
                    <div className="text-base font-semibold text-gray-900">{r.value}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">신고 횟수</div>
                    <div className="text-lg font-bold text-emerald-600">{r.reports}건</div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {r.lastReported ? `최근 신고일: ${r.lastReported}` : '최근 신고일: -'}
                  </span>
                  <span>{r.source ? `출처: ${r.source}` : ''}</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto mt-16 mb-12 grid max-w-6xl grid-cols-1 gap-6 px-4 md:mt-20 md:grid-cols-3">
        <StatCard
          title="최근 신고 데이터"
          value="실시간"
          caption="DB 연동"
          icon={<ShieldAlert className="h-5 w-5" />}
        />
        <StatCard
          title="전화 신고"
          value="10건 이상"
          caption="통화 피해 건수"
          accent
          icon={<Phone className="h-5 w-5" />}
        />
        <StatCard
          title="문자 신고"
          value="50건 이상"
          caption="스미싱/문자"
          accent
          icon={<CreditCard className="h-5 w-5" />}
        />
      </section>
    </main>
  );
};

const StatCard = ({
  title,
  value,
  caption,
  accent,
  icon,
}: {
  title: string;
  value: string;
  caption: string;
  accent?: boolean;
  icon?: React.ReactNode;
}) => {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-3 flex items-center gap-2 text-gray-600">
        <span
          className={`inline-flex h-8 w-8 items-center justify-center rounded-xl ${accent ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-600'}`}
        >
          {icon}
        </span>
        <span className="text-sm font-medium">{title}</span>
      </div>
      <div className={`text-2xl font-extrabold ${accent ? 'text-emerald-600' : 'text-gray-900'}`}>
        {value}
      </div>
      <div className="mt-1 text-sm text-gray-500">{caption}</div>
    </div>
  );
};

export default VoicephishingPage;
