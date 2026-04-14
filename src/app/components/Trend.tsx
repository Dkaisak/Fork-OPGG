'use client';

interface TrendProps {
  trend: {
    last10: { winrate: number; kda: number; csPerMin: number };
    previous10: { winrate: number; kda: number; csPerMin: number };
    isImproving: 'up' | 'down' | 'stable';
  };
}

export default function Trend({ trend }: TrendProps) {
  if (!trend) return null;

  return (
    <div className="op-card p-4">
      <h3 className="text-base font-semibold mb-3" style={{ color: '#8b949e' }}>TENDENCIA DE RENDIMIENTO</h3>
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ background: '#1a2d42' }}>
          <p className="text-sm mb-2" style={{ color: '#8b949e' }}>ÚLTIMAS 10</p>
          <div className="flex items-end gap-3">
            <div>
              <p className={`text-2xl font-bold ${trend.last10.winrate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                {trend.last10.winrate}%
              </p>
              <p className="text-xs" style={{ color: '#6e7681' }}>Winrate</p>
            </div>
            <div>
              <p className="text-xl font-semibold" style={{ color: '#60a5fa' }}>{trend.last10.kda}</p>
              <p className="text-xs" style={{ color: '#6e7681' }}>KDA</p>
            </div>
            <div>
              <p className="text-xl font-semibold" style={{ color: '#fbbf24' }}>{trend.last10.csPerMin}</p>
              <p className="text-xs" style={{ color: '#6e7681' }}>CS/m</p>
            </div>
          </div>
        </div>
        <div className="p-3 rounded-lg" style={{ background: '#1a2d42' }}>
          <p className="text-sm mb-2" style={{ color: '#8b949e' }}>ANTERIORES 10</p>
          <div className="flex items-end gap-3">
            <div>
              <p className={`text-2xl font-bold ${trend.previous10.winrate >= 50 ? 'text-green-400' : 'text-red-400'}`}>
                {trend.previous10.winrate}%
              </p>
              <p className="text-xs" style={{ color: '#6e7681' }}>Winrate</p>
            </div>
            <div>
              <p className="text-xl font-semibold" style={{ color: '#60a5fa' }}>{trend.previous10.kda}</p>
              <p className="text-xs" style={{ color: '#6e7681' }}>KDA</p>
            </div>
            <div>
              <p className="text-xl font-semibold text-yellow-400">{trend.previous10.csPerMin}</p>
              <p className="text-slate-500 text-xs">CS/min</p>
            </div>
          </div>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2">
        <span className={`text-lg ${trend.isImproving === 'up' ? 'text-green-400' : trend.isImproving === 'down' ? 'text-red-400' : 'text-yellow-400'}`}>
          {trend.isImproving === 'up' ? '↗' : trend.isImproving === 'down' ? '↘' : '→'}
        </span>
        <span className="text-slate-400 text-sm">
          {trend.isImproving === 'up' ? ' Mejorando' : trend.isImproving === 'down' ? 'Empeorando' : ' Estable'}
        </span>
      </div>
    </div>
  );
}