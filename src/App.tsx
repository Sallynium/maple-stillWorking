import { GameProvider } from './context/GameContext';
import Header from './components/Header';
import QuestDashboard from './components/QuestDashboard';
import FocusTimer from './components/FocusTimer';
import InventoryShop from './components/InventoryShop';
import LevelUpBanner from './components/LevelUpBanner';

function AppInner() {
  return (
    <div className="min-h-screen bg-[#060d1a] text-white flex flex-col">
      {/* Ambient background gradients */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 20% 50%, rgba(30,58,138,0.15) 0%, transparent 60%), ' +
            'radial-gradient(ellipse at 80% 20%, rgba(88,28,135,0.1) 0%, transparent 60%), ' +
            'radial-gradient(ellipse at 50% 80%, rgba(6,78,59,0.08) 0%, transparent 60%)',
        }}
      />

      <Header />
      <LevelUpBanner />

      {/* Three-column layout */}
      <main className="relative flex-1 grid grid-cols-[1fr_300px_280px] gap-4 p-4 max-w-[1440px] mx-auto w-full">
        {/* Left — Quest Dashboard */}
        <div className="flex flex-col" style={{ maxHeight: 'calc(100vh - 80px)' }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#54a0ff] rounded-full" />
            <h2 className="text-sm font-bold text-[#64b5f6] tracking-widest uppercase m-0">
              任務佈告欄
            </h2>
          </div>
          <div className="flex-1 overflow-hidden">
            <QuestDashboard />
          </div>
        </div>

        {/* Center — Focus Timer */}
        <div
          className="flex flex-col bg-[#0a1628]/70 border border-[#1e3a5f] rounded-2xl p-4"
          style={{ maxHeight: 'calc(100vh - 80px)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#a29bfe] rounded-full" />
            <h2 className="text-sm font-bold text-[#a29bfe] tracking-widest uppercase m-0">
              時間神殿
            </h2>
          </div>
          <FocusTimer />
        </div>

        {/* Right — Shop & Inventory */}
        <div
          className="flex flex-col overflow-y-auto"
          style={{ maxHeight: 'calc(100vh - 80px)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1 h-5 bg-[#ffd700] rounded-full" />
            <h2 className="text-sm font-bold text-[#ffd700] tracking-widest uppercase m-0">
              商城 / 背包
            </h2>
          </div>
          <InventoryShop />
        </div>
      </main>

      <footer className="text-center text-xs text-[#1e3a5f] py-2 tracking-widest">
        MapleFocus ✦ 楓之谷風格遊戲化番茄鐘
      </footer>
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
