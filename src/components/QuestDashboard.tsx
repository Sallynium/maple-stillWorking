import { useState } from 'react';
import { useGame } from '../context/GameContext';
import type { Quest } from '../types/game';

const CAT_STYLE: Record<Quest['category'], { label: string; color: string; border: string }> = {
  MAIN:   { label: '主線', color: '#ff9f43', border: '#ff9f4366' },
  DAILY:  { label: '日常', color: '#54a0ff', border: '#54a0ff66' },
  WEEKLY: { label: '週常', color: '#a29bfe', border: '#a29bfe66' },
};

function PomoRow({ actual, estimated }: { actual: number; estimated: number }) {
  const total = Math.max(actual, estimated, 1);
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: total }, (_, i) => (
        <div key={i}
          className={`w-3 h-3 border transition-all ${i < actual ? 'bg-[#cc3333] border-[#ff5555]' : 'bg-[#0a1628] border-[#1a3a5a]'}`}
          style={{ borderRadius: '1px', boxShadow: i < actual ? '0 0 5px rgba(204,51,51,0.6)' : 'none' }}
        />
      ))}
      <span className="font-silk text-[9px] text-[#2a4a6a] ml-1">
        {actual}/{estimated} 🍅
      </span>
    </div>
  );
}

function QuestCard({
  quest, tab, flash,
}: { quest: Quest; tab: string; flash: boolean }) {
  const { startQuest, completeQuest, failActiveQuest, player } = useGame();
  const [err, setErr] = useState('');
  const cat = CAT_STYLE[quest.category];

  const handleStart = () => {
    const e = startQuest(quest.id);
    if (e) { setErr(e); setTimeout(() => setErr(''), 3000); }
  };

  const isActive   = quest.status === 'IN_PROGRESS';
  const isDone     = quest.status === 'COMPLETED';
  const isFailed   = quest.status === 'FAILED';

  return (
    <div className={`
      pixel-panel p-3 flex flex-col gap-2 transition-all duration-300
      ${flash   ? 'quest-complete-flash' : ''}
      ${isActive ? 'border-[#4a90d9] shadow-[0_0_16px_rgba(74,144,217,0.25)]' : ''}
      ${isDone   ? 'opacity-50' : ''}
      ${isFailed ? 'opacity-30' : ''}
    `}>
      {/* Header row */}
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap mb-1">
            <span className="pixel-tag" style={{ color: cat.color, borderColor: cat.border }}>
              {cat.label}
            </span>
            {isActive && (
              <span className="pixel-tag text-[#4ade80] border-[#4ade80]/40"
                style={{ animation: 'bannerPulse 1s ease infinite' }}>
                ACTIVE
              </span>
            )}
            {isDone   && <span className="pixel-tag text-[#4ade80] border-[#4ade80]/40">DONE</span>}
            {isFailed && <span className="pixel-tag text-[#f87171] border-[#f87171]/40">FAILED</span>}
          </div>
          <div className="font-silk text-sm text-white font-bold leading-snug line-clamp-2">
            {quest.title}
          </div>
          {quest.description && (
            <div className="font-silk text-[10px] text-[#3a6a8a] mt-0.5 line-clamp-2">{quest.description}</div>
          )}
        </div>
        {/* Rewards */}
        <div className="text-right shrink-0 flex flex-col gap-0.5">
          <div className="font-pixel text-[8px] text-[#4ade80]" style={{ textShadow: '0 0 8px #4ade8066' }}>
            +{quest.rewardExp} EXP
          </div>
          <div className="font-pixel text-[8px] text-[#ffd700]" style={{ textShadow: '0 0 8px #ffd70066' }}>
            +{quest.rewardMesos} 🪙
          </div>
        </div>
      </div>

      <PomoRow actual={quest.actualPomos} estimated={quest.estimatedPomos} />

      {err && (
        <div className="font-silk text-[10px] text-[#ff6b6b] bg-[#ff6b6b]/10 border border-[#ff6b6b]/30 px-2 py-1">
          ⚠ {err}
        </div>
      )}

      {/* Actions */}
      {tab === 'available' && quest.status === 'AVAILABLE' && (
        <button onClick={handleStart} disabled={player.activeQuestId !== null}
          className="pixel-btn pixel-btn-blue w-full py-2 mt-1 text-[10px] tracking-wider">
          ⚔ 接受任務
        </button>
      )}
      {tab === 'active' && isActive && (
        <div className="flex gap-2 mt-1">
          <button onClick={() => completeQuest(quest.id)}
            className="pixel-btn pixel-btn-green flex-1 py-2 text-[10px]">
            ✔ 回報完成
          </button>
          <button onClick={failActiveQuest}
            className="pixel-btn pixel-btn-red flex-1 py-2 text-[10px]">
            ✖ 放棄任務
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
    setForm((p) => ({ ...p, title: '', description: '' }));
  };

  const available = quests.filter((q) => q.status === 'AVAILABLE');
  const active    = quests.find((q) => q.id === player.activeQuestId);
  const history   = quests.filter((q) => q.status === 'COMPLETED' || q.status === 'FAILED')
    .sort((a, b) => (b.completedAt ?? b.createdAt) - (a.completedAt ?? a.createdAt));

  return (
    <div className="flex flex-col h-full gap-3">
      {/* Tab bar */}
      <div className="pixel-panel p-1 flex gap-1">
        {(['available', 'active'] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 font-pixel text-[8px] tracking-wide transition-all ${
              tab === t
                ? 'bg-[#0e2a4a] text-[#54a0ff]'
                : 'text-[#2a4a6a] hover:text-[#4a8abf]'
            }`}
            style={{ borderRadius: '1px' }}
          >
            {t === 'available' ? `📋 佈告欄 (${available.length})` : `⚔ 進行 / 歷史`}
          </button>
        ))}
      </div>

      {tab === 'available' && (
        <>
          {/* Add quest form */}
          <form onSubmit={handleSubmit} className="pixel-panel p-3 flex flex-col gap-2">
            <div className="font-pixel text-[7px] text-[#2a6aaa] tracking-widest mb-1">＋ 新增任務</div>
            <input
              className="pixel-input w-full text-xs"
              placeholder="任務名稱 *"
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            />
            <input
              className="pixel-input w-full text-xs"
              placeholder="任務描述（選填）"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
            <div className="flex gap-2">
              <select
                value={form.category}
                onChange={(e) => setForm((p) => ({ ...p, category: e.target.value as Quest['category'] }))}
                className="pixel-input flex-1 text-xs"
              >
                <option value="DAILY">日常 (+30 EXP)</option>
                <option value="WEEKLY">週常 (+250 EXP)</option>
                <option value="MAIN">主線 (+100 EXP)</option>
              </select>
              <input
                type="number" min={1} max={20}
                value={form.estimatedPomos}
                onChange={(e) => setForm((p) => ({ ...p, estimatedPomos: Number(e.target.value) }))}
                className="pixel-input w-16 text-xs text-center"
                title="預估番茄鐘數"
              />
            </div>
            <button type="submit" className="pixel-btn pixel-btn-blue w-full py-2 text-[10px] tracking-wider">
              ＋ 張貼任務
            </button>
          </form>

          {/* Available list */}
          <div className="flex-1 overflow-y-auto flex flex-col gap-2 pr-0.5">
            {available.length === 0 ? (
              <div className="pixel-panel p-6 text-center">
                <div className="font-pixel text-[8px] text-[#1e3a5a] leading-loose">
                  佈告欄空空如也...<br />新增任務開始冒險吧！
                </div>
              </div>
            ) : (
              available.map((q) => (
                <QuestCard key={q.id} quest={q} tab="available" flash={flashQuestId === q.id} />
              ))
            )}
          </div>
        </>
      )}

      {tab === 'active' && (
        <div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-0.5">
          {active ? (
            <div>
              <div className="font-pixel text-[7px] text-[#4a90d9] tracking-widest mb-2 px-0.5">
                ⚔ 進行中任務
              </div>
              <QuestCard quest={active} tab="active" flash={flashQuestId === active.id} />
            </div>
          ) : (
            <div className="pixel-panel p-4 text-center">
              <div className="font-silk text-xs text-[#2a4a6a]">目前沒有進行中的任務</div>
            </div>
          )}

          {history.length > 0 && (
            <div>
              <div className="font-pixel text-[7px] text-[#2a4a6a] tracking-widest mb-2 px-0.5">
                📜 歷史紀錄
              </div>
              <div className="flex flex-col gap-2">
                {history.map((q) => (
                  <QuestCard key={q.id} quest={q} tab="history" flash={flashQuestId === q.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
