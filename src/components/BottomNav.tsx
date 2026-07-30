import { NavLink } from 'react-router-dom';
import clsx from 'clsx';
import { CrowMascot } from './CrowMascot';

const items = [
  { to: '/app/map', label: 'Xəritə', icon: '🗺️' },
  { to: '/app/search', label: 'Axtarış', icon: '🔍' },
];
const items2 = [
  { to: '/app/favorites', label: 'Seçilmişlər', icon: '❤️' },
  { to: '/app/profile', label: 'Profil', icon: '👤' },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-ink-100 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-lg grid grid-cols-5 items-end px-1">
        {items.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
        <div className="flex flex-col items-center -mt-6">
          <NavLink to="/app/crow" className="flex flex-col items-center gap-0.5">
            {({ isActive }) => (
              <>
                <div
                  className={clsx(
                    'w-14 h-14 rounded-full flex items-center justify-center shadow-lg border-4 border-white transition-colors',
                    isActive ? 'bg-gold-500' : 'bg-ink-900'
                  )}
                >
                  <CrowMascot size={34} mood="happy" />
                </div>
                <span className={clsx('text-[11px] font-semibold mt-0.5', isActive ? 'text-gold-600' : 'text-ink-500')}>Qarğa</span>
              </>
            )}
          </NavLink>
        </div>
        {items2.map((item) => (
          <NavItem key={item.to} {...item} />
        ))}
      </div>
    </nav>
  );
}

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink to={to} className="flex flex-col items-center gap-0.5 py-2.5">
      {({ isActive }) => (
        <>
          <span className={clsx('text-xl leading-none', isActive ? 'grayscale-0' : 'grayscale opacity-60')}>{icon}</span>
          <span className={clsx('text-[11px] font-medium', isActive ? 'text-ink-900' : 'text-ink-400')}>{label}</span>
        </>
      )}
    </NavLink>
  );
}
