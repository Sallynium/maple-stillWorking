import { useState } from 'react';
import { useGame } from '../context/GameContext';

export default function InventoryShop() {
  const { player, shopItems, inventory, buyShopItem, useInventoryItem } = useGame();
  const [buyMsg, setBuyMsg] = useState('');

  const handleBuy = (itemId: string) => {
    const err = buyShopItem(itemId);
    const msg = err ?? '✅ 購買成功！';
    setBuyMsg(msg);
    setTimeout(() => setBuyMsg(''), 2500);
  };

  const unusedItems = inventory.filter((i) => !i.isUsed);

  const getShopItem = (itemId: string) => shopItems.find((s) => s.id === itemId);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Shop */}
      <div className="bg-[#0a1628]/80 border border-[#1e3a5f] rounded-2xl p-3 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold text-[#ffd700] tracking-widest">🏪 楓之谷商城</div>
          <div className="text-xs text-[#ffd700]/60 font-mono">
            🪙 {player.mesos.toLocaleString()}
          </div>
        </div>

        {buyMsg && (
          <div className={`text-xs px-3 py-2 rounded-lg font-bold ${
            buyMsg.startsWith('✅')
              ? 'bg-[#166534]/40 text-[#4ade80] border border-[#4ade80]/30'
              : 'bg-[#7f1d1d]/40 text-[#f87171] border border-[#f87171]/30'
          }`}>
            {buyMsg}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {shopItems.map((item) => {
            const canAfford = player.mesos >= item.cost;
            return (
              <div
                key={item.id}
                className={`bg-[#0d1e35] border rounded-xl p-3 flex items-center gap-3 transition-all
                  ${canAfford ? 'border-[#1e3a5f] hover:border-[#ffd700]/30' : 'border-[#1e2a3a] opacity-50'}`}
              >
                <div className="flex-1">
                  <div className="text-sm font-bold text-white">{item.name}</div>
                  <div className="text-xs text-[#64748b] mt-0.5">{item.description}</div>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <div className="text-sm font-bold text-[#ffd700] font-mono">
                    🪙 {item.cost}
                  </div>
                  <button
                    onClick={() => handleBuy(item.id)}
                    disabled={!canAfford}
                    className="px-3 py-1 rounded-lg text-xs font-bold border transition-all
                      bg-[#1a2f4e] text-[#ffd700] border-[#ffd700]/30
                      hover:bg-[#ffd700] hover:text-[#1a0a00]
                      disabled:cursor-not-allowed disabled:opacity-30"
                  >
                    購買
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Inventory */}
      <div className="flex-1 bg-[#0a1628]/80 border border-[#1e3a5f] rounded-2xl p-3 flex flex-col gap-3">
        <div className="text-xs font-bold text-[#90caf9] tracking-widest">
          🎒 背包 ({unusedItems.length} 件)
        </div>

        {unusedItems.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-[#334155] text-sm text-center py-4">
            背包空空的
            <br />快去商城買獎勵吧！
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {unusedItems.map((invItem) => {
              const shop = getShopItem(invItem.itemId);
              if (!shop) return null;
              return (
                <div
                  key={invItem.id}
                  className="bg-[#0d1e35] border border-[#1e3a5f] rounded-xl p-3 flex flex-col gap-2
                    hover:border-[#90caf9]/30 transition-all group"
                >
                  <div className="text-xs font-bold text-white leading-tight line-clamp-2">
                    {shop.name}
                  </div>
                  <div className="text-xs text-[#ffd700]/50 font-mono">
                    🪙 {shop.cost}
                  </div>
                  <button
                    onClick={() => useInventoryItem(invItem.id)}
                    className="w-full py-1 rounded-lg text-xs font-bold border transition-all
                      bg-[#1a2f4e] text-[#4ade80] border-[#4ade80]/30
                      hover:bg-[#4ade80] hover:text-[#052e16]"
                  >
                    使用
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Used items summary */}
        {inventory.filter((i) => i.isUsed).length > 0 && (
          <div className="text-xs text-[#334155] text-center border-t border-[#1e3a5f] pt-2">
            已使用 {inventory.filter((i) => i.isUsed).length} 件道具
          </div>
        )}
      </div>
    </div>
  );
}
