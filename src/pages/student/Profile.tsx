import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { CrowMascot } from '../../components/CrowMascot';
import { Badge } from '../../components/Badge';

const links = [
  { to: '/app/wallet', label: 'Lələk Cüzdanım', icon: '🪶' },
  { to: '/app/referral', label: 'Dostlarını dəvət et', icon: '🎁' },
  { to: '/app/history', label: 'Qeydiyyat tarixçəsi', icon: '🧾' },
  { to: '/app/saved-searches', label: 'Yadda saxlanılan axtarışlar', icon: '💾' },
  { to: '/app/messages', label: 'Mesajlar', icon: '💬' },
  { to: '/app/notifications', label: 'Bildirişlər', icon: '🔔' },
  { to: '/app/support', label: 'Qarğa dəstək', icon: '🛟' },
  { to: '/app/settings', label: 'Tənzimləmələr', icon: '⚙️' },
];

export function Profile() {
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const lelekBalance = useAppStore((s) => s.lelekBalance);
  const notifications = useAppStore((s) => s.notifications);
  const unread = notifications.filter((n) => n.audience === 'student' && !n.read).length;

  return (
    <div className="min-h-screen bg-ink-50 pb-4">
      <div className="bg-ink-900 text-white px-5 pt-8 pb-6 rounded-b-3xl flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-white/10 flex items-center justify-center text-3xl">{currentUser?.avatarEmoji}</div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-lg truncate">{currentUser?.name}</p>
          <p className="text-xs text-ink-300 truncate">{currentUser?.phone}</p>
        </div>
        <CrowMascot size={38} />
      </div>

      <div className="px-4 -mt-4">
        <button onClick={() => navigate('/app/wallet')} className="w-full bg-white rounded-2xl shadow-sm border border-ink-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🪶</span>
            <div className="text-left">
              <p className="text-xs text-ink-400">Lələk balansı</p>
              <p className="font-bold text-ink-900">{lelekBalance()} xal</p>
            </div>
          </div>
          <span className="text-ink-300">→</span>
        </button>
      </div>

      <div className="px-4 mt-4 flex flex-col gap-1">
        {links.map((l) => (
          <button key={l.to} onClick={() => navigate(l.to)} className="flex items-center gap-3 bg-white rounded-xl px-4 py-3.5 border border-ink-100">
            <span className="text-lg">{l.icon}</span>
            <span className="flex-1 text-left text-sm font-semibold text-ink-800">{l.label}</span>
            {l.to === '/app/notifications' && unread > 0 && <Badge tone="coral">{unread}</Badge>}
            <span className="text-ink-300">→</span>
          </button>
        ))}
      </div>

      <div className="px-4 mt-4">
        <button
          onClick={() => { useAppStore.getState().logout(); navigate('/login'); }}
          className="w-full text-center py-3 text-sm font-semibold text-coral-500"
        >
          Çıxış et
        </button>
      </div>
    </div>
  );
}
