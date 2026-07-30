import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { getCourse } from '../../data/mockData';
import { Badge } from '../../components/Badge';
import { formatAZN, formatDateAz } from '../../lib/utils';

export function AdminRegistrations() {
  const [tab, setTab] = useState<'reg' | 'trial'>('reg');
  const registrations = useAppStore((s) => s.registrations);
  const trials = useAppStore((s) => s.trialReservations);

  return (
    <div className="p-5 max-w-5xl">
      <h1 className="text-xl font-bold text-ink-900 mb-4">Qeydiyyat monitorinqi</h1>
      <div className="flex bg-white border border-ink-100 rounded-xl p-1 mb-4 w-fit">
        <button onClick={() => setTab('reg')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${tab === 'reg' ? 'bg-ink-900 text-white' : 'text-ink-500'}`}>Qeydiyyatlar ({registrations.length})</button>
        <button onClick={() => setTab('trial')} className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${tab === 'trial' ? 'bg-ink-900 text-white' : 'text-ink-500'}`}>Sınaq dərsləri ({trials.length})</button>
      </div>

      {tab === 'reg' ? (
        <div className="bg-white rounded-2xl border border-ink-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-xs text-ink-400 border-b border-ink-100">
                <th className="p-3">Qeydiyyat №</th><th className="p-3">Tələbə</th><th className="p-3">Kurs</th><th className="p-3">Məbləğ</th><th className="p-3">Status</th><th className="p-3">Tarix</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((r) => (
                <tr key={r.id} className="border-b border-ink-50 last:border-0">
                  <td className="p-3 font-mono text-xs">{r.regNumber}</td>
                  <td className="p-3">{r.studentName}</td>
                  <td className="p-3">{getCourse(r.courseId)?.title}</td>
                  <td className="p-3">{formatAZN(r.finalPrice)}</td>
                  <td className="p-3"><Badge tone={r.status === 'confirmed' || r.status === 'completed' ? 'teal' : r.status === 'cancelled' ? 'neutral' : 'coral'}>{r.status}</Badge></td>
                  <td className="p-3 text-xs text-ink-400">{formatDateAz(r.createdAt)}</td>
                </tr>
              ))}
              {registrations.length === 0 && <tr><td className="p-3 text-ink-400" colSpan={6}>Hələ qeydiyyat yoxdur.</td></tr>}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-ink-100 overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="text-left text-xs text-ink-400 border-b border-ink-100">
                <th className="p-3">Referans №</th><th className="p-3">Kurs</th><th className="p-3">Tarix</th><th className="p-3">Saat</th><th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {trials.map((t) => (
                <tr key={t.id} className="border-b border-ink-50 last:border-0">
                  <td className="p-3 font-mono text-xs">{t.refNumber}</td>
                  <td className="p-3">{getCourse(t.courseId)?.title}</td>
                  <td className="p-3 text-xs">{formatDateAz(t.date)}</td>
                  <td className="p-3 text-xs">{t.time}</td>
                  <td className="p-3"><Badge tone={t.status === 'confirmed' ? 'teal' : t.status === 'rejected' || t.status === 'cancelled' ? 'neutral' : 'gold'}>{t.status}</Badge></td>
                </tr>
              ))}
              {trials.length === 0 && <tr><td className="p-3 text-ink-400" colSpan={5}>Hələ sınaq dərsi yoxdur.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
