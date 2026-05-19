import { useGame } from '../context/GameContext';

export default function LevelUpBanner() {
  const { levelUpVisible, player } = useGame();

  if (!levelUpVisible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 pointer-events-none">
      <div className="level-up-banner bg-gradient-to-r from-[#ffd700] via-[#fffacd] to-[#ffd700] text-[#1a0a00] font-black text-2xl px-10 py-4 rounded-2xl shadow-[0_0_40px_rgba(255,215,0,0.8)] border-4 border-[#ffd700] tracking-widest text-center select-none">
        <div className="text-3xl mb-1">★ LEVEL UP! ★</div>
        <div className="text-base font-bold tracking-wider">
          現在是 <span className="text-[#8b0000] text-xl">Lv.{player.level}</span>！
        </div>
      </div>
    </div>
  );
}
