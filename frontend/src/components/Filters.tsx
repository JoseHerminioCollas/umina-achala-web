// src/components/Filters.tsx
import React from "react";

interface FiltersProps {
  filters: {
    type: string;
    types: string[];
    region: string;
    regions: string[];
    cut: string;
    cuts: string[];
    mounted: string;
    q: string;
  };
  setFilters: (filters: any) => void;
}

const Filters: React.FC<FiltersProps> = ({ filters, setFilters }) => (
  <section className="filters">
    <label>
      Type:{" "}
      <select
        value={filters.type}
        onChange={(e) => setFilters({ ...filters, type: e.target.value })}
      >
        <option value="">All</option>
        {filters.types.map((t) => (
          <option key={t} value={t}>
            {t}
          </option>
        ))}
      </select>
    </label>
    <label>
      Cut:{" "}
      <select
        value={filters.cut}
        onChange={(e) => setFilters({ ...filters, cut: e.target.value })}
      >
        <option value="">All</option>
        {filters.cuts.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </label>
    <label>
      Mounted:{" "}
      <select
        value={filters.mounted}
        onChange={(e) => setFilters({ ...filters, mounted: e.target.value })}
      >
        <option value="">All</option>
        <option value="true">Mounted</option>
        <option value="false">Unmounted</option>
      </select>
    </label>
  </section>
);

export default Filters;
