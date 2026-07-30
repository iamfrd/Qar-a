import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import { CrowMascot } from '../components/CrowMascot';
import { Button } from '../components/Button';
import { useAppStore } from '../store/useAppStore';
import { useLang } from '../i18n/LanguageContext';

const slides = [
  { titleKey: 'onboarding_1_title', bodyKey: 'onboarding_1_body', mood: 'default', emoji: '🗺️' },
  { titleKey: 'onboarding_2_title', bodyKey: 'onboarding_2_body', mood: 'thinking', emoji: '⭐' },
  { titleKey: 'onboarding_3_title', bodyKey: 'onboarding_3_body', mood: 'happy', emoji: '🎯' },
  { titleKey: 'onboarding_4_title', bodyKey: 'onboarding_4_body', mood: 'waving', emoji: '🎁' },
] as const;

export function Onboarding() {
  const [index, setIndex] = useState(0);
  const navigate = useNavigate();
  const setHasOnboarded = useAppStore((s) => s.setHasOnboarded);
  const { t } = useLang();

  const finish = () => {
    setHasOnboarded(true);
    navigate('/login');
  };

  const slide = slides[index];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex justify-end p-4">
        <button onClick={finish} className="text-sm font-semibold text-ink-400">{t('onboarding_skip')}</button>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-8 text-center gap-6">
        <div className="relative">
          <div className="w-40 h-40 rounded-full bg-ink-50 flex items-center justify-center">
            <CrowMascot size={100} mood={slide.mood} animated />
          </div>
          <span className="absolute -right-1 -bottom-1 text-3xl">{slide.emoji}</span>
        </div>
        <div>
          <h1 className="text-xl font-bold text-ink-900">{t(slide.titleKey)}</h1>
          <p className="text-sm text-ink-500 mt-2 max-w-xs mx-auto">{t(slide.bodyKey)}</p>
        </div>
      </div>
      <div className="flex justify-center gap-1.5 mb-6">
        {slides.map((_, i) => (
          <span key={i} className={clsx('h-1.5 rounded-full transition-all', i === index ? 'w-6 bg-ink-900' : 'w-1.5 bg-ink-200')} />
        ))}
      </div>
      <div className="px-6 pb-8">
        <Button
          fullWidth
          size="lg"
          onClick={() => (index < slides.length - 1 ? setIndex(index + 1) : finish())}
        >
          {index < slides.length - 1 ? t('onboarding_next') : t('onboarding_start')}
        </Button>
      </div>
    </div>
  );
}
