export interface Quest {
  id: string;
  title: string;
  description: string;
  status: 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  category: 'MAIN' | 'DAILY' | 'WEEKLY';
  rewardExp: number;
  rewardMesos: number;
  estimatedPomos: number;
  actualPomos: number;
  createdAt: number;
  completedAt?: number;
}

export interface PlayerStatus {
  level: number;
  currentExp: number;
  requiredExp: number;
  mesos: number;
  activeQuestId: string | null;
}

export interface ShopItem {
  id: string;
  name: string;
  cost: number;
  description: string;
}

export interface InventoryItem {
  id: string;
  itemId: string;
  purchasedAt: number;
  isUsed: boolean;
}
