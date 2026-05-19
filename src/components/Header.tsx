import { useGame } from '../context/GameContext';

const LEVEL_TITLES: [number, string][] = [
  [30, '楓之谷英雄'], [20, '傳說勇者'], [10, '勇猛戰士'],
  [5,  '菁英戰士'],  [3,  '冒險家'],   [2,  '見習生'], [1, '初心者'],
];
function getLevelTitle(lv: number) {
  return (LEVEL_TITLES.find(([n]) => lv >= n) ?? [1, '初心者'])[1];
}

export default function Header() {
  const { player } = useGame();
  const pct = Math.min((player.currentExp / player.requiredExp) * 100, 100);

  return (
    <header className="relative z-20 w-full border-b-2 border-[#0e2a4a] bg-[#04080f]/95 backdrop-blur-sm px-5 py-2.5 flex items-center gap-5"
      style={{ boxShadow: '0 2px 0 #0a1a2e, 0 4px 20px rgba(0,0,0,0.8)' }}
    >
      {/* Decorative corner pixels */}
      <div className="absolute top-0 left-0 w-2 h-2 bg-[#1e4a7a]" />
      <div className="absolute top-0 right-0 w-2 h-2 bg-[#1e4a7a]" />

      {/* Avatar */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="relative">
          <div className="w-11 h-11 bg-[#0a1a30] border-2 border-[#2a6aaa] flex items-center justify-center text-2xl"
            style={{ boxShadow: '0 0 12px rgba(42,106,170,0.6), inset 0 0 8px rgba(0,0,0,0.5)', borderRadius: '2px' }}
          >
            🐶
          </div>
          {/* online dot */}
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-[#4ade80] border border-[#04080f]"
            style={{ borderRadius: '1px' }}
          />
        </div>
        <div>
          <div className="font-pixel text-[7px] text-[#2a6aaa] tracking-widest mb-0.5">PLAYER</div>
          <div className="font-silk text-sm font-bold text-white leading-none flex items-baseline gap-1.5">
            Lv.<span className="font-pixel text-[13px] text-[#ffd700]"
              style={{ textShadow: '0 0 10px #ffd700aa' }}
            >{player.level}</span>
            <span className="text-[#4a90d9] text-xs">{getLevelTitle(player.level)}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-[#0e2a4a] shrink-0" />

      {/* EXP bar */}
      <div className="flex-1 flex flex-col gap-1.5 min-w-0">
        <div className="flex justify-between items-center">
          <span className="font-pixel text-[7px] text-[#4a90d9] tracking-widest">EXPERIENCE</span>
          <span className="font-silk text-[10px] text-[#4a90d9]/70">
            {player.currentExp.toLocaleString()} / {player.requiredExp.toLocaleString()}
          </span>
        </div>
        <div className="relative h-4 bg-[#030810] border border-[#0e2a4a] overflow-hidden"
          style={{ borderRadius: '1px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)' }}
        >
          {/* Segmented marks */}
          {[25,50,75].map(p => (
            <div key={p} className="absolute top-0 bottom-0 w-px bg-[#0a1e34] z-10"
              style={{ left: `${p}%` }} />
          ))}
          <div
            className="exp-bar-fill h-full transition-all duration-700 ease-out"
            style={{ width: `${pct}%` }}
          />
          <span className="absolute inset-0 flex items-center justify-center font-pixel text-[6px] text-white/90 tracking-widest"
            style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}
          >
            {pct.toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Divider */}
      <div className="w-px h-10 bg-[#0e2a4a] shrink-0" />

      {/* Mesos */}
      <div className="shrink-0">
        <div className="pixel-panel-gold px-4 py-2 flex items-center gap-2.5">
          <span className="text-xl leading-none">🪙</span>
          <div>
            <div className="font-pixel text-[6px] text-[#c8900a]/80 tracking-widest">MESOS</div>
            <div className="font-pixel text-sm text-[#ffd700] leading-tight"
              style={{ textShadow: '0 0 12px #ffd700cc' }}
            >
              {player.mesos.toLocaleString()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
