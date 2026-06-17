// src/components/Marketplace.tsx
import React from 'react';
import MarketplaceCard from './MarketplaceCard';
import { Rumi } from '../types/rumi';

interface MarketplaceProps {
  items: Rumi[];
  setOpen: (item: Rumi) => void;
}

const Marketplace: React.FC<MarketplaceProps> = ({ items, setOpen }) => (
  <section className="marketplace">
    {items.map((it) => (
      <MarketplaceCard key={it.properties.stone_id} item={it} onClick={setOpen} />
    ))}
  </section>
);

export default Marketplace;
