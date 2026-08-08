import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { TopBar } from '../../components/TopBar';
import { Button } from '../../components/Button';
import { TextInput } from '../../components/FormField';
import { CrowMascot } from '../../components/CrowMascot';
import { useToast } from '../../components/Toast';
import { formatDateAz } from '../../lib/utils';

export function ReferralPage() {
  const navigate = useNavigate();
  const { show } = useToast();
  const currentUser = useAppStore((s) => s.currentUser);
  const referrals = useAppStore((s) => s.referrals);
  const addReferral = useAppStore((s) => s.addReferral);
  const completeReferral = useAppStore((s) => s.completeReferral);
  const [friendName, setFriendName] = useState('');

  const code = currentUser?.referralCode ?? 'QARGA';
  const link = `https://qarga.az/invite/${code}`;
  const message = `Qarğa ilə yaxınlığındakı kursları tap! Mənim kodumla qeydiyyatdan keç və endirim qazan: ${link}`;

  const copyLink = () => {
    navigator.clipboard?.writeText(link);
    show('Link kopyalandı', 'success');
  };

  const invite = () => {
    if (!friendName.trim()) { show('Dostunun adını yazın', 'error'); return; }
    addReferral(friendName.trim());
    show(`${friendName} dəvət edildi`, 'success');
    setFriendName('');
  };

  return (
    <div className="min-h-screen bg-ink-50 pb-6">
      <TopBar title="Dostlarını dəvət et" onBack={() => navigate('/app/profile')} />
      <div className="px-4">
        <div className="bg-ink-900 text-white rounded-3xl p-5 text-center mt-2">
          <CrowMascot size={56} mood="waving" className="mx-auto" />
          <h1 className="font-bold text-lg mt-2">Dostunu dəvət et, ikiniz də qazanın!</h1>
          {/* Lələk mükafatı hələ serverdə qeydə alınmır — vəd kimi deyil, plan kimi yazılır. */}
          <p className="text-xs text-ink-300 mt-1">Dostun sənin kodunla qeydiyyatdan keçib kursa yazılanda hər ikinizə 30 Lələk yazılacaq. Lələk proqramı hazırlanır — xallar hazırda istifadə edilə bilmir.</p>
          <div className="bg-white/10 rounded-xl mt-4 px-4 py-3 flex items-center justify-between">
            <span className="font-mono font-bold tracking-wider">{code}</span>
            <button onClick={copyLink} className="text-xs font-semibold bg-gold-500 text-ink-950 px-3 py-1.5 rounded-full">Kopyala</button>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 mt-4">
          <ShareBtn icon="💬" label="WhatsApp" href={`https://wa.me/?text=${encodeURIComponent(message)}`} />
          <ShareBtn icon="✈️" label="Telegram" href={`https://t.me/share/url?url=${encodeURIComponent(link)}&text=${encodeURIComponent(message)}`} />
          <ShareBtn icon="📸" label="Instagram" onClick={() => { navigator.clipboard?.writeText(message); show('Mətn kopyalandı, Instagram-da paylaşa bilərsən', 'success'); }} />
          <ShareBtn icon="✉️" label="E-poçt" href={`mailto:?subject=${encodeURIComponent('Qarğaya qoşul!')}&body=${encodeURIComponent(message)}`} />
        </div>

        <div className="mt-5">
          <p className="text-sm font-semibold text-ink-800 mb-2">Dostunu adı ilə əlavə et (demo)</p>
          <div className="flex gap-2">
            <div className="flex-1"><TextInput value={friendName} onChange={(e) => setFriendName(e.target.value)} placeholder="Dostunun adı" /></div>
            <Button onClick={invite}>Dəvət et</Button>
          </div>
        </div>

        <h2 className="font-bold text-ink-900 mt-5 mb-2">Dəvətlərim ({referrals.length})</h2>
        <div className="flex flex-col gap-2">
          {referrals.length === 0 && <p className="text-sm text-ink-400">Hələ dəvət etdiyin dostun yoxdur.</p>}
          {referrals.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-ink-100 p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink-800">{r.invitedName}</p>
                <p className="text-xs text-ink-400">{formatDateAz(r.createdAt)} • {r.status === 'completed' ? '✅ Qeydiyyat tamamlandı' : '⏳ Gözləyir'}</p>
              </div>
              {r.status === 'pending' ? (
                <button onClick={() => completeReferral(r.id)} className="text-xs font-semibold text-ink-900 underline">Tamamlandı kimi işarələ</button>
              ) : (
                <span className="text-xs font-bold text-teal-600">+{r.rewardLelek} 🪶</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ShareBtn({ icon, label, href, onClick }: { icon: string; label: string; href?: string; onClick?: () => void }) {
  const content = (
    <div className="flex flex-col items-center gap-1 bg-white rounded-xl border border-ink-100 py-3">
      <span className="text-xl">{icon}</span>
      <span className="text-[10px] font-semibold text-ink-600">{label}</span>
    </div>
  );
  if (href) return <a href={href} target="_blank" rel="noreferrer">{content}</a>;
  return <button onClick={onClick} className="w-full">{content}</button>;
}
