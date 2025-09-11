import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/lib/auth.api';
import { useAuth } from '@/auth/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { User2, Mail, IdCard, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [userId, setUserId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [search] = useSearchParams();
  const navigate = useNavigate();
  const { reload } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (userId.trim().length < 3) return setError('아이디는 3자 이상 입력해주세요.');
    if (name.trim().length < 2) return setError('이름은 2자 이상 입력해주세요.');
    if (!email.includes('@')) return setError('이메일 형식이 올바르지 않습니다.');
    if (pw.length < 8) return setError('비밀번호는 8자 이상이어야 합니다.');
    if (pw !== confirm) return setError('비밀번호가 일치하지 않습니다.');

    try {
      setSubmitting(true);

      await api.post('/auth/register', { id: userId, name, email, password: pw });

      try {
        const res = await api.post('/auth/login', { id: userId, password: pw });
        if (res.data?.accessToken) {
          localStorage.setItem('accessToken', res.data.accessToken);
        }
        await reload();
        const to = search.get('redirect') ?? '/';
        navigate(to, { replace: true });
        return;
      } catch {
        navigate('/login?redirect=/', { replace: true });
        return;
      }
    } catch {
      setError('회원가입에 실패했습니다. 이미 존재하는 아이디/이메일일 수 있습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto flex min-h-[calc(100dvh-120px)] max-w-2xl items-center px-6 text-[17px] md:text-[18px]">
      <Card className="w-full shadow-xl">
        <CardHeader className="space-y-2 pb-4 md:pb-6">
          <CardTitle className="text-3xl md:text-4xl font-extrabold">회원가입</CardTitle>
          <p className="text-base md:text-lg text-muted-foreground">
            아이디, 이름, 이메일과 비밀번호를 입력해주세요.
          </p>
        </CardHeader>

        <CardContent className="pt-0">
          <form onSubmit={handleSubmit} className="space-y-6 md:space-y-7">
            <div className="space-y-2">
              <Label htmlFor="userId" className="text-base md:text-lg">
                아이디
              </Label>
              <div className="relative">
                <IdCard className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                <Input
                  id="userId"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  placeholder="아이디를 입력하세요 (3자 이상)"
                  autoComplete="username"
                  className="pl-11 pr-3 h-12 md:h-14 text-base md:text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name" className="text-base md:text-lg">
                이름
              </Label>
              <div className="relative">
                <User2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="이름을 입력하세요"
                  className="pl-11 pr-3 h-12 md:h-14 text-base md:text-lg"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-base md:text-lg">
                이메일
              </Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="이메일을 입력하세요"
                  autoComplete="email"
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
                  placeholder="8자 이상, 안전한 비밀번호"
                  autoComplete="new-password"
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

            <div className="space-y-2">
              <Label htmlFor="confirm" className="text-base md:text-lg">
                비밀번호 확인
              </Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="비밀번호를 다시 입력하세요"
                autoComplete="new-password"
                className="h-12 md:h-14 text-base md:text-lg"
              />
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
                  가입 중…
                </>
              ) : (
                '회원가입'
              )}
            </Button>

            <p className="text-center text-base md:text-lg text-muted-foreground">
              이미 계정이 있으신가요?{' '}
              <a href="/login" className="text-primary underline-offset-4 hover:underline">
                로그인
              </a>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
