import { useProviderScope } from './useProviderScope';
import { formatAZN } from '../../lib/utils';

export function ProviderAnalytics() {
  const { myCourses, myRegistrations, myTrials } = useProviderScope();

  const totalViews = myCourses.reduce((s, c) => s + c.views, 0);
  const totalClicks = myCourses.reduce((s, c) => s + c.clicks, 0);

  return (
    <div className="p-5 max-w-4xl">
      <h1 className="text-xl font-bold text-ink-900 mb-4">Analitika</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <MiniStat label="Baxış" value={totalViews} />
        <MiniStat label="Klik" value={totalClicks} />
        <MiniStat label="CTR" value={totalViews ? `${((totalClicks / totalViews) * 100).toFixed(1)}%` : '0%'} />
        <MiniStat label="Qeydiyyat sayı" value={myRegistrations.length} />
      </div>

      <div className="bg-white rounded-2xl border border-ink-100 overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead>
            <tr className="text-left text-xs text-ink-400 border-b border-ink-100">
              <th className="p-3">Kurs</th>
              <th className="p-3">Baxış</th>
              <th className="p-3">Klik</th>
              <th className="p-3">Sınaq tələbi</th>
              <th className="p-3">Qeydiyyat</th>
              <th className="p-3">Gəlir</th>
            </tr>
          </thead>
          <tbody>
            {myCourses.map((c) => {
              const trials = myTrials.filter((t) => t.courseId === c.id).length;
              const regs = myRegistrations.filter((r) => r.courseId === c.id);
              const revenue = regs.reduce((s, r) => s + r.finalPrice, 0);
              return (
                <tr key={c.id} className="border-b border-ink-50 last:border-0">
                  <td className="p-3 font-semibold text-ink-800">{c.title}</td>
                  <td className="p-3">{c.views}</td>
                  <td className="p-3">{c.clicks}</td>
                  <td className="p-3">{trials}</td>
                  <td className="p-3">{regs.length}</td>
                  <td className="p-3">{formatAZN(revenue)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-white rounded-2xl border border-ink-100 p-4">
      <p className="text-2xl font-bold text-ink-900">{value}</p>
      <p className="text-xs text-ink-400">{label}</p>
    </div>
  );
}
