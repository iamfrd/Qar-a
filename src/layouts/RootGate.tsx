import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { CrowMascot } from '../components/CrowMascot';

export function RootGate() {
  const [showSplash, setShowSplash] = useState(true);
  const hasOnboarded = useAppStore((s) => s.hasOnboarded);
  const currentUser = useAppStore((s) => s.currentUser);
  const hasLocationPermission = useAppStore((s) => s.hasLocationPermission);

  useEffect(() => {
    const t = setTimeout(() => setShowSplash(false), 1100);
    return () => clearTimeout(t);
  }, []);

  if (showSplash) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-ink-900 text-white gap-4">
        <CrowMascot size={96} mood="happy" animated />
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Qarğa</h1>
          <p className="text-sm text-ink-300 mt-1">Sən kurs axtarma, Qarğa tapsın.</p>
        </div>
      </div>
    );
  }

  if (!hasOnboarded) return <Navigate to="/onboarding" replace />;
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role === 'student' && !hasLocationPermission) return <Navigate to="/location" replace />;
  if (currentUser.role === 'provider') return <Navigate to="/provider/dashboard" replace />;
  if (currentUser.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/app/map" replace />;
}
