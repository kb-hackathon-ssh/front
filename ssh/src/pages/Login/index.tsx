import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/auth.api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { User2, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '@/auth/useAuth';

export default function LoginPage() {
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { reload } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (id.trim().length < 3) {
      setError('아이디는 3자 이상 입력해주세요.');
      return;
    }
    if (!pw) {
      setError('비밀번호를 입력하세요.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/auth/login', { id, password: pw });

      if (res.data?.accessToken) {
        localStorage.setItem('accessToken', res.data.accessToken);
      }
      await reload();

      const to = search.get('redirect') ?? '/';
      navigate(to, { replace: true });
    } catch {
      setError('로그인에 실패했습니다. 아이디/비밀번호를 확인해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="
        mx-auto flex min-h-[calc(100dvh-120px)] max-w-2xl items-center px-6
        text-[17px] md:text-[18px]
      "
    >
      <Card className="w-full shadow-xl">
        <CardHeader className="space-y-2 pb-4 md:pb-6">
          <CardTitle className="text-3xl md:text-4xl font-extrabold">로그인</CardTitle>
          <p className="text-base md:text-lg text-muted-foreground">
            아이디와 비밀번호를 입력해주세요.
          </p>
        </CardHeader>

        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-7">
            <div className="space-y-2">
              <Label htmlFor="id" className="text-base md:text-lg">
                아이디
              </Label>
              <div className="relative">
                <User2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                <Input
                  id="id"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="아이디를 입력하세요"
                  autoComplete="username"
                  className="pl-11 pr-3 h-12 md:h-14 text-base md:text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base md:text-lg">
                비밀번호
              </Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={pw}
                  onChange={(e) => setPw(e.target.value)}
                  placeholder="비밀번호를 입력하세요"
                  autoComplete="current-password"
                  className="pl-11 pr-12 h-12 md:h-14 text-base md:text-lg"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-2 md:p-2.5 text-muted-foreground hover:bg-accent"
                  aria-label={showPw ? '비밀번호 숨기기' : '비밀번호 보기'}
                >
                  {showPw ? (
                    <EyeOff className="h-5 w-5 md:h-6 md:w-6" />
                  ) : (
                    <Eye className="h-5 w-5 md:h-6 md:w-6" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 text-base md:text-lg">
                <Checkbox id="remember" className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-muted-foreground">로그인 상태 유지</span>
              </label>
              <a
                href="/reset"
                className="text-base md:text-lg text-primary underline-offset-4 hover:underline"
              >
                비밀번호 찾기
              </a>
            </div>

            {error && (
              <p className="rounded-md bg-destructive/10 px-4 py-3 text-base md:text-lg text-destructive">
                {error}
              </p>
            )}

            <Button
              type="submit"
              className="w-full h-12 md:h-14 text-base md:text-lg"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 md:h-6 md:w-6 animate-spin" />
                  로그인 중…
                </>
              ) : (
                '로그인'
              )}
            </Button>

            <p className="text-center text-base md:text-lg text-muted-foreground">
              아직 계정이 없으신가요?{' '}
              <a href="/signup" className="text-primary underline-offset-4 hover:underline">
                회원가입
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
