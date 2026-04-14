'use client';

import { useState } from 'react';

interface SearchBarProps {
  gameName: string;
  tagLine: string;
  region: string;
  loading: boolean;
  error: string;
  onSearch: () => void;
  onGameNameChange: (value: string) => void;
  onTagLineChange: (value: string) => void;
  onRegionChange: (value: string) => void;
}

export default function SearchBar({
  gameName,
  tagLine,
  region,
  loading,
  error,
  onSearch,
  onGameNameChange,
  onTagLineChange,
  onRegionChange,
}: SearchBarProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !loading) {
      onSearch();
    }
  };

  return (
    <div className="op-card p-4">
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs mb-1" style={{ color: '#8b949e' }}>Nombre</label>
          <input
            type="text"
            value={gameName}
            onChange={(e) => onGameNameChange(e.target.value)}
            onKeyDown={handleKeyPress}
            className="op-input w-full"
            placeholder="Invocador"
          />
        </div>
        <div className="w-20">
          <label className="block text-xs mb-1" style={{ color: '#8b949e' }}>Tag</label>
          <input
            type="text"
            value={tagLine}
            onChange={(e) => onTagLineChange(e.target.value)}
            onKeyDown={handleKeyPress}
            className="op-input w-full"
            placeholder="NA1"
          />
        </div>
        <div className="w-24">
          <label className="block text-xs mb-1" style={{ color: '#8b949e' }}>Región</label>
          <select
            value={region}
            onChange={(e) => onRegionChange(e.target.value)}
            className="op-input w-full"
          >
            <option value="na1">NA</option>
            <option value="euw1">EUW</option>
            <option value="eune1">EUNE</option>
            <option value="la1">LAN</option>
            <option value="la2">LAS</option>
            <option value="br1">BR</option>
            <option value="kr">KR</option>
            <option value="jp1">JP</option>
            <option value="oc1">OCE</option>
            <option value="tr1">TR</option>
            <option value="ru">RU</option>
          </select>
        </div>
        <button
          onClick={onSearch}
          disabled={loading}
          className="op-btn"
        >
          {loading ? 'Buscando...' : 'Buscar'}
        </button>
      </div>
      
      {error && (
        <p className="mt-3 text-red-400 text-sm">{error}</p>
      )}
    </div>
  );
}