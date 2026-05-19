import { useGame } from '../context/GameContext';

export default function LevelUpBanner() {
  const { levelUpVisible, player } = useGame();
  if (!levelUpVisible) return null;

  return (
    <div className="fixed top-24 left-1/2 z-50 pointer-events-none"
      style={{ transform: 'translateX(-50%)' }}
    >
      <div className="level-up-banner relative px-10 py-5 text-center"
        style={{
          background: 'linear-gradient(180deg, #3a2000 0%, #1a0e00 50%, #2a1800 100%)',
          border: '3px solid #ffd700',
          boxShadow: '0 0 0 1px #aa7700, inset 0 0 0 1px #ffee88, inset 0 0 40px rgba(255,200,0,0.15)',
          borderRadius: '2px',
          minWidth: '320px',
        }}
      >
        {/* Corner decorations */}
        {['top-0 left-0','top-0 right-0','bottom-0 left-0','bottom-0 right-0'].map((pos) => (
          <div key={pos} className={`absolute ${pos} w-3 h-3 bg-[#ffd700]`}
            style={{ clipPath: 'polygon(0 0,100% 0,100% 100%)' }} />
        ))}

        <div className="font-pixel text-[18px] text-[#ffd700] tracking-widest mb-2"
          style={{ textShadow: '0 0 20px #ffd700, 0 2px 0 #aa5500' }}
        >
          ★ LEVEL UP! ★
        </div>
        <div className="font-silk text-sm text-[#ffdd88]">
          現在是{' '}
          <span className="font-pixel text-[16px] text-[#ffd700]"
            style={{ textShadow: '0 0 12px #ffd700' }}
          >
            Lv.{player.level}
          </span>
          ！
        </div>
      </div>
    </div>
  );
}
