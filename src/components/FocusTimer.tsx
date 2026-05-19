import { useState, useEffect, useRef, useCallback } from 'react';
import { useGame } from '../context/GameContext';

const FULL_SECONDS  = 25 * 60;
const DEBUG_SECONDS = 10;

export default function FocusTimer() {
  const { player, quests, tickPomoProgress } = useGame();
  const activeQuest = quests.find((q) => q.id === player.activeQuestId);

  const [secondsLeft, setSecondsLeft] = useState(FULL_SECONDS);
  const [running, setRunning]         = useState(false);
  const [debugMode, setDebugMode]     = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const totalSeconds = debugMode ? DEBUG_SECONDS : FULL_SECONDS;

  const stop = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    intervalRef.current = null;
    setRunning(false);
  }, []);

  const reset = useCallback((dur: number) => { stop(); setSecondsLeft(dur); }, [stop]);

  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) { stop(); tickPomoProgress(); return totalSeconds; }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, stop, tickPomoProgress, totalSeconds]);

  useEffect(() => { reset(debugMode ? DEBUG_SECONDS : FULL_SECONDS); }, [debugMode, reset]);

  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const pct  = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const circumference = 2 * Math.PI * 88;
  const canStart = !!activeQuest;
  const pomos = activeQuest
    ? { actual: activeQuest.actualPomos, estimated: activeQuest.estimatedPomos }
    : null;

  return (
    <div className="flex flex-col items-center gap-4 flex-1 justify-center py-2">

      {/* Active quest banner */}
      <div className="w-full pixel-panel px-3 py-2.5 text-center">
        {activeQuest ? (
          <>
            <div className="font-pixel text-[7px] text-[#2a6aaa] tracking-widest mb-1">【當前任務】</div>
            <div className="font-silk text-xs text-[#7abeff] leading-tight line-clamp-2">{activeQuest.title}</div>
          </>
        ) : (
          <div className="font-silk text-xs text-[#2a4a6a]">← 請先在任務面板接取任務</div>
        )}
      </div>

      {/* Circular timer */}
      <div className="relative flex items-center justify-center">
        {/* Outer glow ring */}
        <div className="absolute rounded-full pointer-events-none"
          style={{
            width: 210, height: 210,
            background: running
              ? 'radial-gradient(circle, rgba(74,144,217,0.08) 0%, transparent 70%)'
              : 'transparent',
            transition: 'background 0.5s',
          }}
        />
        <svg width="200" height="200" className="-rotate-90" style={{ overflow: 'visible' }}>
          {/* Track */}
          <circle cx="100" cy="100" r="88"
            stroke="#0a1e34" strokeWidth="12" fill="none"
          />
          {/* Tick marks */}
          {Array.from({ length: 60 }, (_, i) => {
            const angle = (i / 60) * 2 * Math.PI - Math.PI / 2;
            const isMajor = i % 5 === 0;
            const inner = isMajor ? 72 : 76;
            const outer = 84;
            return (
              <line key={i}
                x1={100 + inner * Math.cos(angle)} y1={100 + inner * Math.sin(angle)}
                x2={100 + outer * Math.cos(angle)} y2={100 + outer * Math.sin(angle)}
                stroke={isMajor ? '#1e4a7a' : '#0e2a4a'} strokeWidth={isMajor ? 2 : 1}
              />
            );
          })}
          {/* Progress arc */}
          <circle cx="100" cy="100" r="88"
            stroke={running ? '#4a90d9' : '#1e3a5a'}
            strokeWidth="8"
            fill="none"
            strokeLinecap="square"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - pct / 100)}
            style={{ transition: 'stroke-dashoffset 0.5s linear, stroke 0.4s', filter: running ? 'drop-shadow(0 0 6px #4a90d9)' : 'none' }}
          />
          {/* Progress head dot */}
          {running && (() => {
            const angle = (pct / 100) * 2 * Math.PI - Math.PI / 2;
            return <circle cx={100 + 88 * Math.cos(angle)} cy={100 + 88 * Math.sin(angle)}
              r="5" fill="#a8d4ff" style={{ filter: 'drop-shadow(0 0 4px #4a90d9)' }} />;
          })()}
        </svg>

        {/* Timer digits */}
        <div className="absolute flex flex-col items-center select-none">
          <div className={`font-pixel tabular-nums leading-none transition-all duration-300 ${
            running ? 'text-[#90c8ff]' : canStart ? 'text-[#2a5a8a]' : 'text-[#1a2a3a]'
          }`}
            style={{
              fontSize: '2.6rem',
              textShadow: running ? '0 0 20px #4a90d9, 0 0 40px rgba(74,144,217,0.4)' : 'none',
            }}
          >
            {String(mins).padStart(2,'0')}:{String(secs).padStart(2,'0')}
          </div>
          <div className="font-pixel text-[6px] text-[#1e3a5a] tracking-widest mt-2">
            {running ? 'FOCUSING...' : canStart ? 'READY' : 'NO QUEST'}
          </div>
        </div>
      </div>

      {/* Pomo dots */}
      {pomos && (
        <div className="flex items-center gap-1.5">
          <span className="font-pixel text-[7px] text-[#2a4a6a] mr-1">POMOS</span>
          {Array.from({ length: Math.max(pomos.actual, pomos.estimated, 1) }, (_, i) => (
            <div key={i}
              className={`w-4 h-4 border transition-all duration-300 ${
                i < pomos.actual
                  ? 'bg-[#cc3333] border-[#ff5555]'
                  : 'bg-[#0a1628] border-[#1e3a5a]'
              }`}
              style={{
                borderRadius: '1px',
                boxShadow: i < pomos.actual ? '0 0 8px rgba(204,51,51,0.7)' : 'none',
              }}
            />
          ))}
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 w-full">
        <button
          onClick={() => { if (!canStart) return; running ? stop() : setRunning(true); }}
          disabled={!canStart}
          className={`pixel-btn flex-1 py-3 ${running ? 'pixel-btn-red' : 'pixel-btn-blue'}`}
        >
          {running ? '⏸  PAUSE' : '▶  START'}
        </button>
        <button
          onClick={() => reset(totalSeconds)}
          disabled={running}
          className="pixel-btn px-4 py-3"
          style={{
            background: '#04080f', borderColor: '#1e3a5a', color: '#2a5a8a',
            boxShadow: 'inset 0 1px 0 #1a3a5a, 0 3px 0 #020408',
          }}
        >
          ↺
        </button>
      </div>

      {/* Debug toggle */}
      <button
        onClick={() => setDebugMode((d) => !d)}
        className="pixel-btn w-full py-2"
        style={{
          background: debugMode ? 'rgba(255,215,0,0.08)' : '#030810',
          borderColor: debugMode ? '#ddaa00' : '#0e2040',
          color: debugMode ? '#ffd700' : '#1e3a5a',
          boxShadow: debugMode ? '0 0 12px rgba(255,215,0,0.25), inset 0 1px 0 #c8900a, 0 3px 0 #080600' : 'inset 0 1px 0 #0e2040, 0 3px 0 #020408',
          fontSize: '9px',
        }}
      >
        🐛  {debugMode ? 'DEBUG ON · 10 SEC MODE' : '10秒快速除錯模式'}
      </button>
    </div>
  );
}
