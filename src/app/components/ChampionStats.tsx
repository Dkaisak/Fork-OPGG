'use client';

interface ChampionStatsProps {
  championStats: any[];
  totalMatchesAnalyzed?: number;
}

export default function ChampionStats({ championStats, totalMatchesAnalyzed }: ChampionStatsProps) {
  if (!championStats || championStats.length === 0) return null;

  return (
    <div className="op-card p-4">
      <h3 className="text-base font-semibold mb-3" style={{ color: '#8b949e' }}>
        ESTADÍSTICAS POR CAMPEÓN ({totalMatchesAnalyzed || 20} recientes)
      </h3>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid #30363d' }}>
              <th className="text-left py-2 px-2" style={{ color: '#8b949e' }}>Campeón</th>
              <th className="py-2 px-2" style={{ color: '#8b949e' }}>J</th>
              <th className="py-2 px-2" style={{ color: '#8b949e' }}>WR</th>
              <th className="py-2 px-2" style={{ color: '#8b949e' }}>KDA</th>
              <th className="py-2 px-2" style={{ color: '#8b949e' }}>CS/m</th>
              <th className="py-2 px-2" style={{ color: '#8b949e' }}>K/D/A</th>
            </tr>
          </thead>
          <tbody>
            {championStats.slice(0, 8).map((c, idx) => (
              <tr key={idx} className="hover:bg-slate-700/30" style={{ borderBottom: '1px solid #30363d' }}>
                <td className="py-2 px-2">
                  <div className="flex items-center gap-2">
                    <img src={c.championImage} alt={c.championName} className="w-8 h-8 rounded" />
                    <span className="font-medium" style={{ color: '#f0f6fc' }}>{c.championName}</span>
                  </div>
                </td>
                <td className="py-2 px-2 text-center" style={{ color: '#f0f6fc' }}>{c.games}</td>
                <td className="py-2 px-2 text-center">
                  <span className={c.winrate >= 50 ? 'text-green-400' : 'text-red-400'}>{c.winrate}%</span>
                </td>
                <td className="py-2 px-2 text-center" style={{ color: '#60a5fa' }}>{c.kda}</td>
                <td className="py-2 px-2 text-center" style={{ color: '#fbbf24' }}>{c.csPerMin}</td>
                <td className="py-2 px-2 text-center" style={{ color: '#f0f6fc' }}>{c.avgKills}/{c.avgDeaths}/{c.avgAssists}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}