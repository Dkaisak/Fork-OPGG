'use client';

interface TopBuildsProps {
  topBuilds: any[];
}

export default function TopBuilds({ topBuilds }: TopBuildsProps) {
  if (!topBuilds || topBuilds.length === 0) return null;

  return (
    <div className="op-card p-4">
      <h3 className="text-base font-semibold mb-3" style={{ color: '#8b949e' }}>BUILDS MÁS USADOS</h3>
      <div className="space-y-3">
        {topBuilds.map((b, idx) => (
          <div key={idx} className="p-3 rounded-lg" style={{ background: '#1a2d42' }}>
            <div className="flex items-center gap-3 mb-2">
              <img src={b.championImage} alt={b.championName} className="w-12 h-12 rounded" />
              <div>
                <p className="font-semibold" style={{ color: '#f0f6fc' }}>{b.championName}</p>
                <p className="text-sm" style={{ color: '#8b949e' }}>{b.games} partidas</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {b.builds?.slice(0, 2).map((build: any, bi: number) => (
                <div key={bi} className="flex items-center gap-2 p-2 rounded-lg" style={{ background: '#0e1e2d' }}>
                  <div className="flex gap-1">
                    {build.items?.slice(0, 6).map((itemId: number, iidx: number) => (
                      itemId > 0 ? <img key={iidx} src={`https://ddragon.leagueoflegends.com/cdn/16.7.1/img/item/${itemId}.png`} alt="" className="w-8 h-8 rounded" /> : null
                    ))}
                  </div>
                  <div className="text-right">
                    <p className={build.winrate >= 50 ? 'text-green-400' : 'text-red-400'}>{build.winrate}% WR</p>
                    <p className="text-xs" style={{ color: '#6e7681' }}>{build.games} games</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}