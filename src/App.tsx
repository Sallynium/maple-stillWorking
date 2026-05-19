import { GameProvider } from './context/GameContext';
import Header from './components/Header';
import QuestDashboard from './components/QuestDashboard';
import FocusTimer from './components/FocusTimer';
import InventoryShop from './components/InventoryShop';
import LevelUpBanner from './components/LevelUpBanner';

/* Randomised star field */
const STARS = Array.from({ length: 60 }, (_, i) => ({
  id: i,
  top:   `${Math.random() * 100}%`,
  left:  `${Math.random() * 100}%`,
  size:  Math.random() < 0.3 ? 2 : 1,
  dur:   `${1.5 + Math.random() * 3}s`,
  delay: `${Math.random() * 4}s`,
}));

function StarField() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {STARS.map((s) => (
        <div
          key={s.id}
          className="star absolute rounded-none bg-white"
          style={{
            top: s.top, left: s.left,
            width: s.size, height: s.size,
            '--dur': s.dur, '--delay': s.delay,
          } as React.CSSProperties}
        />
      ))}
      {/* Deep space gradient */}
      <div className="absolute inset-0"
        style={{ background:
          'radial-gradient(ellipse at 15% 40%, rgba(20,40,120,0.25) 0%, transparent 55%),' +
          'radial-gradient(ellipse at 85% 15%, rgba(70,20,110,0.18) 0%, transparent 50%),' +
          'radial-gradient(ellipse at 50% 90%, rgba(0,60,40,0.12) 0%, transparent 50%)',
        }}
      />
    </div>
  );
}

function ColumnTitle({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-2 h-2 border border-current rotate-45 shrink-0" style={{ color }} />
      <span className="font-pixel text-[9px] tracking-widest uppercase" style={{ color }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, ${color}55, transparent)` }} />
    </div>
  );
}

function AppInner() {
  return (
    <div className="scanlines min-h-screen bg-[#07091a] text-white flex flex-col relative">
      <StarField />

      <div className="relative z-10 flex flex-col min-h-screen">
        <Header />
        <LevelUpBanner />

        <main className="flex-1 grid grid-cols-[1fr_310px_290px] gap-4 p-4 max-w-[1480px] mx-auto w-full">

          {/* ── Left: Quest Dashboard ── */}
          <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 88px)' }}>
            <ColumnTitle color="#54a0ff" label="任務佈告欄" />
            <div className="flex-1 overflow-hidden">
              <QuestDashboard />
            </div>
          </div>

          {/* ── Center: Focus Timer ── */}
          <div className="flex flex-col pixel-panel p-4" style={{ maxHeight: 'calc(100vh - 88px)' }}>
            <ColumnTitle color="#a29bfe" label="時間神殿" />
            <FocusTimer />
          </div>

          {/* ── Right: Shop & Inventory ── */}
          <div className="flex flex-col overflow-y-auto" style={{ maxHeight: 'calc(100vh - 88px)' }}>
            <ColumnTitle color="#ffd700" label="商城 / 背包" />
            <InventoryShop />
          </div>
        </main>

        <footer className="relative text-center py-2 px-4 border-t border-[#0e2040]">
          <span className="font-pixel text-[7px] text-[#1e3a5f] tracking-widest">
            ✦ MAPLEFOCUS v1.0 ✦ 楓之谷風格遊戲化番茄鐘 ✦
          </span>
        </footer>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <GameProvider>
      <AppInner />
    </GameProvider>
  );
}
