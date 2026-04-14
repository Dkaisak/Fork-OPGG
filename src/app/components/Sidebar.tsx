'use client';

interface SidebarProps {
  playerData: any;
}

export default function Sidebar({ playerData }: SidebarProps) {
  const championStats = playerData?.championStats || [];
  const trend = playerData?.trend;
  const roleStatsRaw = playerData?.roleStats || [];
  
  const roleLabels: Record<string, string> = {
    TOP: 'TOP',
    JUNGLE: 'JG',
    MIDDLE: 'MID',
    BOTTOM: 'ADC',
    UTILITY: 'SUP',
  };

  const defaultRoles = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
  const roleStats = defaultRoles.map(role => {
    const existing = roleStatsRaw.find((r: any) => r.role === role);
    return {
      role: roleLabels[role] || role,
      games: existing?.games || 0,
      wins: existing?.wins || 0,
      losses: existing?.losses || 0,
      winrate: existing?.winrate || 0
    };
  });

  return (
    <div className="w-72 flex-shrink-0 fixed left-0 top-0 h-screen overflow-y-auto p-4" style={{ background: 'linear-gradient(180deg, #0e1e2d 0%, #0a1520 100%)' }}>
      {/* Campeones */}
      <div className="op-card p-3 mb-4">
        <p className="text-xs font-semibold mb-1" style={{ color: '#8b949e' }}>CAMPEONES</p>
        <p className="text-xs mb-2" style={{ color: '#6e7681' }}>(últimas 100 partidas)</p>
        <div className="space-y-1">
          {championStats.slice(0, 10).map((c: any, idx: number) => (
            <div key={idx} className="flex items-center gap-2 p-1.5 rounded" style={{ background: '#1a2d42' }}>
              <span className="text-xs w-4" style={{ color: '#6e7681' }}>{idx + 1}</span>
              <img 
                src={c.championImage} 
                alt={c.championName} 
                className="w-6 h-6 rounded" 
              />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate" style={{ color: '#f0f6fc' }}>
                  {c.championName}
                </p>
              </div>
              <div className="flex flex-col items-end">
                <span className={c.winrate >= 50 ? 'text-green-400' : 'text-red-400'} style={{ fontSize: 9 }}>
                  {c.winrate}%
                </span>
                <span style={{ color: '#6e7681', fontSize: 9 }}>
                  {c.games}J
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Roles */}
      <div className="op-card p-3 mb-4">
        <p className="text-xs font-semibold mb-1" style={{ color: '#8b949e' }}>ROLES</p>
        <p className="text-xs mb-2" style={{ color: '#6e7681' }}>(últimas 50 partidas)</p>
        <div className="space-y-1">
          {roleStats.map((r: any, idx: number) => (
            <div key={idx} className="flex items-center justify-between p-1.5 rounded" style={{ background: r.games > 0 ? '#1a2d42' : 'rgba(255,255,255,0.03)' }}>
              <span className="text-xs font-medium" style={{ color: '#f0f6fc' }}>{r.role}</span>
              <div className="flex items-center gap-2">
                <span style={{ color: '#6e7681', fontSize: 9 }}>{r.games > 0 ? `${r.games}J` : '-'}</span>
                <span className={r.games > 0 ? (r.winrate >= 50 ? 'text-green-400' : 'text-red-400') : 'text-gray-600'} style={{ fontSize: 9 }}>{r.games > 0 ? `${r.winrate}%` : '-'}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tendencia */}
      {trend && (
        <div className="op-card p-3">
          <p className="text-xs font-semibold mb-1" style={{ color: '#8b949e' }}>TENDENCIA</p>
          <p className="text-xs mb-2" style={{ color: '#6e7681' }}>(últimas 20 partidas)</p>
          <div className="space-y-2">
            <div className="p-2 rounded" style={{ background: '#1a2d42' }}>
              <p className="text-xs mb-1" style={{ color: '#8b949e' }}>ÚLTIMAS 10</p>
              <div className="flex items-center justify-between">
                <span className={trend.last10.winrate >= 50 ? 'text-green-400' : 'text-red-400'} style={{ fontSize: 14 }}>{trend.last10.winrate}% WR</span>
                <span style={{ color: '#60a5fa', fontSize: 11 }}>{trend.last10.kda} KDA</span>
                <span style={{ color: '#fbbf24', fontSize: 11 }}>{trend.last10.csPerMin} CS/m</span>
              </div>
            </div>
            <div className="p-2 rounded" style={{ background: '#1a2d42' }}>
              <p className="text-xs mb-1" style={{ color: '#8b949e' }}>ANTERIORES 10</p>
              <div className="flex items-center justify-between">
                <span className={trend.previous10.winrate >= 50 ? 'text-green-400' : 'text-red-400'} style={{ fontSize: 14 }}>{trend.previous10.winrate}% WR</span>
                <span style={{ color: '#60a5fa', fontSize: 11 }}>{trend.previous10.kda} KDA</span>
                <span style={{ color: '#fbbf24', fontSize: 11 }}>{trend.previous10.csPerMin} CS/m</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 p-2 rounded" style={{ background: '#1a2d42' }}>
              <span className={trend.isImproving === 'up' ? 'text-green-400' : trend.isImproving === 'down' ? 'text-red-400' : 'text-yellow-400'} style={{ fontSize: 16 }}>
                {trend.isImproving === 'up' ? '↗' : trend.isImproving === 'down' ? '↘' : '→'}
              </span>
              <span className="text-xs font-medium" style={{ color: '#f0f6fc' }}>
                {trend.isImproving === 'up' ? 'Mejorando' : trend.isImproving === 'down' ? 'Empeorando' : 'Estable'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}