// src/components/MarketplaceCard.tsx
import React from 'react';
import { Rumi } from '../types/rumi';

interface MarketplaceCardProps {
  item: Rumi;
  onClick: (item: Rumi) => void;
}

const MarketplaceCard: React.FC<MarketplaceCardProps> = ({ item, onClick }) => {
  const cut = item.attributes.find((a) => a.trait_type === "Stone Cut")?.value;
  const type = item.attributes.find((a) => a.trait_type === "Stone Type")?.value;
  const mountedBy = item.attributes.find((a) => a.trait_type === "Mounted By")?.value;

  return (
    <div className="card" onClick={() => onClick(item)}>
      <div className="thumb">🪨</div>
      <div className="meta">
        <strong>{type}</strong>
        <div className="badge">{cut}</div>
        {mountedBy && <p className="mounted-by">Mounted by: {mountedBy}</p>}
      </div>
    </div>
  );
};

export default MarketplaceCard;
