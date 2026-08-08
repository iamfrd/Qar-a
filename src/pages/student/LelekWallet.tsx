import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { TopBar } from '../../components/TopBar';
import { CrowMascot } from '../../components/CrowMascot';
import { formatDateAz } from '../../lib/utils';

const rewards = [
  { icon: '🏷️', title: '10 AZN qeydiyyat endirimi', cost: 100 },
  { icon: '🎁', title: 'Pulsuz sınaq dərsi yüksəltmə', cost: 50 },
  { icon: '💳', title: 'Qeydiyyat haqqından azad olma', cost: 150 },
  { icon: '🤝', title: 'Partnyor endirimi', cost: 200 },
];

export function LelekWallet() {
  const navigate = useNavigate();
  const transactions = useAppStore((s) => s.lelekTransactions);
  const lelekBalance = useAppStore((s) => s.lelekBalance);
  const earned = transactions.filter((t) => t.type === 'earn').reduce((s, t) => s + t.amount, 0);
  const used = transactions.filter((t) => t.type === 'spend').reduce((s, t) => s + t.amount, 0);
  const nextExpiry = transactions.find((t) => t.type === 'earn' && t.expiresAt)?.expiresAt;

  return (
    <div className="min-h-screen bg-ink-50 pb-6">
      <TopBar title="Lələk Cüzdanı" onBack={() => navigate('/app/profile')} />
      <div className="px-4">
        <div className="bg-gradient-to-br from-ink-900 to-ink-700 text-white rounded-3xl p-5 mt-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-300">Toplanan xal (hələ istifadə edilə bilmir)</p>
              <p className="text-3xl font-bold flex items-center gap-1">{lelekBalance()} <span className="text-lg">🪶</span></p>
            </div>
            <CrowMascot size={48} mood="happy" />
          </div>
          <div className="flex gap-4 mt-4 text-xs text-ink-200">
            <span>Qazanılan: <b className="text-white">{earned}</b></span>
            <span>İstifadə olunan: <b className="text-white">{used}</b></span>
          </div>
          {nextExpiry && <p className="text-[11px] text-ink-300 mt-2">Ən yaxın bitmə tarixi: {formatDateAz(nextExpiry)}</p>}
        </div>

        {/*
          Lələk balansı yalnız bu brauzerdə saxlanılır — serverdə heç bir Lələk qeydi
          aparılmır, ona görə xallar nə xərclənə, nə də mükafata dəyişdirilə bilər.
          Vəziyyət gizlədilmir, açıq yazılır; mükafat siyahısı isə plan kimi göstərilir.
        */}
        <div className="mt-4 rounded-2xl border border-gold-200 bg-gold-50 p-3">
          <p className="text-sm font-bold text-gold-700">🪶 Lələk proqramı hazırlanır</p>
          <p className="text-xs text-ink-600 mt-1 leading-relaxed">
            Xallar hazırda yalnız bu cihazda toplanır və hələ heç bir endirimə və ya mükafata
            çevrilə bilmir. Proqram hazır olanda balansınız rəsmi olaraq hesabınıza bağlanacaq.
          </p>
        </div>

        <h2 className="font-bold text-ink-900 mt-5 mb-1">Planlaşdırılan mükafatlar</h2>
        <p className="text-xs text-ink-400 mb-2">Bunlar gələcək plandır — hazırda alına bilmir.</p>
        <div className="grid grid-cols-2 gap-2">
          {rewards.map((r) => (
            <div key={r.title} className="bg-white rounded-xl border border-ink-100 p-3 opacity-60">
              <span className="text-xl">{r.icon}</span>
              <p className="text-xs font-semibold text-ink-800 mt-1 leading-snug">{r.title}</p>
              <p className="text-xs text-ink-400 font-bold mt-1">{r.cost} 🪶 • hazır deyil</p>
            </div>
          ))}
        </div>

        <h2 className="font-bold text-ink-900 mt-5 mb-2">Əməliyyat tarixçəsi</h2>
        <div className="flex flex-col gap-2">
          {transactions.length === 0 && <p className="text-sm text-ink-400">Hələ əməliyyat yoxdur.</p>}
          {transactions.map((t) => (
            <div key={t.id} className="bg-white rounded-xl border border-ink-100 p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-ink-800">{t.reason}</p>
                <p className="text-xs text-ink-400">{formatDateAz(t.createdAt)}</p>
              </div>
              <span className={`font-bold text-sm ${t.type === 'earn' ? 'text-teal-600' : 'text-coral-500'}`}>
                {t.type === 'earn' ? '+' : '-'}{t.amount} 🪶
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
