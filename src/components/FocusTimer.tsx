import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';

const FULL_SECONDS = 25 * 60;
const DEBUG_SECONDS = 10;

export default function FocusTimer() {
  const { player, quests, tickPomoProgress } = useGame();
  const activeQuest = quests.find((q) => q.id === player.activeQuestId);

  const [secondsLeft, setSecondsLeft] = useState(FULL_SECONDS);
  const [running, setRunning] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = debugMode ? DEBUG_SECONDS : FULL_SECONDS;

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  }, []);

  const reset = useCallback(
    (duration: number) => {
      stop();
      setSecondsLeft(duration);
    },
    [stop]
  );

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          stop();
          tickPomoProgress();
          return totalSeconds;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, stop, tickPomoProgress, totalSeconds]);

  // Reset timer when debug mode toggles
  useEffect(() => {
    reset(debugMode ? DEBUG_SECONDS : FULL_SECONDS);
  }, [debugMode, reset]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct = ((totalSeconds - secondsLeft) / totalSeconds) * 100;

  const canStart = !!activeQuest;

  const handleStartStop = () => {
    if (!canStart) return;
    if (running) { stop(); } else { setRunning(true); }
  };

  const handleReset = () => reset(totalSeconds);

  const pomos = activeQuest
    ? { actual: activeQuest.actualPomos, estimated: activeQuest.estimatedPomos }
    : null;

  return (
    <div className="flex flex-col items-center gap-4 h-full justify-center py-4">
      {/* Active quest display */}
      <div className="w-full bg-[#0a1628]/80 border border-[#1e3a5f] rounded-xl px-4 py-3 text-center">
        {activeQuest ? (
          <>
            <div className="text-xs text-[#64748b] tracking-wider mb-1">【當前任務】</div>
            <div className="text-sm font-bold text-[#90caf9] line-clamp-1">{activeQuest.title}</div>
          </>
        ) : (
          <div className="text-sm text-[#475569]">請先去任務面板接取任務</div>
        )}
      </div>

      {/* Circular timer */}
      <div className="relative flex items-center justify-center">
        <svg width="220" height="220" className="-rotate-90">
          <circle cx="110" cy="110" r="96" stroke="#1e3a5f" strokeWidth="10" fill="none" />
          <circle
            cx="110" cy="110" r="96"
            stroke={running ? '#54a0ff' : '#1e4a7a'}
            strokeWidth="10"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 96}`}
            strokeDashoffset={`${2 * Math.PI * 96 * (1 - pct / 100)}`}
            className="transition-all duration-500"
          />
        </svg>
        <div className="absolute flex flex-col items-center">
          <div
            className={`font-mono font-black text-5xl tabular-nums leading-none ${
              running ? 'text-[#90caf9]' : 'text-[#334155]'
            } ${!canStart ? 'opacity-40' : ''}`}
          >
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </div>
          <div className="text-xs text-[#475569] mt-1">
            {running ? '專注中...' : canStart ? '點擊開始' : '未接任務'}
          </div>
        </div>
      </div>

      {/* Pomo progress dots */}
      {pomos && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#475569]">進度：</span>
          {Array.from({ length: Math.max(pomos.actual, pomos.estimated) }, (_, i) => (
            <span
              key={i}
              className={`text-xl leading-none transition-all ${
                i < pomos.actual ? 'text-[#ff6b6b] scale-110' : 'text-[#1e3a5f]'
              }`}
            >
              {i < pomos.actual ? '●' : '◯'}
            </span>
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 w-full">
        <button
          onClick={handleStartStop}
          disabled={!canStart}
          className={`flex-1 py-3 rounded-xl font-bold text-base transition-all border
            ${running
              ? 'bg-[#7f1d1d]/60 text-[#f87171] border-[#f87171]/40 hover:bg-[#f87171] hover:text-[#450a0a]'
              : 'bg-[#1e4a7a]/60 text-[#54a0ff] border-[#54a0ff]/40 hover:bg-[#54a0ff] hover:text-white'
            }
            disabled:opacity-20 disabled:cursor-not-allowed`}
        >
          {running ? '⏸ 暫停' : '▶ 開始'}
        </button>
        <button
          onClick={handleReset}
          disabled={running}
          className="px-4 py-3 rounded-xl font-bold text-sm transition-all border
            bg-[#0d1e35] text-[#475569] border-[#1e3a5f]
            hover:text-[#90caf9] hover:border-[#54a0ff]
            disabled:opacity-20 disabled:cursor-not-allowed"
        >
          ↺ 重置
        </button>
      </div>

      {/* Debug toggle */}
      <button
        onClick={() => setDebugMode((d) => !d)}
        className={`w-full py-2 rounded-xl text-xs font-mono font-bold border transition-all
          ${debugMode
            ? 'bg-[#ffd700]/10 text-[#ffd700] border-[#ffd700]/40'
            : 'bg-[#0a1628]/60 text-[#334155] border-[#1e3a5f] hover:text-[#ffd700] hover:border-[#ffd700]/30'
          }`}
      >
        {debugMode ? '🐛 DEBUG MODE ON (10秒)' : '🐛 10秒快速除錯模式'}
      </button>
    </div>
  );
}
