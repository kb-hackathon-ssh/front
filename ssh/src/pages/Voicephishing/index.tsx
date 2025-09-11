import { useState, useCallback, useEffect } from 'react';
import { Phone, CreditCard, ShieldAlert } from 'lucide-react';

// index.tsx 상단 util 추가
const onlyDigits = (v: string) => v.replace(/\D/g, '');

const normalizeForType = (value: string, type: 'phone' | 'account') => {
  const digits = onlyDigits(value);
  if (type === 'phone') return digits; // 010xxxxxxxx 형태
  return digits; // 계좌도 숫자만
};

const isValid = (value: string, type: 'phone' | 'account') => {
  const digits = onlyDigits(value);
  if (type === 'phone') {
    // 010/011/016/017/018/019 + 7~8자리
    return /^01[016789]\d{7,8}$/.test(digits);
  }
  // 계좌는 은행별 길이가 달라 느슨히 최소 8자리 이상으로 체크
  return /^\d{8,20}$/.test(digits);
};

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
      lastReported: string;
      risk: 'low' | 'medium' | 'high';
    }>
  >([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [recentReports, setRecentReports] = useState<
    Array<{
      id: string;
      type: 'phone' | 'account';
      value: string;
      lastReported: string;
    }>
  >([]);

  useEffect(() => {
    let aborted = false;

    const load = async () => {
      try {
        const res = await fetch('/api/reports/recent');
        if (!res.ok) throw new Error();
        if (res.status === 204) {
          // No Content
          if (!aborted) setRecentReports([]);
          return;
        }
        const data = await res.json();
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray((data as any)?.data?.items))
          list = (data as any).data.items; // ✅ support nested items
        else if (Array.isArray((data as any)?.data)) list = (data as any).data;
        else if (Array.isArray((data as any)?.content)) list = (data as any).content;
        else if (Array.isArray((data as any)?.items)) list = (data as any).items;
        else if (data && typeof data === 'object') list = [data];
        else list = [];

        const mapped = list.map((item: any) => ({
          id: item.id ?? '',
          type: item.type === 'phone' || item.type === 'account' ? item.type : 'phone',
          value: item.value ?? '',
          lastReported: item.lastReported
            ? new Date(item.lastReported).toISOString().split('T')[0]
            : '-',
        }));
        if (!aborted) setRecentReports(mapped);
      } catch {
        if (!aborted) setRecentReports([]);
      }
    };

    load();
    const t = setInterval(load, 15000); // 15초마다 갱신
    return () => {
      aborted = true;
      clearInterval(t);
    };
  }, []);

  // 타입 전환 시 입력 및 상태 초기화
  const switchType = useCallback((next: 'phone' | 'account') => {
    setType(next);
    setInput('');
    setResults([]);
    setHasSearched(false);
    setError(null);
    setNotice(null);
    setReportingId(null);
  }, []);

  const submitReport = useCallback(
    async (payload: { type: 'phone' | 'account'; value: string }) => {
      const key = `${payload.type}:${payload.value}`;
      setReportingId(key);
      setError(null);
      setNotice(null);
      try {
        const res = await fetch('/api/reports', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) {
          const text = await res.text().catch(() => '');
          throw new Error(text || '신고에 실패했습니다. 다시 시도해 주세요.');
        }
        setNotice('신고가 접수되었습니다. 감사합니다.');
        // 신고 접수 후, 최근 신고 목록을 즉시 갱신
        try {
          const recentRes = await fetch('/api/reports/recent');
          if (recentRes.ok && recentRes.status !== 204) {
            const data = await recentRes.json();
            let list: any[] = [];
            if (Array.isArray(data)) list = data;
            else if (Array.isArray((data as any)?.data)) list = (data as any).data;
            else if (Array.isArray((data as any)?.content)) list = (data as any).content;
            else if (Array.isArray((data as any)?.items)) list = (data as any).items;
            else if (data && typeof data === 'object') list = [data];
            const mapped = list.map((item: any) => ({
              id: item.id ?? '',
              type: item.type === 'phone' || item.type === 'account' ? item.type : 'phone',
              value: item.value ?? '',
              lastReported: item.lastReported
                ? new Date(item.lastReported).toISOString().split('T')[0]
                : '-',
            }));
            setRecentReports(mapped);
          }
        } catch {}
      } catch (e: any) {
        setError(e?.message || '신고 처리 중 오류가 발생했습니다.');
      } finally {
        setReportingId(null);
      }
    },
    [],
  );

  const handleLookup = useCallback(() => {
    const raw = input.trim();
    setHasSearched(true);
    setError(null);
    if (!raw) {
      setResults([]);
      setIsLoading(false);
      setError(type === 'phone' ? '전화번호를 입력해 주세요.' : '계좌번호를 입력해 주세요.');
      return;
    }

    const q = normalizeForType(raw, type);
    if (!isValid(q, type)) {
      setResults([]);
      setIsLoading(false);
      setError(
        type === 'phone' ? '전화번호 형식을 확인해 주세요.' : '계좌번호 형식을 확인해 주세요.',
      );
      return;
    }

    setIsLoading(true);
    fetch(`/api/lookup?type=${type}&q=${encodeURIComponent(q)}`)
      .then(async (res) => {
        if (!res.ok) {
          // 백엔드가 400과 함께 메시지를 주면 노출
          const text = await res.text().catch(() => '');
          throw new Error(text || '조회에 실패했습니다. 다시 시도해 주세요.');
        }
        const data = await res.json();
        let list: any[] = [];
        if (Array.isArray(data)) list = data;
        else if (Array.isArray((data as any)?.data?.items))
          list = (data as any).data.items; // ✅ support nested items in { data: { items: [...] } }
        else if (Array.isArray((data as any)?.data))
          list = (data as any).data; // e.g., { data: [...] }
        else if (Array.isArray((data as any)?.content))
          list = (data as any).content; // e.g., Spring Page
        else if (Array.isArray((data as any)?.items)) list = (data as any).items;
        else if (data && typeof data === 'object')
          list = [data]; // single object -> wrap
        else list = [];

        const mappedResults = list.map((item: any) => ({
          id: item.id ?? '',
          type: item.type === 'phone' || item.type === 'account' ? item.type : type,
          value: item.value ?? q,
          reports: typeof item.reports === 'number' ? item.reports : 0,
          lastReported: item.lastReported
            ? new Date(item.lastReported).toISOString().split('T')[0]
            : '-',
          risk: (['low', 'medium', 'high'] as const).includes(item.risk)
            ? item.risk
            : typeof item.reports === 'number' && item.reports >= 10
              ? 'high'
              : typeof item.reports === 'number' && item.reports >= 3
                ? 'medium'
                : 'low',
        }));
        setResults(mappedResults);
      })
      .catch((err) => {
        setError(err.message || '조회 중 오류가 발생했습니다.');
        setResults([]);
      })
      .finally(() => setIsLoading(false));
  }, [input, type]);

  return (
    <main className="w-full bg-white">
      <section className="relative isolate h-[500px] md:h-[560px] w-full">
        <img
          src="src/assets/voicephishing-bg.png"
          alt="보이스피싱 배경"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/30 to-black/50" />

        <div className="relative z-10 mx-auto flex h-full max-w-5xl flex-col items-center justify-start px-4 text-center text-white pt-10 md:pt-16">
          <span className="mb-10 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm md:text-base tracking-tight backdrop-blur-sm">
            <ShieldAlert className="h-4 w-4" />
            안전한 금융생활을 위한 신고·조회 허브
          </span>

          <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
            의심 번호 조회 서비스
          </h1>

          <p className="mt-8 max-w-2xl text-base md:text-lg text-white/85">
            보이스피싱이 의심되는 전화번호 혹은 계좌번호를 조회해
            <br className="hidden md:block" />
            관련 신고 및 접수 횟수를 바로 확인하세요.
          </p>
        </div>

        <div className="absolute bottom-20 left-1/2 -translate-x-1/2 z-20 w-full px-4">
          <div className="flex flex-col items-center">
            <div className="pointer-events-auto relative mx-auto max-w-3xl w-full rounded-3xl bg-white/90 shadow-2xl backdrop-blur-xl ring-1 ring-black/5">
              <div className="flex items-stretch w-full">
                <div className="flex items-center pl-2 pr-3">
                  <div className="inline-flex rounded-full bg-gray-100 p-1">
                    <button
                      type="button"
                      aria-pressed={type === 'phone'}
                      onClick={() => switchType('phone')}
                      className={`px-3 py-1.5 text-sm rounded-full ${type === 'phone' ? 'bg-white shadow text-emerald-700' : 'text-gray-600 hover:text-gray-800'}`}
                    >
                      전화번호
                    </button>
                    <button
                      type="button"
                      aria-pressed={type === 'account'}
                      onClick={() => switchType('account')}
                      className={`px-4 py-2 text-sm rounded-full ${type === 'account' ? 'bg-white shadow text-emerald-700' : 'text-gray-600 hover:text-gray-800'}`}
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
                  <div className="relative w-full">
                    <input
                      aria-label={type === 'phone' ? '전화번호 입력' : '계좌번호 입력'}
                      aria-describedby="lookup-helper"
                      inputMode={type === 'phone' ? 'tel' : 'numeric'}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={
                        type === 'phone'
                          ? '의심되는 전화번호를 입력하세요'
                          : '의심되는 계좌번호를 입력하세요'
                      }
                      className="w-full bg-transparent pl-5 pr-36 py-4 rounded-2xl text-lg text-gray-900 placeholder:text-gray-400 outline-none focus:outline-none focus:ring-0 border-0 caret-emerald-600"
                    />
                    <button
                      type="button"
                      onClick={() => submitReport({ type, value: normalizeForType(input, type) })}
                      disabled={
                        !isValid(normalizeForType(input, type), type) ||
                        reportingId === `${type}:${normalizeForType(input, type)}`
                      }
                      className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-50 shadow-sm"
                      aria-label="신고하기"
                      title="신고하기"
                    >
                      {reportingId === `${type}:${normalizeForType(input, type)}`
                        ? '신고 중…'
                        : '신고하기'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
            <p
              id="lookup-helper"
              className="mx-auto mt-2 max-w-4xl px-2 text-center text-base text-white"
            >
              {type === 'phone' ? '예: 010-1234-5678' : '예: 숫자만 입력하세요'}
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
        {!isLoading && !error && notice && (
          <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm text-emerald-700 shadow-sm">
            {notice}
          </div>
        )}
        {!isLoading && !error && hasSearched && results.length === 0 && (
          <div className="rounded-xl border border-gray-100 bg-white p-4 text-sm text-gray-600 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span>검색 결과가 없습니다.</span>
            </div>
          </div>
        )}
        {!isLoading && !error && results.length > 0 && (
          <ul className="space-y-3">
            {results.map((r) => (
              <li key={r.id} className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg text-gray-500">
                      {r.type === 'phone' ? '전화번호' : '계좌번호'}
                    </div>
                    <div className="text-base font-semibold text-gray-900">{r.value}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-500">신고 횟수</div>
                    <div className="text-lg font-bold text-emerald-600">{r.reports}건</div>
                    <div
                      className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                        r.risk === 'high'
                          ? 'bg-red-100 text-red-700'
                          : r.risk === 'medium'
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {r.risk === 'high' ? '높음' : r.risk === 'medium' ? '중간' : '낮음'}
                    </div>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                  <span>
                    {r.lastReported ? `최근 신고일: ${r.lastReported}` : '최근 신고일: -'}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mx-auto mt-16 mb-12 grid max-w-6xl grid-cols-1 gap-6 px-4 md:mt-20 md:grid-cols-3">
        <RecentReportsCard reports={recentReports} />
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

const RecentReportsCard = ({
  reports,
}: {
  reports: Array<{
    id: string;
    type: 'phone' | 'account';
    value: string;
    lastReported: string;
  }>;
}) => {
  const [index, setIndex] = useState(0);

  // 보고서 목록이 변경되면 인덱스 보정
  useEffect(() => {
    if (index >= reports.length) setIndex(0);
  }, [reports, index]);

  const hasItems = reports && reports.length > 0;
  const current = hasItems ? reports[index] : null;

  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-600">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
            <ShieldAlert className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium">최근 신고 데이터</span>
        </div>
        <div className="text-xs text-gray-500">
          {hasItems ? `${index + 1} / ${Math.min(5, reports.length)}` : '0 / 0'}
        </div>
      </div>

      {!hasItems ? (
        <div className="text-sm text-gray-400">최근 신고 데이터가 없습니다.</div>
      ) : (
        <div className="relative">
          {/* 단일 카드 */}
          <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
            <div className="text-xs text-gray-500 mb-1">
              {current!.type === 'phone' ? '전화번호' : '계좌번호'}
            </div>
            <div className="text-base font-semibold text-gray-900">{current!.value}</div>
            <div className="mt-2 text-xs text-gray-500">
              최근 신고일: {current!.lastReported || '-'}
            </div>
          </div>

          {/* 내비게이션 */}
          <div className="mt-3 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setIndex((i) => (i <= 0 ? Math.min(4, reports.length - 1) : i - 1))}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              disabled={reports.length <= 1}
              aria-label="이전"
              title="이전"
            >
              이전
            </button>
            <div className="flex items-center gap-1">
              {reports.slice(0, 5).map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${i === index ? 'bg-emerald-600' : 'bg-gray-300'}`}
                />
              ))}
            </div>
            <button
              type="button"
              onClick={() => setIndex((i) => (i >= Math.min(4, reports.length - 1) ? 0 : i + 1))}
              className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              disabled={reports.length <= 1}
              aria-label="다음"
              title="다음"
            >
              다음
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VoicephishingPage;
