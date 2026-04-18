import React from 'react';
import { FiSearch } from 'react-icons/fi';

interface FilterBarProps {
  search: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  sortBy?: string;
  onSortChange?: (val: string) => void;
  sortOptions?: { label: string; value: string }[];
  filters?: React.ReactNode;
}

export default function FilterBar({
  search,
  onSearchChange,
  searchPlaceholder = "Search...",
  sortBy,
  onSortChange,
  sortOptions,
  filters
}: FilterBarProps) {
  return (
    <div className="glass-card p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
      <div className="relative w-full md:max-w-md">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="input-field pl-10 w-full"
        />
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto">
        {sortOptions && onSortChange && (
          <div className="flex items-center gap-2 flex-1 md:flex-initial">
            <span className="text-sm text-surface-400 whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="input-field text-sm py-1.5"
            >
              {sortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
        
        {filters && (
          <div className="flex items-center gap-2">
             {filters}
          </div>
        )}
      </div>
    </div>
  );
}
