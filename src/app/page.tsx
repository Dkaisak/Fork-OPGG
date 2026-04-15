'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Sidebar from './components/Sidebar';
import SearchBar from './components/SearchBar';
import PlayerCard from './components/PlayerCard';
import Masteries from './components/Masteries';
import MatchHistory from './components/MatchHistory';
import TopBuilds from './components/TopBuilds';

interface PlayerData {
  puuid?: string;
  summonerName?: string;
  summonerLevel?: number;
  profileIconId?: number;
  tagLine?: string;
  region?: string;
  rank?: { tier: string; rank: string; lp: number; wins: number; losses: number; wr: number };
  masteries?: Array<{ championId: number; championName: string; championImage: string; level: number; points: number }>;
  matches?: Array<{ matchId: string; championId: number; championName: string; championImage: string; win: boolean; kills: number; deaths: number; assists: number; cs: number; csPerMin: string }>;
  topBuilds?: Array<{ championId: number; championName: string; championImage: string; games: number; builds: Array<{ items: number[]; wins: number; games: number; winrate: number }> }>;
}

interface MatchData {
  matchId: string;
  gameDuration: number;
  queueId: number;
  myPlayer?: { win: boolean; kills: number; deaths: number; assists: number; cs: number; spells: Array<{ name: string; image: string }>; teamId: number; items: number[] };
  blueTeam?: Array<{ summonerName: string; championImage: string; spells: Array<{ name: string; image: string }>; summonerTag?: string; kills: number; deaths: number; assists: number; cs: number; visionScore: number; damageDealtToChampions: number; damageTaken: number; win: boolean }>;
  redTeam?: Array<{ summonerName: string; championImage: string; spells: Array<{ name: string; image: string }>; summonerTag?: string; kills: number; deaths: number; assists: number; cs: number; visionScore: number; damageDealtToChampions: number; damageTaken: number; win: boolean }>;
  result?: string;
}

export default function Home() {
  const searchParams = useSearchParams();
  
  const [gameName, setGameName] = useState(searchParams.get('gameName') || '');
  const [tagLine, setTagLine] = useState(searchParams.get('tagLine') || '');
  const [region, setRegion] = useState(searchParams.get('region') || 'la1');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [playerError, setPlayerError] = useState('');
  
  const getInitialCache = (): Record<string, PlayerData> => {
    if (typeof window === 'undefined') return {};
    try {
      const cached = localStorage.getItem('playerCache');
      return cached ? JSON.parse(cached) : {};
    } catch { return {}; }
  };
  
  const [playerCache, setPlayerCache] = useState<Record<string, PlayerData>>(getInitialCache);

  const [expandedMatch, setExpandedMatch] = useState<string | null>(null);
  const [matchDetails, setMatchDetails] = useState<MatchData | null>(null);
  const [matchDetailsLoading, setMatchDetailsLoading] = useState(false);
  const [matchCache, setMatchCache] = useState<Record<string, MatchData>>({});

  const saveCache = (cache: Record<string, PlayerData>) => {
    try { localStorage.setItem('playerCache', JSON.stringify(cache)); } catch {}
  };

  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const initialLoaded = useRef(false);

  const searchPlayer = useCallback(async () => {
    if (!gameName || !tagLine) return;
    
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
        const newCache = { ...playerCache, [cacheKey]: data };
        setPlayerCache(newCache);
        saveCache(newCache);
        setPlayerData(data);
        const url = `/?gameName=${encodeURIComponent(gameName)}&tagLine=${encodeURIComponent(tagLine)}&region=${region}`;
        window.history.pushState({}, '', url);
      }
    } finally {
      setLoading(false);
      setInitialLoad(false);
    }
  }, [gameName, tagLine, region, playerCache]);

  const handleClear = useCallback(() => {
    setPlayerData(null);
    setPlayerError('');
    window.history.pushState({}, '', '/');
  }, []);

  useEffect(() => {
    if (initialLoaded.current) return;
    
    const name = searchParams.get('gameName');
    const tag = searchParams.get('tagLine');
    const reg = searchParams.get('region');
    if (name && tag) {
      initialLoaded.current = true;
      setGameName(name);
      setTagLine(tag);
      if (reg) setRegion(reg);
      
      const cacheKey = `${name}-${tag}-${reg || 'la1'}`;
      const cache = getInitialCache();
      
      if (cache[cacheKey]) {
        setPlayerData(cache[cacheKey]);
        setInitialLoad(false);
        return;
      }
      
      setLoading(true);
      setPlayerError('');
      
      fetch(`/api/player?gameName=${name}&tagLine=${tag}&region=${reg || 'la1'}&t=${Date.now()}`)
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setPlayerError(data.error);
          } else {
            const newCache = { ...cache, [cacheKey]: data };
            setPlayerCache(newCache);
            try { localStorage.setItem('playerCache', JSON.stringify(newCache)); } catch {}
            setPlayerData(data);
          }
        })
        .catch(() => setPlayerError('Connection error'))
        .finally(() => {
          setLoading(false);
          setInitialLoad(false);
        });
    } else {
      setInitialLoad(false);
    }
  }, [searchParams]);

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
      const res = await fetch(`/api/match?matchId=${matchId}&region=${region}&puuid=${playerData?.puuid || ''}&t=${timestamp}`);
      const data = await res.json();
      
      if (res.ok) {
        setMatchCache(prev => ({ ...prev, [matchId]: data }));
        setMatchDetails(data);
      }
    } finally {
      setMatchDetailsLoading(false);
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
        const newCache = { ...playerCache, [cacheKey]: data };
        setPlayerCache(newCache);
        saveCache(newCache);
        setPlayerData(data);
      }
    } finally {
      setLoading(false);
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
                matches={playerData.matches || []}
                expandedMatch={expandedMatch}
                matchDetails={matchDetails}
                matchDetailsLoading={matchDetailsLoading}
                onToggleMatch={toggleMatchDetails}
                region={region}
              />
            </>
          )}

          {playerData?.topBuilds && playerData.topBuilds.length > 0 && (
            <TopBuilds topBuilds={playerData.topBuilds} />
          )}
        </main>
      </div>
    </div>
  );
}