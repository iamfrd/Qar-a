import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../../store/useAppStore';
import { getProvider } from '../../data/mockData';
import { TopBar } from '../../components/TopBar';
import { EmptyState } from '../../components/EmptyState';
import { Sheet } from '../../components/Sheet';
import { formatDateAz } from '../../lib/utils';

export function Messages() {
  const navigate = useNavigate();
  const currentUser = useAppStore((s) => s.currentUser);
  const threads = useAppStore((s) => s.messageThreads.filter((t) => t.userId === currentUser?.id));
  const sendMessage = useAppStore((s) => s.sendMessage);
  const [openThreadId, setOpenThreadId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const openThread = threads.find((t) => t.id === openThreadId);

  return (
    <div className="min-h-screen bg-ink-50 pb-6">
      <TopBar title="Mesajlar" onBack={() => navigate('/app/profile')} />
      <div className="px-4">
        {threads.length === 0 ? (
          <EmptyState title="Hələ mesajın yoxdur" body="Kurs profilindən provayderlə əlaqə saxlaya bilərsən." />
        ) : (
          <div className="flex flex-col gap-2">
            {threads.map((t) => {
              const provider = getProvider(t.providerId);
              const last = t.messages[t.messages.length - 1];
              return (
                <button key={t.id} onClick={() => setOpenThreadId(t.id)} className="text-left bg-white rounded-xl border border-ink-100 p-3">
                  <div className="flex justify-between">
                    <p className="text-sm font-bold text-ink-900">{provider?.name}</p>
                    <span className="text-[11px] text-ink-400">{formatDateAz(t.updatedAt)}</span>
                  </div>
                  <p className="text-xs text-ink-500 mt-0.5">{t.subject}</p>
                  <p className="text-xs text-ink-400 truncate mt-0.5">{last?.text}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <Sheet open={!!openThread} onClose={() => setOpenThreadId(null)} title={openThread ? getProvider(openThread.providerId)?.name : ''}>
        {openThread && (
          <div className="flex flex-col gap-2">
            {openThread.messages.map((m) => (
              <div key={m.id} className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${m.fromRole === 'student' ? 'self-end bg-ink-900 text-white' : 'self-start bg-ink-100 text-ink-800'}`}>
                {m.text}
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Mesaj yaz..." className="flex-1 rounded-xl border border-ink-200 px-3 py-2 text-sm" />
              <button
                onClick={() => { if (draft.trim()) { sendMessage({ courseId: openThread.courseId, providerId: openThread.providerId, subject: openThread.subject, text: draft, fromRole: 'student', threadId: openThread.id }); setDraft(''); } }}
                className="bg-ink-900 text-white px-4 rounded-xl text-sm font-semibold"
              >
                Göndər
              </button>
            </div>
          </div>
        )}
      </Sheet>
    </div>
  );
}
