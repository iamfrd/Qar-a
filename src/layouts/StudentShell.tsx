import { Navigate, Outlet } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { BottomNav } from '../components/BottomNav';

export function StudentShell() {
  const currentUser = useAppStore((s) => s.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'student') return <Navigate to="/" replace />;

  return (
    <div className="min-h-screen bg-ink-50 pb-20">
      <div className="mx-auto max-w-lg min-h-screen bg-ink-50 relative">
        <Outlet />
      </div>
      <BottomNav />
    </div>
  );
}
