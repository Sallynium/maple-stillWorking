import { useState } from 'react';
import { useGame } from '../context/GameContext';

const ITEM_ICONS: Record<string, string> = {
  '1': '🧋', '2': '🎮', '3': '📱',
};

export default function InventoryShop() {
  const { player, shopItems, inventory, buyShopItem, useInventoryItem } = useGame();
  const [msg, setMsg] = useState('');
  const [msgOk, setMsgOk] = useState(true);

  const handleBuy = (itemId: string) => {
    const err = buyShopItem(itemId);
    setMsg(err ?? '購買成功！');
    setMsgOk(!err);
    setTimeout(() => setMsg(''), 2500);
  };

  const unused = inventory.filter((i) => !i.isUsed);
  const getShop = (id: string) => shopItems.find((s) => s.id === id);

  return (
    <div className="flex flex-col gap-3">

      {/* ── Shop ── */}
      <div className="pixel-panel-gold p-3 flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <div className="font-pixel text-[8px] text-[#ffd700] tracking-widest"
            style={{ textShadow: '0 0 10px #ffd70088' }}>
            🏪 楓之谷商城
          </div>
          <div className="font-pixel text-[8px] text-[#c8900a]">
            🪙 {player.mesos.toLocaleString()}
          </div>
        </div>

        {msg && (
          <div className={`font-silk text-[10px] px-2 py-1.5 border ${
            msgOk
              ? 'text-[#4ade80] bg-[#4ade80]/8 border-[#4ade80]/30'
              : 'text-[#f87171] bg-[#f87171]/8 border-[#f87171]/30'
          }`} style={{ borderRadius: '1px' }}>
            {msgOk ? '✔ ' : '✖ '}{msg}
          </div>
        )}

        <div className="flex flex-col gap-2">
          {shopItems.map((item) => {
            const can = player.mesos >= item.cost;
            return (
              <div key={item.id}
                className={`pixel-panel p-2.5 flex items-center gap-2.5 transition-all ${!can ? 'opacity-40' : 'hover:border-[#ffd700]/30'}`}
              >
                <div className="text-2xl w-8 text-center shrink-0 leading-none">
                  {ITEM_ICONS[item.id] ?? '🎁'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-silk text-xs font-bold text-white leading-tight">{item.name}</div>
                  <div className="font-silk text-[9px] text-[#2a4a6a] mt-0.5 line-clamp-1">{item.description}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <div className="font-pixel text-[8px] text-[#ffd700]">🪙{item.cost}</div>
                  <button onClick={() => handleBuy(item.id)} disabled={!can}
                    className="pixel-btn pixel-btn-gold px-2.5 py-1 text-[9px]">
                    購買
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Inventory ── */}
      <div className="pixel-panel p-3 flex flex-col gap-2.5">
        <div className="font-pixel text-[8px] text-[#54a0ff] tracking-widest"
          style={{ textShadow: '0 0 8px #54a0ff66' }}>
          🎒 背包 ({unused.length})
        </div>

        {unused.length === 0 ? (
          <div className="py-5 text-center">
            <div className="font-pixel text-[7px] text-[#1e3a5a] leading-loose">
              背包空空的<br />快去商城買獎勵吧！
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            {unused.map((inv) => {
              const shop = getShop(inv.itemId);
              if (!shop) return null;
              return (
                <div key={inv.id}
                  className="pixel-panel p-2.5 flex flex-col gap-2 hover:border-[#54a0ff]/40 transition-all group"
                >
                  <div className="text-xl text-center leading-none">
                    {ITEM_ICONS[inv.itemId] ?? '🎁'}
                  </div>
                  <div className="font-silk text-[10px] font-bold text-white leading-tight text-center line-clamp-2">
                    {shop.name}
                  </div>
                  <button onClick={() => useInventoryItem(inv.id)}
                    className="pixel-btn pixel-btn-green w-full py-1.5 text-[9px]">
                    使用
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {inventory.filter((i) => i.isUsed).length > 0 && (
          <div className="font-silk text-[9px] text-[#1e3a5a] text-center border-t border-[#0e2040] pt-2">
            已使用 {inventory.filter((i) => i.isUsed).length} 件道具
          </div>
        )}
      </div>
    </div>
  );
}
