'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import PlayerCard from './components/PlayerCard';
// import RoleStats from './components/RoleStats';
import Masteries from './components/Masteries';
import MatchHistory from './components/MatchHistory';
import ChampionStats from './components/ChampionStats';
// import Trend from './components/Trend';
import TopBuilds from './components/TopBuilds';
// import MatchupOptimizer from './components/MatchupOptimizer';

export default function Home() {
  const searchParams = useSearchParams();
  
  const [gameName, setGameName] = useState(searchParams.get('gameName') || '');
  const [tagLine, setTagLine] = useState(searchParams.get('tagLine') || '');
  const [region, setRegion] = useState(searchParams.get('region') || 'la1');
  const [playerData, setPlayerData] = useState<any>(null);
  const [playerError, setPlayerError] = useState('');
  const [playerCache, setPlayerCache] = useState<Record<string, any>>({});

  const [matchupData, setMatchupData] = useState<any>(null);
  const [matchupError, setMatchupError] = useState('');
  const [matchupCache, setMatchupCache] = useState<Record<string, any>>({});

  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [matchDetails, setMatchDetails] = useState<any>(null);
  const [matchDetailsLoading, setMatchDetailsLoading] = useState(false);
  const [matchCache, setMatchCache] = useState<Record<string, any>>({});

  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);

  useEffect(() => {
    const name = searchParams.get('gameName');
    const tag = searchParams.get('tagLine');
    const reg = searchParams.get('region');
    if (name && tag) {
      setGameName(name);
      setTagLine(tag);
      if (reg) setRegion(reg);
      setTimeout(() => searchPlayer(), 100);
    } else {
      setInitialLoad(false);
    }
  }, []);

  const toggleMatchDetails = async (matchId: string) => {
    if (expandedMatch === matchId) {
      setExpandedMatch(null);
      setMatchDetails(null);
      return;
    }
    
    if (matchCache[matchId]) {
      setExpandedMatch(matchId);
      setMatchDetails(matchCache[matchId]);
      return;
    }
    
    setExpandedMatch(matchId);
    setMatchDetailsLoading(true);
    setMatchDetails(null);
    
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/match?matchId=${matchId}&region=${region}&puuid=${playerData.puuid || ''}&t=${timestamp}`);
      const data = await res.json();
      
      if (res.ok) {
        setMatchCache(prev => ({ ...prev, [matchId]: data }));
        setMatchDetails(data);
      }
    } catch (err) {
      console.error('Error fetching match:', err);
    } finally {
      setMatchDetailsLoading(false);
    }
  };

  const searchPlayer = async () => {
    const cacheKey = `${gameName}-${tagLine}-${region}`;
    
    if (playerCache[cacheKey]) {
      setPlayerData(playerCache[cacheKey]);
      const url = `/?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`;
      window.history.pushState({}, '', url);
      return;
    }
    
    setLoading(true);
    setPlayerError('');
    setPlayerData(null);
    
    const timestamp = Date.now();
    
    try {
      const res = await fetch(`/api/player?gameName=${gameName}&tagLine=${tagLine}&region=${region}&t=${timestamp}`);
      const data = await res.json();
      
      if (res.status === 429) {
        setPlayerError('Rate limit exceeded. Wait a moment and try again.');
        setLoading(false);
        return;
      }
      
      if (!res.ok) {
        setPlayerError(data.error || 'Error searching for player');
      } else {
        setPlayerCache(prev => ({ ...prev, [cacheKey]: data }));
        setPlayerData(data);
        const url = `/?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`;
        window.history.pushState({}, '', url);
      }
    } catch (err) {
      setPlayerError('Connection error');
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  };

  const refreshMatches = async () => {
    if (!gameName || !tagLine) return;
    
    setLoading(true);
    
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/player?gameName=${gameName}&tagLine=${tagLine}&region=${region}&refresh=true&t=${timestamp}`);
      const data = await res.json();
      
      if (res.ok) {
        const cacheKey = `${gameName}-${tagLine}-${region}`;
        setPlayerCache(prev => ({ ...prev, [cacheKey]: data }));
        setPlayerData(data);
      }
    } catch (err) {
      console.error('Error refreshing:', err);
    } finally {
      setLoading(false);
    }
  };

  const searchMatchup = async (ally: string, enemy: string) => {
    if (!ally || !enemy) return;
    
    const cacheKey = `${ally}-${enemy}`;
    
    if (matchupCache[cacheKey]) {
      setMatchupData(matchupCache[cacheKey]);
      return;
    }
    
    setMatchupError('');
    setMatchupData(null);
    
    try {
      const timestamp = Date.now();
      const res = await fetch(`/api/matchup?ally=${ally}&enemy=${enemy}&t=${timestamp}`);
      const data = await res.json();
      
      if (!res.ok) {
        setMatchupError(data.error || 'Error getting matchup');
      } else {
        setMatchupCache(prev => ({ ...prev, [cacheKey]: data }));
        setMatchupData(data);
      }
    } catch (err) {
      setMatchupError('Connection error');
    }
  };

  return (
    <div className="min-h-screen p-4" style={{ background: 'linear-gradient(180deg, #0e1e2d 0%, #0a1520 100%)' }}>
      <div className="max-w-6xl mx-auto">
        <Sidebar playerData={playerData} />
        <main className="flex-1 min-w-0 space-y-4 main-content">
          <SearchBar
            gameName={gameName}
            tagLine={tagLine}
            region={region}
            loading={loading}
            error={playerError}
            onSearch={searchPlayer}
            onGameNameChange={setGameName}
            onTagLineChange={setTagLine}
            onRegionChange={setRegion}
          />
          
          {initialLoad && (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-2" style={{ borderColor: '#4fa3e3', borderTopColor: 'transparent' }}></div>
            </div>
          )}

          {playerData && !loading && !initialLoad && (
            <>
              <PlayerCard
                playerData={playerData}
                onRefresh={refreshMatches}
                loading={loading}
              />

              {playerData.masteries && playerData.masteries.length > 0 && (
                <Masteries masteries={playerData.masteries} />
              )}

              <MatchHistory
                matches={playerData.matches}
                expandedMatch={expandedMatch}
                matchDetails={matchDetails}
                matchDetailsLoading={matchDetailsLoading}
                onToggleMatch={toggleMatchDetails}
                region={region}
              />
            </>
          )}

          {playerData?.topBuilds?.length > 0 && (
            <TopBuilds topBuilds={playerData.topBuilds} />
          )}
        </main>
      </div>
    </div>
  );
}