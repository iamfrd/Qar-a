import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { DashboardShell, type DashNavItem } from '../components/DashboardShell';

const navItems: DashNavItem[] = [
  { to: '/admin/dashboard', label: 'İdarəetmə paneli', icon: '📊' },
  { to: '/admin/providers', label: 'Provayderlər', icon: '🏢' },
  { to: '/admin/courses', label: 'Kurs siyahısı', icon: '📚' },
  { to: '/admin/categories', label: 'Kateqoriyalar', icon: '🗂️' },
  { to: '/admin/registrations', label: 'Qeydiyyatlar', icon: '🧾' },
  { to: '/admin/reviews', label: 'Rəylər', icon: '⭐' },
  { to: '/admin/loyalty', label: 'Lələk və Referral', icon: '🪙' },
  { to: '/admin/support', label: 'Dəstək və mübahisələr', icon: '🛟' },
  { to: '/admin/settings', label: 'Platforma ayarları', icon: '⚙️' },
];

export function AdminShell() {
  const currentUser = useAppStore((s) => s.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'admin') return <Navigate to="/" replace />;
  return <DashboardShell brandLabel="Admin Paneli" navItems={navItems} />;
}
