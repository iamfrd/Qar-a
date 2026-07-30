import { useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { useLang } from '../../i18n/LanguageContext';
import { TopBar } from '../../components/TopBar';
import { Button } from '../../components/Button';
import { useToast } from '../../components/Toast';
import type { Lang } from '../../types';

const languages: { id: Lang; label: string }[] = [
  { id: 'az', label: '🇦🇿 Azərbaycan dili' },
  { id: 'en', label: '🇬🇧 English' },
  { id: 'ru', label: '🇷🇺 Русский' },
];

export function Settings() {
  const navigate = useNavigate();
  const { show } = useToast();
  const { lang, setLang } = useLang();
  const currentUser = useAppStore((s) => s.currentUser);
  const logout = useAppStore((s) => s.logout);
  const resetDemoData = useAppStore((s) => s.resetDemoData);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [phoneVisible, setPhoneVisible] = useState(false);

  return (
    <div className="min-h-screen bg-ink-50 pb-6">
      <TopBar title="Tənzimləmələr" onBack={() => navigate('/app/profile')} />
      <div className="px-4">
        <Section title="Hesab məlumatları">
          <Row label="Ad Soyad" value={currentUser?.name ?? ''} />
          <Row label="Telefon" value={currentUser?.phone ?? ''} />
          <Row label="E-poçt" value={currentUser?.email ?? ''} />
        </Section>

        <Section title="Dil">
          <div className="flex flex-col gap-1">
            {languages.map((l) => (
              <button key={l.id} onClick={() => setLang(l.id)} className={`text-left px-3 py-2.5 rounded-xl flex items-center justify-between ${lang === l.id ? 'bg-ink-900 text-white' : 'bg-ink-50 text-ink-700'}`}>
                {l.label} {lang === l.id && '✓'}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Bildirişlər">
          <ToggleRow label="Push bildirişləri" checked={pushEnabled} onChange={setPushEnabled} />
          <ToggleRow label="E-poçt bildirişləri" checked={emailEnabled} onChange={setEmailEnabled} />
        </Section>

        <Section title="Məxfilik">
          <ToggleRow label="Telefon nömrəmi kurs mərkəzlərinə göstər" checked={phoneVisible} onChange={setPhoneVisible} />
          <button onClick={() => show('Məlumatlarınızın .json faylı hazırlanır...', 'info')} className="text-sm font-semibold text-ink-900 mt-2 text-left">📤 Məlumatlarımı ixrac et</button>
        </Section>

        <Section title="Demo">
          <button onClick={() => { resetDemoData(); show('Demo məlumatları sıfırlandı', 'success'); }} className="text-sm font-semibold text-ink-900 text-left">🔄 Demo məlumatlarını sıfırla</button>
        </Section>

        <div className="flex flex-col gap-2 mt-6">
          <Button variant="outline" fullWidth onClick={() => { logout(); navigate('/login'); }}>Çıxış et</Button>
          <button
            onClick={() => { if (confirm('Hesabınızı silmək istədiyinizə əminsiniz?')) { logout(); navigate('/login'); } }}
            className="text-center text-sm font-semibold text-coral-500 py-2"
          >
            Hesabı sil
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="mt-4">
      <p className="text-xs font-bold text-ink-400 uppercase mb-2">{title}</p>
      <div className="bg-white rounded-2xl border border-ink-100 p-3">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between py-1.5">
      <span className="text-sm text-ink-500">{label}</span>
      <span className="text-sm font-semibold text-ink-800">{value}</span>
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm text-ink-700">{label}</span>
      <button onClick={() => onChange(!checked)} className={`w-10 h-6 rounded-full transition-colors relative ${checked ? 'bg-ink-900' : 'bg-ink-200'}`}>
        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all ${checked ? 'left-4.5' : 'left-0.5'}`} style={{ left: checked ? 18 : 2 }} />
      </button>
    </div>
  );
}
