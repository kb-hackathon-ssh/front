import axios, { AxiosError, type AxiosRequestConfig } from 'axios';

// 환경변수 명 통일: VITE_API_URL 권장
export const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api';

export const api = axios.create({
  baseURL,
  // 쿠키 기반이면 활성화
  // withCredentials: true,
});

// 리프레시 전용(인터셉터 최소화/분리)
const refreshClient = axios.create({
  baseURL,
  // 쿠키 기반이면 필요
  // withCredentials: true,
});

type TokenPair = { accessToken: string; refreshToken?: string };

// 실제 리프레시 요청 함수 (별도 클라이언트 사용)
async function getNewTokens(): Promise<TokenPair> {
  // 예시: Authorization 없이 쿠키/리프레시 토큰으로 재발급
  const { data } = await refreshClient.post('/auth/tokens/refresh');
  return data as TokenPair;
}

// 동시성 제어
let isRefreshing = false;
let waitQueue: Array<() => void> = [];

function subscribeRefresh(resolve: () => void) {
  waitQueue.push(resolve);
}
function flushQueue() {
  waitQueue.forEach((fn) => fn());
  waitQueue = [];
}

// 요청 인터셉터: 항상 최신 accessToken 부착
api.interceptors.request.use((config) => {
  const at = localStorage.getItem('accessToken');
  if (at) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${at}`;
  }
  return config;
});

// 응답 인터셉터: 401 처리
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as (AxiosRequestConfig & { _retry?: boolean }) | undefined;

    // config 없는 에러(CORS, 네트워크 다운 등)
    if (!original) throw error;

    const status = error.response?.status;
    const url = original.url ?? '';

    // 리프레시 자체 실패거나, 이미 재시도했다면 중단
    const isRefreshCall = url.includes('/auth/tokens/refresh') || url.includes('/auth/tokens');
    if (isRefreshCall || original._retry) throw error;

    // 만료
    if (status === 401) {
      original._retry = true;

      // 이미 누군가 리프레시 중이면 대기 후 재요청
      if (isRefreshing) {
        await new Promise<void>((resolve) => subscribeRefresh(resolve));
        // 대기 후 최신 토큰으로 재요청
        const at = localStorage.getItem('accessToken');
        original.headers = original.headers ?? {};
        if (at) original.headers.Authorization = `Bearer ${at}`;
        return api(original);
      }

      try {
        isRefreshing = true;
        const tokens = await getNewTokens();
        localStorage.setItem('accessToken', tokens.accessToken);
        // 필요 시 리프레시 토큰도 저장(로컬스토리지는 권장 X)
        if (tokens.refreshToken) localStorage.setItem('refreshToken', tokens.refreshToken);

        // ✅ 기본값 갱신(이후 요청들)
        api.defaults.headers.common.Authorization = `Bearer ${tokens.accessToken}`;

        flushQueue();

        // 원 요청 재시도
        original.headers = original.headers ?? {};
        original.headers.Authorization = `Bearer ${tokens.accessToken}`;
        return api(original);
      } catch (e) {
        // 전파 전에 대기자 해제
        flushQueue();
        throw e;
      } finally {
        isRefreshing = false;
      }
    }

    throw error;
  },
);
