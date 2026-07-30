import { useState, type ReactNode } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../../components/Button';
import { TextArea, TextInput } from '../../components/FormField';
import { Badge } from '../../components/Badge';
import { useToast } from '../../components/Toast';
import type { UserRole } from '../../types';

export function AdminSettings() {
  const { show } = useToast();
  const users = useAppStore((s) => s.users);
  const suspendUser = useAppStore((s) => s.suspendUser);
  const addNotification = useAppStore((s) => s.addNotification);
  const [broadcastAudience, setBroadcastAudience] = useState<UserRole>('student');
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastBody, setBroadcastBody] = useState('');
  const [commissionRate, setCommissionRate] = useState(10);

  const sendBroadcast = () => {
    if (!broadcastTitle.trim() || !broadcastBody.trim()) { show('Başlıq və mətni doldurun', 'error'); return; }
    addNotification(broadcastAudience, broadcastTitle, broadcastBody, 'info');
    show('Bildiriş göndərildi', 'success');
    setBroadcastTitle(''); setBroadcastBody('');
  };

  return (
    <div className="p-5 max-w-4xl">
      <h1 className="text-xl font-bold text-ink-900 mb-4">Platforma ayarları</h1>

      <Section title="İstifadəçi idarəetməsi">
        <div className="flex flex-col gap-2">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between border-b border-ink-50 last:border-0 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{u.avatarEmoji}</span>
                <div>
                  <p className="text-sm font-semibold text-ink-800">{u.name}</p>
                  <p className="text-xs text-ink-400">{u.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge tone="neutral">{u.role}</Badge>
                <button onClick={() => { suspendUser(u.id); show(`${u.name} hesabı dayandırıldı`, 'info'); }} className="text-xs font-semibold text-coral-500">Dayandır</button>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Komissiya dərəcəsi">
        <div className="flex items-center gap-3">
          <TextInput label="Bütün kateqoriyalar üçün standart komissiya (%)" type="number" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} />
        </div>
        <Button size="sm" onClick={() => show('Komissiya dərəcəsi yeniləndi', 'success')}>Yadda saxla</Button>
      </Section>

      <Section title="Platforma bildirişi göndər">
        <label className="block mb-3">
          <span className="block text-sm font-semibold text-ink-800 mb-1">Auditoriya</span>
          <select value={broadcastAudience} onChange={(e) => setBroadcastAudience(e.target.value as UserRole)} className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm">
            <option value="student">Tələbələr</option>
            <option value="provider">Provayderlər</option>
          </select>
        </label>
        <TextInput label="Başlıq" value={broadcastTitle} onChange={(e) => setBroadcastTitle(e.target.value)} />
        <TextArea label="Mətn" value={broadcastBody} onChange={(e) => setBroadcastBody(e.target.value)} />
        <Button onClick={sendBroadcast}>Göndər</Button>
      </Section>

      <Section title="Hüquqi sənədlər">
        <p className="text-sm text-ink-500">İstifadə şərtləri və məxfilik siyasəti platformanın ayrı səhifələrində saxlanılır və istənilən vaxt yenilənə bilər.</p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 p-4 mb-4">
      <h2 className="font-bold text-ink-900 mb-3">{title}</h2>
      {children}
    </div>
  );
}
