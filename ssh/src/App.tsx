import { RouterProvider } from 'react-router-dom';
import { routers } from '@/routes/routing';
import AuthProvider from '@/auth/AuthProvider';
export default function App() {
  return (
    <AuthProvider>
      <RouterProvider router={routers} />
    </AuthProvider>
  );
}
