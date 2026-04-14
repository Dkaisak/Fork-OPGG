'use client';

import { useState } from 'react';

interface MatchupOptimizerProps {
  matchupData: any;
  matchupError: string;
  onSearch: (ally: string, enemy: string) => void;
}

export default function MatchupOptimizer({ matchupData, matchupError, onSearch }: MatchupOptimizerProps) {
  const [ally, setAlly] = useState('');
  const [enemy, setEnemy] = useState('');

  const handleSearch = () => {
    if (ally && enemy) {
      onSearch(ally, enemy);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="op-card p-4">
      <h2 className="text-lg font-semibold mb-3" style={{ color: '#8b949e' }}>OPTIMIZADOR DE MATCHUP</h2>
      <div className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs mb-1" style={{ color: '#8b949e' }}>Campeón Aliado</label>
          <input 
            type="text" 
            value={ally} 
            onChange={(e) => setAlly(e.target.value)} 
            onKeyDown={handleKeyPress}
            className="op-input w-full" 
            placeholder="Yasuo" 
          />
        </div>
        <div className="flex-1 min-w-[150px]">
          <label className="block text-xs mb-1" style={{ color: '#8b949e' }}>Campeón Enemigo</label>
          <input 
            type="text" 
            value={enemy} 
            onChange={(e) => setEnemy(e.target.value)} 
            onKeyDown={handleKeyPress}
            className="op-input w-full" 
            placeholder="Zed" 
          />
        </div>
        <button onClick={handleSearch} className="op-btn" style={{ background: 'linear-gradient(135deg, #4ade80 0%, #22c55e 100%)' }}>
          Analizar
        </button>
      </div>
      
      {matchupError && (
        <p className="mt-3 text-red-400 text-sm">{matchupError}</p>
      )}
      
      {matchupData && (
        <div className="mt-4">
          <p className="text-sm mb-2" style={{ color: '#8b949e' }}>Partidas analizadas: {matchupData.matchesAnalyzed || 0}</p>
          <div className="space-y-2">
            {matchupData.builds?.slice(0, 3).map((build: any, idx: number) => (
              <div key={idx} className="flex items-center justify-between p-2 rounded" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <div className="flex gap-1">
                  {build.items?.slice(0, 4).map((itemId: number, i: number) => (
                    itemId > 0 && <img key={i} src={`https://ddragon.leagueoflegends.com/cdn/16.7.1/img/item/${itemId}.png`} alt="" className="w-6 h-6 rounded" />
                  ))}
                </div>
                <span className="text-sm font-medium" style={{ color: build.winrate > 50 ? '#4ade80' : '#f87171' }}>
                  {build.wins}/{build.games} ({build.winrate}%)
                </span>
              </div>
            ))}
          </div>
          {matchupData.note && <p className="text-xs mt-2" style={{ color: '#6e7681' }}>{matchupData.note}</p>}
        </div>
      )}
    </div>
  );
}