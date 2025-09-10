import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { ROUTING_PATH } from '@/routes/path.constants';
import { useAuth } from '@/auth/useAuth';

const toAbs = (seg: string) => (seg.startsWith('/') ? seg : '/' + seg);

export default function ProtectedRoute() {
  const { user } = useAuth();
  const loc = useLocation();

  if (!user) {
    const redirect = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`${toAbs(ROUTING_PATH.login)}?redirect=${redirect}`} replace />;
  }
  return <Outlet />;
}
