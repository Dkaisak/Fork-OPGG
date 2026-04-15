'use client';

import Image from 'next/image';

interface MatchHistoryProps {
  matches: any[];
  expandedMatch: string | null;
  matchDetails: any;
  matchDetailsLoading: boolean;
  onToggleMatch: (matchId: string) => void;
  region: string;
}

export default function MatchHistory({
  matches,
  expandedMatch,
  matchDetails,
  matchDetailsLoading,
  onToggleMatch,
  region,
}: MatchHistoryProps) {
  if (!matches || matches.length === 0) return null;

  return (
    <div className="mt-5">
      <h3 className="text-base font-semibold mb-3" style={{ color: '#8b949e' }}>PARTIDAS RECIENTES</h3>
      <div className="space-y-2">
        {matches.map((match, idx) => (
          <div 
            key={idx} 
            className="p-2 rounded" 
            style={{ 
              background: match.win ? 'rgba(74, 222, 128, 0.08)' : 'rgba(248, 113, 113, 0.08)', 
              borderLeft: `3px solid ${match.win ? '#4ade80' : '#f87171'}` 
            }}
          >
            <button onClick={() => onToggleMatch(match.matchId)} className="w-full text-left">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Image src={match.championImage} alt={match.championName} width={40} height={40} className="w-10 h-10 rounded" unoptimized />
                  <div>
                    <p className="font-medium text-sm">{match.championName}</p>
                    <p className={`text-xs font-bold ${match.win ? 'text-green-400' : 'text-red-400'}`}>
                      {match.win ? 'VICTORIA' : 'DERROTA'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-medium text-sm">{match.kills}/{match.deaths}/{match.assists}</p>
                    <p className="text-xs" style={{ color: '#6e7681' }}>{match.cs} ({Number(match.csPerMin || 0).toFixed(2)}/m)</p>
                  </div>
                  <span style={{ color: '#6e7681' }}>{expandedMatch === match.matchId ? '▲' : '▼'}</span>
                </div>
              </div>
            </button>

            {expandedMatch === match.matchId && (
              <div className="p-2 rounded mt-1" style={{ background: '#1a2d42', border: '1px solid #30363d' }}>
                {matchDetailsLoading && <p style={{ color: '#8b949e' }}>...</p>}
                
                {matchDetails && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-base font-bold ${matchDetails.myPlayer?.win ? 'text-green-400' : 'text-red-400'}`}>
                        {matchDetails.result}
                      </span>
                      <span className="text-xs" style={{ color: '#8b949e' }}>
                        {Math.floor(matchDetails.gameDuration / 60)}:{String(matchDetails.gameDuration % 60).padStart(2, '0')}
                      </span>
                    </div>
                    
                    <div className="mb-2">
                      <div className="flex gap-1 mb-2">
                        {matchDetails.myPlayer?.spells?.map((spell: any, idx: number) => (
                          <img key={idx} src={spell.image} alt={spell.name} className="w-6 h-6 rounded" />
                        ))}
                        <div className="flex gap-0.5 ml-2">
                          {matchDetails.myPlayer?.items.slice(0, 6).map((itemId: number, idx: number) => (
                            itemId > 0 ? (
                              <img key={idx} src={`https://ddragon.leagueoflegends.com/cdn/16.7.1/img/item/${itemId}.png`} alt="" className="w-6 h-6 rounded" />
                            ) : (
                              <div key={idx} className="w-6 h-6 rounded" style={{ background: '#0e1e2d', border: '1px solid #30363d' }} />
                            )
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-green-400 font-medium">{matchDetails.myPlayer?.kills}</span>/
                        <span className="text-red-400 font-medium">{matchDetails.myPlayer?.deaths}</span>/
                        <span className="text-blue-400 font-medium">{matchDetails.myPlayer?.assists}</span>
                        <span style={{ color: '#fbbf24' }}>{matchDetails.myPlayer?.cs} cs</span>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div className="rounded p-2" style={{ background: 'rgba(59, 130, 246, 0.1)', border: '1px solid #3b82f6' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: matchDetails.myPlayer?.teamId === 100 ? '#4ade80' : '#60a5fa' }}>
                          {matchDetails.blueTeam?.[0]?.win ? '🏆 ' : ''}EQUIPO AZUL
                        </p>
                        <div>
                          <div className="text-xs flex justify-between px-1 py-0.5" style={{ color: '#6e7681', borderBottom: '1px solid #30363d' }}>
                            <span className="w-24">Jugador</span>
                            <span className="w-14 text-center">K/D/A</span>
                            <span className="w-10 text-center">KDA</span>
                            <span className="w-10 text-center">CS/M</span>
                            <span className="w-10 text-center">Wards</span>
                            <span className="w-10 text-center">DMG</span>
                          </div>
                          {matchDetails.blueTeam?.map((p: any, i: number) => {
                            const pKda = p.deaths > 0 ? ((p.kills + p.assists) / p.deaths).toFixed(1) : (p.kills + p.assists);
                            return (
                              <div key={i} className="text-xs p-1 flex items-center justify-between" style={{ background: p.win ? 'rgba(74, 222, 128, 0.1)' : '#0e1e2d', borderBottom: '1px solid #1a2d42' }}>
                                <div className="flex items-center gap-1 w-24">
                                  <img src={p.championImage} alt="" className="w-5 h-5 rounded" />
                                  <div className="flex flex-col gap-0.5">
                                    {p.spells?.slice(0, 2).map((spell: any, sIdx: number) => (
                                      <img key={sIdx} src={spell.image} alt={spell.name} className="w-3.5 h-3.5 rounded" />
                                    ))}
                                  </div>
                                  <button 
                                    onClick={() => { const name = encodeURIComponent(p.summonerName); const tag = encodeURIComponent(p.summonerTag || 'NA1'); window.open(`${window.location.origin}/?gameName=${name}&tagLine=${tag}&region=${region}`, '_blank'); }} 
                                    className="text-yellow-400 hover:text-yellow-300 truncate text-xs"
                                  >
                                    {p.summonerName}
                                  </button>
                                </div>
                                <span className={p.win ? 'text-green-400' : 'text-red-400'} style={{ width: 56, textAlign: 'center' }}>{p.kills}/{p.deaths}/{p.assists}</span>
                                <span className="text-blue-400 w-10 text-center">{pKda}</span>
                                <span className="text-gray-400 w-10 text-center">{(p.cs / ((matchDetails?.gameDuration || 1800) / 60)).toFixed(2)}</span>
                                <span className="text-cyan-400 w-10 text-center">{p.visionScore || 0}</span>
                                <div className="w-10 flex flex-col justify-center gap-0.5">
                                  <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, ((p.damageDealtToChampions || 0) / 30000) * 100) }%` }} />
                                  </div>
                                  <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                                    <div className="h-full bg-gray-500 rounded-full" style={{ width: `${Math.min(100, ((p.damageTaken || 0) / 30000) * 100) }%` }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      <div className="rounded p-2" style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid #ef4444' }}>
                        <p className="text-xs font-bold mb-1" style={{ color: matchDetails.myPlayer?.teamId === 200 ? '#4ade80' : '#f87171' }}>
                          {matchDetails.redTeam?.[0]?.win ? '🏆 ' : ''}EQUIPO ROJO
                        </p>
                        <div>
                          <div className="text-xs flex justify-between px-1 py-0.5" style={{ color: '#6e7681', borderBottom: '1px solid #30363d' }}>
                            <span className="w-24">Jugador</span>
                            <span className="w-14 text-center">K/D/A</span>
                            <span className="w-10 text-center">KDA</span>
                            <span className="w-10 text-center">CS/M</span>
                            <span className="w-10 text-center">Wards</span>
                            <span className="w-10 text-center">DMG</span>
                          </div>
                          {matchDetails.redTeam?.map((p: any, i: number) => {
                            const pKda = p.deaths > 0 ? ((p.kills + p.assists) / p.deaths).toFixed(1) : (p.kills + p.assists);
                            return (
                              <div key={i} className="text-xs p-1 flex items-center justify-between" style={{ background: p.win ? 'rgba(74, 222, 128, 0.1)' : '#0e1e2d', borderBottom: '1px solid #1a2d42' }}>
                                <div className="flex items-center gap-1 w-24">
                                  <img src={p.championImage} alt="" className="w-5 h-5 rounded" />
                                  <div className="flex flex-col gap-0.5">
                                    {p.spells?.slice(0, 2).map((spell: any, sIdx: number) => (
                                      <img key={sIdx} src={spell.image} alt={spell.name} className="w-3.5 h-3.5 rounded" />
                                    ))}
                                  </div>
                                  <button 
                                    onClick={() => { const name = encodeURIComponent(p.summonerName); const tag = encodeURIComponent(p.summonerTag || 'NA1'); window.open(`${window.location.origin}/?gameName=${name}&tagLine=${tag}&region=${region}`, '_blank'); }} 
                                    className="text-yellow-400 hover:text-yellow-300 truncate text-xs"
                                  >
                                    {p.summonerName}
                                  </button>
                                </div>
                                <span className={p.win ? 'text-green-400' : 'text-red-400'} style={{ width: 56, textAlign: 'center' }}>{p.kills}/{p.deaths}/{p.assists}</span>
                                <span className="text-blue-400 w-10 text-center">{pKda}</span>
                                <span className="text-gray-400 w-10 text-center">{(p.cs / ((matchDetails?.gameDuration || 1800) / 60)).toFixed(2)}</span>
                                <span className="text-cyan-400 w-10 text-center">{p.visionScore || 0}</span>
                                <div className="w-10 flex flex-col justify-center gap-0.5">
                                  <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                                    <div className="h-full bg-red-500 rounded-full" style={{ width: `${Math.min(100, ((p.damageDealtToChampions || 0) / 30000) * 100) }%` }} />
                                  </div>
                                  <div className="h-1.5 rounded-full bg-gray-700 overflow-hidden">
                                    <div className="h-full bg-gray-500 rounded-full" style={{ width: `${Math.min(100, ((p.damageTaken || 0) / 30000) * 100) }%` }} />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}