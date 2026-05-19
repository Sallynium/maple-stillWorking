import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { Quest, PlayerStatus, ShopItem, InventoryItem } from '../types/game';
import { useLocalStorage } from '../hooks/useLocalStorage';

const SHOP_ITEMS: ShopItem[] = [
  { id: '1', name: '喝一杯手搖飲', cost: 50, description: '犒賞一下自己，來一杯吧！' },
  { id: '2', name: '打一場 LOL 30分鐘', cost: 80, description: '上分機會到了，快去征服峽谷！' },
  { id: '3', name: '看 20 分鐘 YouTube/社群', cost: 40, description: '適度放鬆，刷刷影片補充能量。' },
];

const DEFAULT_PLAYER: PlayerStatus = {
  level: 1,
  currentExp: 0,
  requiredExp: 50,
  mesos: 100,
  activeQuestId: null,
};

function calcRequiredExp(level: number): number {
  return level * level * 50;
}

interface GameContextValue {
  player: PlayerStatus;
  quests: Quest[];
  inventory: InventoryItem[];
  shopItems: ShopItem[];
  levelUpVisible: boolean;
  flashQuestId: string | null;
  addQuest: (title: string, description: string, category: Quest['category'], estimatedPomos: number) => void;
  startQuest: (questId: string) => string | null;
  tickPomoProgress: () => void;
  failActiveQuest: () => void;
  completeQuest: (questId: string) => void;
  buyShopItem: (itemId: string) => string | null;
  useInventoryItem: (inventoryItemId: string) => void;
}

const GameContext = createContext<GameContextValue | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [player, setPlayer] = useLocalStorage<PlayerStatus>('maple_player', DEFAULT_PLAYER);
  const [quests, setQuests] = useLocalStorage<Quest[]>('maple_quests', []);
  const [inventory, setInventory] = useLocalStorage<InventoryItem[]>('maple_inventory', []);
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  const [flashQuestId, setFlashQuestId] = useState<string | null>(null);
  const levelUpTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerLevelUp = useCallback(() => {
    setLevelUpVisible(true);
    if (levelUpTimer.current) clearTimeout(levelUpTimer.current);
    levelUpTimer.current = setTimeout(() => setLevelUpVisible(false), 3000);
  }, []);

  const applyExpAndMesos = useCallback(
    (prev: PlayerStatus, expGain: number, mesosGain: number, onLevelUp: () => void): PlayerStatus => {
      let { level, currentExp, requiredExp, mesos } = prev;
      mesos += mesosGain;
      currentExp += expGain;

      let didLevelUp = false;
      while (currentExp >= requiredExp) {
        currentExp -= requiredExp;
        level += 1;
        requiredExp = calcRequiredExp(level);
        didLevelUp = true;
      }
      if (didLevelUp) onLevelUp();

      return { ...prev, level, currentExp, requiredExp, mesos };
    },
    []
  );

  const addQuest = useCallback(
    (title: string, description: string, category: Quest['category'], estimatedPomos: number) => {
      const rewards: Record<Quest['category'], { exp: number; mesos: number }> = {
        MAIN:   { exp: 100, mesos: 200 },
        DAILY:  { exp: 30,  mesos: 50  },
        WEEKLY: { exp: 250, mesos: 500 },
      };
      const { exp, mesos } = rewards[category];
      const newQuest: Quest = {
        id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        title,
        description,
        status: 'AVAILABLE',
        category,
        rewardExp: exp,
        rewardMesos: mesos,
        estimatedPomos,
        actualPomos: 0,
        createdAt: Date.now(),
      };
      setQuests((prev) => [...prev, newQuest]);
    },
    [setQuests]
  );

  const startQuest = useCallback(
    (questId: string): string | null => {
      if (player.activeQuestId !== null) {
        return '已有正在進行中的任務，請先完成或放棄當前任務！';
      }
      setQuests((prev) =>
        prev.map((q) => (q.id === questId ? { ...q, status: 'IN_PROGRESS' } : q))
      );
      setPlayer((prev) => ({ ...prev, activeQuestId: questId }));
      return null;
    },
    [player.activeQuestId, setQuests, setPlayer]
  );

  const tickPomoProgress = useCallback(() => {
    if (!player.activeQuestId) return;
    const id = player.activeQuestId;
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, actualPomos: q.actualPomos + 1 } : q))
    );
    setPlayer((prev) => applyExpAndMesos(prev, 5, 10, triggerLevelUp));
  }, [player.activeQuestId, setQuests, setPlayer, applyExpAndMesos, triggerLevelUp]);

  const failActiveQuest = useCallback(() => {
    if (!player.activeQuestId) return;
    const id = player.activeQuestId;
    setQuests((prev) =>
      prev.map((q) => (q.id === id ? { ...q, status: 'FAILED' } : q))
    );
    setPlayer((prev) => ({
      ...prev,
      mesos: Math.max(0, prev.mesos - 20),
      activeQuestId: null,
    }));
  }, [player.activeQuestId, setQuests, setPlayer]);

  const completeQuest = useCallback(
    (questId: string) => {
      const quest = quests.find((q) => q.id === questId);
      if (!quest) return;

      setFlashQuestId(questId);
      setTimeout(() => setFlashQuestId(null), 900);

      setQuests((prev) =>
        prev.map((q) =>
          q.id === questId ? { ...q, status: 'COMPLETED', completedAt: Date.now() } : q
        )
      );
      setPlayer((prev) => {
        const withoutActive = { ...prev, activeQuestId: null };
        return applyExpAndMesos(withoutActive, quest.rewardExp, quest.rewardMesos, triggerLevelUp);
      });
    },
    [quests, setQuests, setPlayer, applyExpAndMesos, triggerLevelUp]
  );

  const buyShopItem = useCallback(
    (itemId: string): string | null => {
      const item = SHOP_ITEMS.find((s) => s.id === itemId);
      if (!item) return '找不到該商品';
      if (player.mesos < item.cost) return `楓幣不足！需要 ${item.cost} 楓幣`;
      setPlayer((prev) => ({ ...prev, mesos: prev.mesos - item.cost }));
      const newItem: InventoryItem = {
        id: `inv_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        itemId,
        purchasedAt: Date.now(),
        isUsed: false,
      };
      setInventory((prev) => [...prev, newItem]);
      return null;
    },
    [player.mesos, setPlayer, setInventory]
  );

  const useInventoryItem = useCallback(
    (inventoryItemId: string) => {
      setInventory((prev) =>
        prev.map((item) =>
          item.id === inventoryItemId ? { ...item, isUsed: true } : item
        )
      );
    },
    [setInventory]
  );

  return (
    <GameContext.Provider
      value={{
        player,
        quests,
        inventory,
        shopItems: SHOP_ITEMS,
        levelUpVisible,
        flashQuestId,
        addQuest,
        startQuest,
        tickPomoProgress,
        failActiveQuest,
        completeQuest,
        buyShopItem,
        useInventoryItem,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextValue {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used inside GameProvider');
  return ctx;
}
