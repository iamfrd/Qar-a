import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CrowMascot } from '../components/CrowMascot';
import { Button } from '../components/Button';
import { Sheet } from '../components/Sheet';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../components/Toast';
import { useLang } from '../i18n/LanguageContext';
import { areas } from '../data/areas';
import { BAKU_CENTER } from '../data/areas';

export function LocationPermission() {
  const [pickerOpen, setPickerOpen] = useState(false);
  const navigate = useNavigate();
  const { show } = useToast();
  const { t } = useLang();
  const setLocationPermission = useAppStore((s) => s.setLocationPermission);

  const useDeviceLocation = () => {
    if (!navigator.geolocation) {
      setLocationPermission(true, { lat: BAKU_CENTER[0], lng: BAKU_CENTER[1] });
      show('Cihaz məkanı tapılmadı, Bakı mərkəzi istifadə olunur', 'info');
      navigate('/app/map');
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocationPermission(true, { lat: pos.coords.latitude, lng: pos.coords.longitude });
        show('Məkanınız uğurla təyin edildi', 'success');
        navigate('/app/map');
      },
      () => {
        setLocationPermission(true, { lat: BAKU_CENTER[0], lng: BAKU_CENTER[1] });
        show('İcazə verilmədi, Bakı mərkəzi istifadə olunur', 'info');
        navigate('/app/map');
      }
    );
  };

  const chooseArea = (lat: number, lng: number, name: string) => {
    setLocationPermission(true, { lat, lng });
    show(`${name} ərazisi seçildi`, 'success');
    setPickerOpen(false);
    navigate('/app/map');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-8 text-center gap-5">
      <CrowMascot size={90} mood="thinking" animated />
      <div>
        <h1 className="text-xl font-bold text-ink-900">{t('location_title')}</h1>
        <p className="text-sm text-ink-500 mt-2 max-w-xs">{t('location_body')}</p>
      </div>
      <div className="w-full max-w-xs flex flex-col gap-2">
        <Button fullWidth size="lg" onClick={useDeviceLocation}>📍 {t('allow_location')}</Button>
        <Button fullWidth size="lg" variant="outline" onClick={() => setPickerOpen(true)}>{t('choose_manually')}</Button>
      </div>

      <Sheet open={pickerOpen} onClose={() => setPickerOpen(false)} title="Əraziyi seç">
        <div className="flex flex-col gap-1">
          {areas.map((a) => (
            <button key={a.id} onClick={() => chooseArea(a.lat, a.lng, a.name)} className="text-left px-3 py-3 rounded-xl hover:bg-ink-50 flex items-center gap-2">
              <span>📍</span>
              <span className="font-medium text-ink-800">{a.name}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}
