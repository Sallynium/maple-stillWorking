import { useGame } from '../context/GameContext';

const LEVEL_TITLES: Record<number, string> = {
  1: '初心者', 2: '見習生', 3: '冒險家', 5: '菁英戰士',
  10: '勇猛戰士', 20: '傳說勇者', 30: '楓之谷英雄',
};

function getLevelTitle(level: number): string {
  const keys = Object.keys(LEVEL_TITLES).map(Number).sort((a, b) => b - a);
  for (const k of keys) {
    if (level >= k) return LEVEL_TITLES[k];
  }
  return '初心者';
}

export default function Header() {
  const { player } = useGame();
  const pct = Math.min((player.currentExp / player.requiredExp) * 100, 100);
  const pctStr = pct.toFixed(2);

  return (
    <header className="w-full bg-[#0d1526]/90 border-b border-[#1e3a5f] backdrop-blur-sm px-4 py-3 flex items-center gap-4 z-10 sticky top-0">
      {/* Avatar & Level */}
      <div className="flex items-center gap-2 min-w-[140px]">
        <div className="w-10 h-10 rounded-full bg-[#1a2f4e] border-2 border-[#3b82f6] flex items-center justify-center text-xl select-none">
          🐶
        </div>
        <div className="text-left">
          <div className="text-xs text-[#64b5f6] font-bold tracking-wider">PLAYER</div>
          <div className="text-sm font-bold text-white leading-tight">
            Lv.<span className="text-[#ffd700] text-base">{player.level}</span>
            <span className="text-[#90caf9] ml-1 text-xs">{getLevelTitle(player.level)}</span>
          </div>
        </div>
      </div>

      {/* EXP Bar */}
      <div className="flex-1 flex flex-col gap-1">
        <div className="flex justify-between text-xs text-[#90caf9] mb-0.5">
          <span className="font-semibold tracking-wide">EXP</span>
          <span className="font-mono">
            {player.currentExp.toLocaleString()} / {player.requiredExp.toLocaleString()}
          </span>
        </div>
        <div className="relative h-4 bg-[#0a1628] rounded-full border border-[#1e4a7a] overflow-hidden">
          <div
            className="exp-bar-fill h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white drop-shadow">
            {pctStr}%
          </span>
        </div>
      </div>

      {/* Mesos */}
      <div className="flex items-center gap-2 min-w-[130px] justify-end">
        <div className="bg-[#1a2f4e] border border-[#ffd700]/40 rounded-lg px-3 py-1.5 flex items-center gap-2">
          <span className="text-lg">🪙</span>
          <div className="text-right">
            <div className="text-xs text-[#ffd700]/70 leading-none tracking-wider">MESOS</div>
            <div className="text-base font-bold text-[#ffd700] font-mono leading-tight">
              {player.mesos.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
