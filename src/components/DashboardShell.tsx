import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { CrowMascot } from './CrowMascot';
import { useAppStore } from '../store/useAppStore';

export interface DashNavItem {
  to: string;
  label: string;
  icon: string;
}

export function DashboardShell({ brandLabel, navItems }: { brandLabel: string; navItems: DashNavItem[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-ink-50 flex">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 bg-ink-900 text-white min-h-screen p-4">
        <SidebarContent brandLabel={brandLabel} navItems={navItems} currentUser={currentUser} onLogout={() => { logout(); navigate('/login'); }} />
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-ink-900 text-white p-4 overflow-y-auto">
            <SidebarContent brandLabel={brandLabel} navItems={navItems} currentUser={currentUser} onLogout={() => { logout(); navigate('/login'); }} onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="md:hidden sticky top-0 z-30 bg-ink-900 text-white flex items-center gap-3 px-4 py-3">
          <button onClick={() => setMobileOpen(true)} className="text-xl" aria-label="Menyu">☰</button>
          <CrowMascot size={26} />
          <span className="font-bold">{brandLabel}</span>
        </header>
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function SidebarContent({ brandLabel, navItems, currentUser, onLogout, onNavigate }: {
  brandLabel: string; navItems: DashNavItem[]; currentUser: { name: string; avatarEmoji: string } | null; onLogout: () => void; onNavigate?: () => void;
}) {
  return (
    <>
      <div className="flex items-center gap-2 px-2 mb-6">
        <CrowMascot size={32} />
        <div>
          <p className="font-bold leading-tight">Qarğa</p>
          <p className="text-xs text-ink-300 leading-tight">{brandLabel}</p>
        </div>
      </div>
      <nav className="flex-1 flex flex-col gap-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className={({ isActive }) =>
              clsx('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors', isActive ? 'bg-white text-ink-900' : 'text-ink-200 hover:bg-ink-800')
            }
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="mt-4 pt-4 border-t border-ink-700 flex items-center gap-2 px-2">
        <span className="text-2xl">{currentUser?.avatarEmoji ?? '👤'}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate">{currentUser?.name ?? 'İstifadəçi'}</p>
          <button onClick={onLogout} className="text-xs text-ink-300 hover:text-white">Çıxış et</button>
        </div>
      </div>
    </>
  );
}
