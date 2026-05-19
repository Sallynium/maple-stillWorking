import { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { Quest } from '../types/game';

const CATEGORY_LABELS: Record<Quest['category'], string> = {
  MAIN: '主線任務', DAILY: '日常任務', WEEKLY: '週常任務',
};
const CATEGORY_COLORS: Record<Quest['category'], string> = {
  MAIN: 'text-[#ff9f43] border-[#ff9f43]/50',
  DAILY: 'text-[#54a0ff] border-[#54a0ff]/50',
  WEEKLY: 'text-[#a29bfe] border-[#a29bfe]/50',
};
const STATUS_LABELS: Record<Quest['status'], string> = {
  AVAILABLE: '可接', IN_PROGRESS: '進行中', COMPLETED: '已完成', FAILED: '已失敗',
};

function PomoIcons({ actual, estimated }: { actual: number; estimated: number }) {
  const total = Math.max(actual, estimated);
  return (
    <span className="font-mono text-sm tracking-wider">
      {Array.from({ length: total }, (_, i) => (
        <span key={i} className={i < actual ? 'text-[#ff6b6b]' : 'text-[#2d4a6b]'}>
          {i < actual ? '●' : '◯'}
        </span>
      ))}
    </span>
  );
}

function QuestCard({ quest, tab, onFlash }: { quest: Quest; tab: string; onFlash: boolean }) {
  const { startQuest, completeQuest, failActiveQuest, player } = useGame();
  const [error, setError] = useState('');

  const handleStart = () => {
    const err = startQuest(quest.id);
    if (err) { setError(err); setTimeout(() => setError(''), 3000); }
  };

  const catCls = CATEGORY_COLORS[quest.category];

  return (
    <div
      className={`
        bg-[#0d1e35]/80 border rounded-xl p-4 flex flex-col gap-2 transition-all duration-300
        ${onFlash ? 'quest-complete-flash border-[#22c55e]/60' : 'border-[#1e3a5f]'}
        ${quest.status === 'IN_PROGRESS' ? 'border-[#54a0ff]/50 shadow-[0_0_12px_rgba(84,160,255,0.2)]' : ''}
        ${quest.status === 'COMPLETED' ? 'opacity-60' : ''}
        ${quest.status === 'FAILED' ? 'opacity-40' : ''}
      `}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs border px-2 py-0.5 rounded-full font-bold ${catCls}`}>
              {CATEGORY_LABELS[quest.category]}
            </span>
            <span className="text-xs text-[#64748b]">{STATUS_LABELS[quest.status]}</span>
          </div>
          <div className="text-white font-bold text-sm">{quest.title}</div>
          {quest.description && (
            <div className="text-[#64748b] text-xs mt-0.5 line-clamp-2">{quest.description}</div>
          )}
        </div>
        <div className="text-right shrink-0">
          <div className="text-xs text-[#4ade80] font-mono">+{quest.rewardExp} EXP</div>
          <div className="text-xs text-[#ffd700] font-mono">+{quest.rewardMesos} 🪙</div>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <PomoIcons actual={quest.actualPomos} estimated={quest.estimatedPomos} />
        <span className="text-xs text-[#475569]">預估 {quest.estimatedPomos} 個番茄</span>
      </div>

      {error && <div className="text-xs text-[#ff6b6b] bg-[#ff6b6b]/10 px-2 py-1 rounded">{error}</div>}

      {tab === 'available' && quest.status === 'AVAILABLE' && (
        <button
          onClick={handleStart}
          disabled={player.activeQuestId !== null}
          className="mt-1 w-full py-1.5 rounded-lg text-sm font-bold transition-all
            bg-[#1e3a5f] text-[#54a0ff] border border-[#54a0ff]/40
            hover:bg-[#54a0ff] hover:text-white hover:border-[#54a0ff]
            disabled:opacity-30 disabled:cursor-not-allowed"
        >
          ⚔️ 接受任務
        </button>
      )}

      {tab === 'active' && quest.status === 'IN_PROGRESS' && (
        <div className="flex gap-2 mt-1">
          <button
            onClick={() => completeQuest(quest.id)}
            className="flex-1 py-1.5 rounded-lg text-sm font-bold
              bg-[#166534]/60 text-[#4ade80] border border-[#4ade80]/40
              hover:bg-[#4ade80] hover:text-[#052e16] transition-all"
          >
            ✅ 回報完成
          </button>
          <button
            onClick={failActiveQuest}
            className="flex-1 py-1.5 rounded-lg text-sm font-bold
              bg-[#7f1d1d]/60 text-[#f87171] border border-[#f87171]/40
              hover:bg-[#f87171] hover:text-[#450a0a] transition-all"
          >
            🏳️ 放棄任務
          </button>
        </div>
      )}
    </div>
  );
}

export default function QuestDashboard() {
  const { quests, player, addQuest, flashQuestId } = useGame();
  const [tab, setTab] = useState<'available' | 'active'>('available');
  const [form, setForm] = useState({
    title: '', description: '', category: 'DAILY' as Quest['category'], estimatedPomos: 1,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim()) return;
    addQuest(form.title.trim(), form.description.trim(), form.category, form.estimatedPomos);
    setForm({ title: '', description: '', category: 'DAILY', estimatedPomos: 1 });
  };

  const availableQuests = quests.filter((q) => q.status === 'AVAILABLE');
  const activeQuest = quests.find((q) => q.id === player.activeQuestId);
  const historicQuests = quests.filter((q) => q.status === 'COMPLETED' || q.status === 'FAILED');

  return (
    <div className="flex flex-col h-full gap-3">
      <div className="bg-[#0a1628]/80 border border-[#1e3a5f] rounded-2xl p-1.5 flex gap-1">
        {(['available', 'active'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              tab === t
                ? 'bg-[#1e4a7a] text-[#90caf9] shadow-inner'
                : 'text-[#475569] hover:text-[#90caf9]'
            }`}
          >
            {t === 'available' ? `📋 任務佈告欄 (${availableQuests.length})` : `⚔️ 進行中 / 歷史`}
          </button>
        ))}
      </div>

      {tab === 'available' && (
        <>
          <form
            onSubmit={handleSubmit}
            className="bg-[#0a1628]/80 border border-[#1e3a5f] rounded-xl p-3 flex flex-col gap-2"
          >
            <div className="text-xs font-bold text-[#64b5f6] tracking-wider mb-1">＋ 新增任務</div>
            <input
              type="text"
              placeholder="任務名稱 *"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              className="bg-[#0d1e35] border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-sm text-white placeholder-[#334155] outline-none focus:border-[#54a0ff] transition"
            />
            <input
              type="text"
              placeholder="任務描述（選填）"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              className="bg-[#0d1e35] border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-sm text-white placeholder-[#334155] outline-none focus:border-[#54a0ff] transition"
            />
            <div className="flex gap-2">
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Quest['category'] }))}
                className="flex-1 bg-[#0d1e35] border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-sm text-white outline-none focus:border-[#54a0ff] transition"
              >
                <option value="DAILY">日常任務 (+30 EXP)</option>
                <option value="WEEKLY">週常任務 (+250 EXP)</option>
                <option value="MAIN">主線任務 (+100 EXP)</option>
              </select>
              <input
                type="number"
                min={1}
                max={20}
                value={form.estimatedPomos}
                onChange={(e) => setForm((p) => ({ ...p, estimatedPomos: Number(e.target.value) }))}
                className="w-20 bg-[#0d1e35] border border-[#1e3a5f] rounded-lg px-3 py-1.5 text-sm text-white text-center outline-none focus:border-[#54a0ff] transition"
                title="預估番茄鐘數"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-[#1e4a7a] hover:bg-[#2563eb] text-[#90caf9] hover:text-white rounded-lg text-sm font-bold border border-[#54a0ff]/30 hover:border-[#54a0ff] transition-all"
            >
              ＋ 張貼任務
            </button>
          </form>

          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-1">
            {availableQuests.length === 0 ? (
              <div className="text-center text-[#334155] text-sm py-8">
                佈告欄空空如也...
                <br />新增一個任務來開始冒險吧！
              </div>
            ) : (
              availableQuests.map((q) => (
                <QuestCard key={q.id} quest={q} tab="available" onFlash={flashQuestId === q.id} />
              ))
            )}
          </div>
        </>
      )}

      {tab === 'active' && (
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1">
          {activeQuest ? (
            <div>
              <div className="text-xs font-bold text-[#54a0ff] tracking-wider mb-2 px-1">⚔️ 當前任務</div>
              <QuestCard quest={activeQuest} tab="active" onFlash={flashQuestId === activeQuest.id} />
            </div>
          ) : (
            <div className="text-center text-[#334155] text-sm py-4 bg-[#0a1628]/60 rounded-xl border border-[#1e3a5f]">
              目前沒有進行中的任務
            </div>
          )}

          {historicQuests.length > 0 && (
            <div>
              <div className="text-xs font-bold text-[#475569] tracking-wider mb-2 px-1">📜 歷史紀錄</div>
              <div className="flex flex-col gap-2">
                {historicQuests
                  .slice()
                  .sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt))
                  .map((q) => (
                    <QuestCard key={q.id} quest={q} tab="history" onFlash={flashQuestId === q.id} />
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
