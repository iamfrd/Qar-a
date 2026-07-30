import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { TopBar } from '../../components/TopBar';
import { EmptyState } from '../../components/EmptyState';
import { formatDateAz } from '../../lib/utils';

const kindIcon = { info: 'ℹ️', success: '✅', warning: '⚠️', reminder: '⏰' };

export function Notifications() {
  const navigate = useNavigate();
  const notifications = useAppStore((s) => s.notifications.filter((n) => n.audience === 'student'));
  const markNotificationRead = useAppStore((s) => s.markNotificationRead);

  return (
    <div className="min-h-screen bg-ink-50 pb-6">
      <TopBar title="Bildirişlər" onBack={() => navigate('/app/profile')} />
      <div className="px-4">
        {notifications.length === 0 ? (
          <EmptyState title="Hələ bildirişin yoxdur" />
        ) : (
          <div className="flex flex-col gap-2">
            {notifications.map((n) => (
              <button key={n.id} onClick={() => markNotificationRead(n.id)} className={`text-left rounded-xl p-3.5 border ${n.read ? 'bg-white border-ink-100' : 'bg-teal-100/40 border-teal-200'}`}>
                <div className="flex items-start gap-2">
                  <span className="text-lg">{kindIcon[n.kind]}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-ink-900">{n.title}</p>
                    <p className="text-xs text-ink-600 mt-0.5">{n.body}</p>
                    <p className="text-[11px] text-ink-400 mt-1">{formatDateAz(n.createdAt)}</p>
                  </div>
                  {!n.read && <span className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 shrink-0" />}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
