'use client';

interface PlayerCardProps {
  playerData: any;
  onRefresh: () => void;
  loading: boolean;
}

export default function PlayerCard({ playerData, onRefresh, loading }: PlayerCardProps) {
  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'Gold': return '#f59e0b';
      case 'Silver': return '#9ca3af';
      case 'Bronze': return '#cd7f32';
      case 'Platinum': return '#06b6d4';
      case 'Diamond': return '#a855f7';
      case 'Master': return '#ec4899';
      case 'Grandmaster': return '#f43f5e';
      case 'Challenger': return '#facc15';
      default: return '#f0f6fc';
    }
  };

  const getRegionLabel = (region: string) => {
    const regions: Record<string, string> = {
      la1: 'LAN',
      la2: 'LAS',
      na1: 'NA',
      euw1: 'EUW',
      eune1: 'EUNE',
      br1: 'BR',
      kr: 'KR',
      jp1: 'JP',
      oc1: 'OCE',
      tr1: 'TR',
      ru: 'RU',
    };
    return regions[region] || region?.toUpperCase();
  };

  if (!playerData) return null;

  return (
    <div className="op-card p-5">
      <div className="flex items-start gap-5">
        <div className="relative">
          <img
            src={`https://ddragon.leagueoflegends.com/cdn/16.7.1/img/profileicon/${playerData.profileIconId}.png`}
            alt="Profile"
            className="w-24 h-24 rounded-full"
            style={{ border: '3px solid #30363d' }}
          />
          {playerData.summonerLevel && (
            <span className="absolute -bottom-1 -right-1 bg-[#0e1e2d] text-yellow-400 text-xs font-bold px-1.5 py-0.5 rounded" style={{ border: '1px solid #30363d' }}>
              {playerData.summonerLevel}
            </span>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold" style={{ color: '#f0f6fc' }}>
            {playerData.summonerName} <span style={{ color: '#8b949e' }}>#{playerData.tagLine}</span>
          </h2>
          <div className="flex gap-4 text-sm mt-1" style={{ color: '#8b949e' }}>
            <span>{getRegionLabel(playerData.region)}</span>
            {playerData.rank && (
              <span style={{ color: getTierColor(playerData.rank.tier) }}>
                {playerData.rank.tier} {playerData.rank.rank}
              </span>
            )}
            {playerData.rank?.wr && (
              <span className={playerData.rank.wr >= 50 ? 'stat-winrate-good' : 'stat-winrate-bad'}>
                {playerData.rank.wr}% WR
              </span>
            )}
          </div>
        </div>
      </div>

      {playerData.rank && (
        <div className="mt-6 p-4 rounded-lg" style={{ background: '#1a2d42' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <img
                src={`/ranked-emblems/Rank=${playerData.rank.tier}.png`}
                alt={playerData.rank.tier}
                className="w-14 h-14"
              />
              <div>
                <p className="text-lg font-semibold" style={{ color: getTierColor(playerData.rank.tier) }}>
                  {playerData.rank.tier} {playerData.rank.rank}
                </p>
                <p className="text-sm" style={{ color: '#8b949e' }}>{playerData.rank.lp} LP</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm" style={{ color: '#8b949e' }}>{playerData.rank.wins}W {playerData.rank.losses}L</p>
                <p className={`text-sm font-semibold ${playerData.rank.wr >= 50 ? 'stat-winrate-good' : 'stat-winrate-bad'}`}>
                  {playerData.rank.wr}% winrate
                </p>
              </div>
              <div className="relative w-14 h-14">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9155" fill="none" stroke="#30363d" strokeWidth="3" />
                  <circle 
                    cx="18" cy="18" r="15.9155" fill="none" 
                    stroke={playerData.rank.wr >= 50 ? '#4ade80' : '#f87171'} 
                    strokeWidth="3"
                    strokeDasharray={`${playerData.rank.wr} ${playerData.rank.wr}`}
                    strokeDashoffset="0"
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color: playerData.rank.wr >= 50 ? '#4ade80' : '#f87171' }}>
                  {playerData.rank.wr}%
                </span>
              </div>
              <div className="mt-2 text-center flex flex-col gap-2">
                {(playerData.winStreak > 0 || playerData.lossStreak > 0) && (
                  <span className={`text-xs font-bold px-2 py-1 rounded ${playerData.winStreak > 0 ? 'bg-green-900 text-green-400' : 'bg-red-900 text-red-400'}`}>
                    {playerData.winStreak > 0 ? `${playerData.winStreak}W` : `${playerData.lossStreak}L`} streak
                  </span>
                )}
                <button 
                  onClick={onRefresh} 
                  disabled={loading}
                  className="text-xs font-medium px-3 py-1.5 rounded transition-colors"
                  style={{ background: '#22c55e', color: '#fff' }}
                >
                  {loading ? 'Actualizando...' : 'Actualizar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}