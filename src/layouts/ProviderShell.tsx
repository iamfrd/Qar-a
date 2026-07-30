import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { DashboardShell, type DashNavItem } from '../components/DashboardShell';

const navItems: DashNavItem[] = [
  { to: '/provider/dashboard', label: 'İdarəetmə paneli', icon: '📊' },
  { to: '/provider/branches', label: 'Filiallar', icon: '📍' },
  { to: '/provider/courses', label: 'Kurslar', icon: '📚' },
  { to: '/provider/registrations', label: 'Qeydiyyatlar', icon: '🧾' },
  { to: '/provider/trials', label: 'Sınaq dərsləri', icon: '🗓️' },
  { to: '/provider/reviews', label: 'Rəylər', icon: '⭐' },
  { to: '/provider/analytics', label: 'Analitika', icon: '📈' },
  { to: '/provider/offers', label: 'Endirimlər', icon: '🏷️' },
  { to: '/provider/settings', label: 'Tənzimləmələr', icon: '⚙️' },
];

export function ProviderShell() {
  const currentUser = useAppStore((s) => s.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'provider') return <Navigate to="/" replace />;
  return <DashboardShell brandLabel="Provayder Paneli" navItems={navItems} />;
}
