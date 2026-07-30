import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useProviderScope } from './useProviderScope';
import { areas, jitter } from '../../data/areas';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Sheet';
import { TextInput } from '../../components/FormField';
import { useToast } from '../../components/Toast';

export function ProviderBranches() {
  const { show } = useToast();
  const { providerId, myBranches } = useProviderScope();
  const addBranch = useAppStore((s) => s.addBranch);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [areaId, setAreaId] = useState(areas[0].id);

  const submit = () => {
    if (!name.trim() || !address.trim()) { show('Bütün sahələri doldurun', 'error'); return; }
    const area = areas.find((a) => a.id === areaId)!;
    const [lat, lng] = jitter(area.lat, area.lng, Math.floor(Math.random() * 100));
    addBranch({ providerId, name, area: area.name, address, lat, lng });
    show('Filial əlavə edildi', 'success');
    setOpen(false);
    setName(''); setAddress('');
  };

  return (
    <div className="p-5 max-w-3xl">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-ink-900">Filiallar</h1>
        <Button size="sm" onClick={() => setOpen(true)}>+ Filial əlavə et</Button>
      </div>
      <div className="grid md:grid-cols-2 gap-3">
        {myBranches.map((b) => (
          <div key={b.id} className="bg-white rounded-2xl border border-ink-100 p-4">
            <p className="font-bold text-ink-900">{b.name}</p>
            <p className="text-sm text-ink-500">{b.address}, {b.area}</p>
            <p className="text-xs text-ink-400 mt-1">📍 {b.lat.toFixed(4)}, {b.lng.toFixed(4)}</p>
          </div>
        ))}
      </div>

      <Modal open={open} onClose={() => setOpen(false)}>
        <h3 className="font-bold text-lg text-ink-900 mb-3">Yeni filial</h3>
        <TextInput label="Filial adı" value={name} onChange={(e) => setName(e.target.value)} />
        <label className="block mb-3">
          <span className="block text-sm font-semibold text-ink-800 mb-1">Ərazi</span>
          <select value={areaId} onChange={(e) => setAreaId(e.target.value)} className="w-full rounded-xl border border-ink-200 px-3.5 py-2.5 text-sm">
            {areas.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </label>
        <TextInput label="Ünvan" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Küçə, bina nömrəsi" />
        <Button fullWidth onClick={submit}>Əlavə et</Button>
      </Modal>
    </div>
  );
}
