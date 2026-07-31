import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CrowMascot } from '../components/CrowMascot';
import { Button } from '../components/Button';
import { TextInput } from '../components/FormField';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../components/Toast';
import { useLang } from '../i18n/LanguageContext';

export function Login() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState('+994 55 111 22 33');
  const [name, setName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [email, setEmail] = useState('');
  const navigate = useNavigate();
  const { show } = useToast();
  const { t } = useLang();
  const loginAsRole = useAppStore((s) => s.loginAsRole);
  const registerStudent = useAppStore((s) => s.registerStudent);
  const hasLocationPermission = useAppStore((s) => s.hasLocationPermission);

  const afterStudentAuth = () => {
    navigate(hasLocationPermission ? '/app/map' : '/location');
  };

  const handleLogin = () => {
    if (!phone.trim()) { show('Telefon nömrəsini daxil edin', 'error'); return; }
    loginAsRole('student');
    show('Xoş gəlmisən!', 'success');
    afterStudentAuth();
  };

  const handleRegister = () => {
    if (!name.trim() || !regPhone.trim()) { show('Ad və telefon nömrəsi vacibdir', 'error'); return; }
    registerStudent(name.trim(), regPhone.trim(), email.trim());
    afterStudentAuth();
  };

  const handleSocial = (provider: string) => {
    loginAsRole('student');
    show(`${provider} ilə daxil olundu`, 'success');
    afterStudentAuth();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col px-6 py-10">
      <div className="flex flex-col items-center gap-2 mb-6">
        <CrowMascot size={64} mood="default" />
        <h1 className="text-xl font-bold text-ink-900">Qarğa</h1>
        <p className="text-xs text-ink-400">{t('slogan')}</p>
      </div>

      <div className="flex bg-ink-100 rounded-xl p-1 mb-5">
        <button onClick={() => setMode('login')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode === 'login' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-400'}`}>{t('sign_in')}</button>
        <button onClick={() => setMode('register')} className={`flex-1 py-2 rounded-lg text-sm font-semibold ${mode === 'register' ? 'bg-white shadow-sm text-ink-900' : 'text-ink-400'}`}>{t('sign_up')}</button>
      </div>

      {mode === 'login' ? (
        <div>
          <TextInput label={t('phone_label')} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+994 XX XXX XX XX" inputMode="tel" />
          <Button fullWidth size="lg" onClick={handleLogin} className="mt-2">{t('sign_in')}</Button>
        </div>
      ) : (
        <div>
          <TextInput label={t('name_label')} value={name} onChange={(e) => setName(e.target.value)} placeholder="Ad Soyad" />
          <TextInput label={t('phone_label')} value={regPhone} onChange={(e) => setRegPhone(e.target.value)} placeholder="+994 XX XXX XX XX" inputMode="tel" />
          <TextInput label={t('email_label')} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ad@nümunə.az" type="email" />
          <Button fullWidth size="lg" onClick={handleRegister} className="mt-2">{t('sign_up')}</Button>
        </div>
      )}

      <div className="flex items-center gap-3 my-5">
        <div className="h-px bg-ink-100 flex-1" />
        <span className="text-xs text-ink-400">{t('or')}</span>
        <div className="h-px bg-ink-100 flex-1" />
      </div>

      <div className="flex flex-col gap-2">
        <Button variant="outline" fullWidth onClick={() => handleSocial('Google')} icon={<span>🔵</span>}>{t('continue_with_google')}</Button>
        <Button variant="outline" fullWidth onClick={() => handleSocial('Apple')} icon={<span></span>}>{t('continue_with_apple')}</Button>
      </div>

      {/* Rol keçidi yalnız development-də görünür. Produksiya build-ində rollar
          server tərəfindən təyin olunmalıdır — bu düymələr ora düşməməlidir. */}
      {import.meta.env.DEV && (
        <div className="mt-auto pt-8">
          <p className="text-center text-xs text-ink-500 mb-2">Yalnız development: digər rollarda bax</p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" fullWidth onClick={() => { loginAsRole('provider'); navigate('/provider/dashboard'); }}>Provayder demo</Button>
            <Button variant="ghost" size="sm" fullWidth onClick={() => { loginAsRole('admin'); navigate('/admin/dashboard'); }}>Admin demo</Button>
          </div>
        </div>
      )}
    </div>
  );
}
