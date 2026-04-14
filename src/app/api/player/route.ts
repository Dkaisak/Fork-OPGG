import { NextResponse } from 'next/server';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

const accountRoutes: Record<string, string> = {
  na1: 'americas',
  euw1: 'europe',
  eune: 'europe',
  kr: 'asia',
  la1: 'americas',
  la2: 'americas',
  br1: 'americas',
  jp1: 'asia',
  ru: 'europe',
  tr1: 'europe',
  oc1: 'sea'
};

async function getPuuid(gameName: string, tagLine: string, region: string) {
  const route = accountRoutes[region] || 'americas';
  const url = `https://${route}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
  const response = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_API_KEY! }
  });
  
  console.log('getPuuid response status:', response.status);
  if (!response.ok) {
    const errorText = await response.text();
    console.log('getPuuid error:', errorText);
    return null;
  }
  const data = await response.json();
  return data.puuid;
}

const regionRoutes: Record<string, string> = {
  na1: 'na1',
  euw1: 'euw1',
  eune: 'eun1',
  kr: 'kr1',
  la1: 'la1',
  la2: 'la2',
  br1: 'br1',
  jp1: 'jp1',
  ru: 'ru',
  tr1: 'tr1',
  oc1: 'oc1'
};

function getRoute(region: string): string {
  return regionRoutes[region] || 'na1';
}

async function getSummonerByPuuid(puuid: string, region: string) {
  const route = getRoute(region);
  const url = `https://${route}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  const response = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_API_KEY! }
  });
  
  if (!response.ok) return null;
  const data = await response.json();
  return data;
}

async function getLeagueEntriesByPuuid(puuid: string, region: string) {
  const route = getRoute(region);
  const url = `https://${route}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  const response = await fetch(url, {
    headers: { 
      'X-Riot-Token': RIOT_API_KEY!,
      'Accept': 'application/json'
    },
    cache: 'no-store'
  });
  
  console.log('League by PUUID response status:', response.status);
  if (!response.ok) {
    const error = await response.text();
    console.log('League by PUUID error:', error);
    return null;
  }
  return response.json();
}

async function getChampionMasteries(puuid: string, region: string) {
  const route = getRoute(region);
  const url = `https://${route}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/${puuid}/top?count=15`;
  const response = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_API_KEY! }
  });
  
  if (!response.ok) return null;
  return response.json();
}

let championListCache: Record<string, any> = {};

async function getChampionList(region: string) {
  const route = getRoute(region);
  const cacheKey = region;
  
  if (championListCache[cacheKey]) {
    return championListCache[cacheKey];
  }
  
  const url = `https://${route}.api.riotgames.com/lol/champion/v3/champions`;
  const response = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_API_KEY! }
  });
  
  if (!response.ok) return null;
  const data = await response.json();
  
  // Crear mapa de id -> nombre
  const championMap: Record<number, string> = {};
  if (data.champions) {
    for (const champ of data.champions) {
      championMap[champ.id] = champ.name;
    }
  }
  
  championListCache[cacheKey] = championMap;
  return championMap;
}

async function getMatchHistory(puuid: string, region: string, count: number = 50, startTime?: number) {
  const route = accountRoutes[region] || 'americas';
  // 420 = RANKED_SOLO_5x5
  let url = `https://${route}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=${count}`;
  if (startTime) {
    url += `&startTime=${startTime}`;
  }
  const response = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_API_KEY! },
    cache: 'no-store'
  });
  
  console.log('Match history response status:', response.status);
  if (!response.ok) {
    const error = await response.text();
    console.log('Match history error:', error);
    return null;
  }
  return response.json();
}

async function getMatchDetails(matchId: string, region: string) {
  const route = accountRoutes[region] || 'americas';
  const url = `https://${route}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const response = await fetch(url, {
    headers: { 'X-Riot-Token': RIOT_API_KEY! }
  });
  
  if (!response.ok) return null;
  return response.json();
}

let runesCache: any = null;
async function getRunesReforged(): Promise<any> {
  if (runesCache) return runesCache;
  
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/cdn/16.7.1/data/en_US/rune.json');
    const data = await res.json();
    runesCache = data;
    return data;
  } catch (e) {
    console.error('Failed to load runes:', e);
    return null;
  }
}

let perkCache: Record<string, any> = {};
async function getPerks(): Promise<Record<string, any>> {
  if (Object.keys(perkCache).length > 0) return perkCache;
  
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/cdn/16.7.1/data/en_US/perk.json');
    const data = await res.json();
    for (const [id, perk] of Object.entries(data as any)) {
      const p = perk as any;
      if (p.id) perkCache[p.id] = p;
    }
    console.log('Loaded', Object.keys(perkCache).length, 'perks');
  } catch (e) {
    console.error('Failed to load perks:', e);
  }
  return perkCache;
}

// Helper para obtener URL de imagen de campeón
function getChampionImage(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
  return `https://ddragon.leagueoflegends.com/cdn/16.7.1/img/champion/${cleanName}.png`;
}

// Mapeo de IDs de campeones (Data Dragon 16.7.1)
const championMap: Record<number, string> = {
  266: 'Aatrox', 103: 'Ahri', 84: 'Akali', 166: 'Akshan', 12: 'Alistar',
  799: 'Ambessa', 32: 'Amumu', 34: 'Anivia', 1: 'Annie', 523: 'Aphelios', 22: 'Ashe',
  136: 'AurelionSol', 893: 'Aurora', 268: 'Azir', 432: 'Bard', 200: 'Belveth',
  53: 'Blitzcrank', 63: 'Brand', 201: 'Braum', 233: 'Briar', 51: 'Caitlyn',
  164: 'Camille', 69: 'Cassiopeia', 31: 'Chogath', 42: 'Corki', 122: 'Darius',
  131: 'Diana', 36: 'DrMundo', 119: 'Draven', 245: 'Ekko', 60: 'Elise',
  28: 'Evelynn', 81: 'Ezreal', 9: 'Fiddlesticks', 114: 'Fiora', 105: 'Fizz',
  3: 'Galio', 41: 'Gangplank', 86: 'Garen', 150: 'Gnar', 79: 'Gragas',
  104: 'Graves', 887: 'Gwen', 120: 'Hecarim', 74: 'Heimerdinger', 910: 'Hwei',
  420: 'Illaoi', 39: 'Irelia', 427: 'Ivern', 40: 'Janna', 59: 'JarvanIV',
  24: 'Jax', 126: 'Jayce', 202: 'Jhin', 222: 'Jinx', 897: 'KSante',
  145: 'Kaisa', 429: 'Kalista', 43: 'Karma', 30: 'Karthus', 38: 'Kassadin',
  55: 'Katarina', 10: 'Kayle', 141: 'Kayn', 85: 'Kennen', 121: 'Khazix',
  203: 'Kindred', 240: 'Kled', 96: 'KogMaw', 7: 'Leblanc', 64: 'LeeSin',
  89: 'Leona', 876: 'Lillia', 127: 'Lissandra', 236: 'Lucian', 117: 'Lulu',
  99: 'Lux', 54: 'Malphite', 90: 'Malzahar', 57: 'Maokai', 11: 'MasterYi',
  800: 'Mel', 902: 'Milio', 21: 'MissFortune', 62: 'MonkeyKing', 82: 'Mordekaiser',
  25: 'Morgana', 950: 'Naafiri', 267: 'Nami', 75: 'Nasus', 111: 'Nautilus',
  518: 'Neeko', 76: 'Nidalee', 895: 'Nilah', 56: 'Nocturne', 20: 'Nunu',
  2: 'Olaf', 61: 'Orianna', 516: 'Ornn', 80: 'Pantheon', 78: 'Poppy',
  555: 'Pyke', 246: 'Qiyana', 133: 'Quinn', 497: 'Rakan', 33: 'Rammus',
  421: 'RekSai', 526: 'Rell', 888: 'Renata', 58: 'Renekton', 107: 'Rengar',
  92: 'Riven', 68: 'Rumble', 13: 'Ryze', 360: 'Samira', 113: 'Sejuani',
  235: 'Senna', 147: 'Seraphine', 875: 'Sett', 35: 'Shaco', 98: 'Shen',
  102: 'Shyvana', 27: 'Singed', 14: 'Sion', 15: 'Sivir', 72: 'Skarner',
  901: 'Smolder', 37: 'Sona', 16: 'Soraka', 50: 'Swain', 517: 'Sylas',
  134: 'Syndra', 223: 'TahmKench', 163: 'Taliyah', 91: 'Talon', 44: 'Taric',
  17: 'Teemo', 412: 'Thresh', 18: 'Tristana', 48: 'Trundle', 23: 'Tryndamere',
  4: 'TwistedFate', 29: 'Twitch', 77: 'Udyr', 6: 'Urgot', 110: 'Varus',
  67: 'Vayne', 45: 'Veigar', 161: 'Velkoz', 711: 'Vex', 254: 'Vi',
  234: 'Viego', 112: 'Viktor', 8: 'Vladimir', 106: 'Volibear', 19: 'Warwick',
  498: 'Xayah', 101: 'Xerath', 5: 'XinZhao', 157: 'Yasuo', 777: 'Yone',
  83: 'Yorick', 804: 'Yunara', 350: 'Yuumi', 904: 'Zaahen', 154: 'Zac',
  238: 'Zed', 221: 'Zeri', 115: 'Ziggs', 26: 'Zilean', 142: 'Zoe', 143: 'Zyra'
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');
  const region = searchParams.get('region') || 'la1';

  console.log('=== INICIO BUSQUEDA ===');
  console.log('GameName:', gameName);
  console.log('TagLine:', tagLine);
  console.log('Region:', region);
  console.log('API Key existe:', !!RIOT_API_KEY);

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: 'API Key no configurada' }, { status: 500 });
  }

  try {
    console.log('Buscando:', gameName, '#', tagLine, 'en región:', region);
    
    const puuid = await getPuuid(gameName, tagLine, region);
    console.log('PUUID:', puuid ? 'Obtenido' : 'No encontrado');
    if (!puuid) {
      return NextResponse.json({ error: 'Jugador no encontrado. Verifica el Riot ID (GameName#TagLine)' }, { status: 404 });
    }

    const summoner = await getSummonerByPuuid(puuid, region);
    if (!summoner) {
      return NextResponse.json({ error: 'Summoner no encontrado en esta región' }, { status: 404 });
    }

    console.log('Consultando league entries para PUUID:', puuid);
    const entries = await getLeagueEntriesByPuuid(puuid, region);
    console.log('League entries:', entries);
    
    const masteries = await getChampionMasteries(puuid, region);
    
    // Obtener historial de partidas rankeadas (20 para display, 50 para stats)
    console.log('Consultando historial de partidas...');
    const matchIds = await getMatchHistory(puuid, region, 50);
    console.log('Match IDs:', matchIds);
    
    const championStats: Record<number, any> = {};
    const runesMap: Record<string, any> = {};
    const roleStats: Record<string, any> = {};
    let recentMatches: any[] = [];
    let allMatchesDetailed: any[] = [];
    
    if (matchIds && matchIds.length > 0) {
      // Obtener más detalles de partidas para stats (hasta 50)
      const matchesToFetch = Math.min(matchIds.length, 50);
      const matchDetailsCache: Record<string, any> = {};
      
      for (let i = 0; i < matchesToFetch; i++) {
        const matchId = matchIds[i];
        const matchDetails = await getMatchDetails(matchId, region);
        if (matchDetails) {
          matchDetailsCache[matchId] = matchDetails;
          const player = matchDetails.info.participants.find((p: any) => p.puuid === puuid);
          if (player) {
            const champId = player.championId;
            const duration = matchDetails.info.gameDuration || 1800;
            const cs = (player.totalMinionsKilled || 0) + (player.neutralMinionsKilled || 0);
            const k = player.kills;
            const d = player.deaths;
            const a = player.assists;
            
            // Stats por campeón
            if (!championStats[champId]) {
              championStats[champId] = {
                championId: champId,
                championName: championMap[champId] || `Champion ${champId}`,
                championImage: getChampionImage(championMap[champId] || ''),
                wins: 0,
                losses: 0,
                kills: 0,
                deaths: 0,
                assists: 0,
                csTotal: 0,
                durationTotal: 0,
                games: 0,
                itemsMap: {} as Record<string, any>
              };
            }
            if (player.win) championStats[champId].wins++;
            else championStats[champId].losses++;
            championStats[champId].kills += k;
            championStats[champId].deaths += d;
            championStats[champId].assists += a;
            championStats[champId].csTotal += cs;
            championStats[champId].durationTotal += duration;
            championStats[champId].games++;
            
            // Stats por rol
            const role = player.teamPosition || player.role || 'UNKNOWN';
            if (!roleStats[role]) {
              roleStats[role] = { role, wins: 0, losses: 0, kills: 0, deaths: 0, assists: 0, games: 0 };
            }
            if (player.win) roleStats[role].wins++;
            else roleStats[role].losses++;
            roleStats[role].kills += k;
            roleStats[role].deaths += d;
            roleStats[role].assists += a;
            roleStats[role].games++;
            
            // Runas usadas
            const rune0 = player.perk0 || '';
            const rune1 = player.perk1 || '';
            const runeKey = `${rune0}-${rune1}`;
            if (!runesMap[runeKey]) {
              runesMap[runeKey] = { rune0, rune1, wins: 0, games: 0 };
            }
            runesMap[runeKey].games++;
            if (player.win) runesMap[runeKey].wins++;
            
            // Builds - guardar items por campeón
            const items = [player.item0, player.item1, player.item2, player.item3, player.item4, player.item5, player.item6].filter((id: number) => id > 0);
            const itemsKey = items.sort((a, b) => a - b).join(',');
            if (!championStats[champId].itemsMap[itemsKey]) {
              championStats[champId].itemsMap[itemsKey] = { items, wins: 0, games: 0 };
            }
            championStats[champId].itemsMap[itemsKey].games++;
            if (player.win) championStats[champId].itemsMap[itemsKey].wins++;
            
            // Match detallado para historial
            const matchData = {
              matchId: matchId,
              championId: champId,
              championName: championMap[champId] || `Champion ${champId}`,
              championImage: getChampionImage(championMap[champId] || ''),
              win: player.win,
              kills: k,
              deaths: d,
              assists: a,
              cs: cs,
              role: player.teamPosition || player.role,
              kda: `${k}/${d}/${a}`,
              duration: duration,
              queueType: matchDetails.info.queueId,
              damageDealtToChampions: player.totalDamageDealtToChampions || 0,
              damageTaken: player.totalDamageTaken || 0,
              visionScore: player.visionScore || 0,
              goldEarned: player.goldEarned || 0,
              csPerMin: duration > 0 ? (cs / (duration / 60)).toFixed(1) : '0',
              enemyChampId: (() => {
                const myTeamId = player.teamId;
                const enemyTeam = matchDetails.info.participants.filter((p: any) => p.teamId !== myTeamId);
                const enemyChamp = enemyTeam.find((p: any) => p.teamPosition !== 'JUNGLE') || enemyTeam[0];
                return enemyChamp?.championId || 0;
              })()
            };
            
            allMatchesDetailed.push(matchData);
            if (i < 20) recentMatches.push(matchData);
          }
        }
      }
    }
    
    // Calcular stats finales por campeón
    const championStatsArray = Object.values(championStats).map((c: any) => {
      const total = c.wins + c.losses;
      const wr = total > 0 ? Math.round((c.wins / total) * 100) : 0;
      const kda = c.deaths > 0 ? ((c.kills + c.assists) / c.deaths).toFixed(2) : (c.kills + c.assists).toFixed(2);
      const csPerMin = c.durationTotal > 0 ? (c.csTotal / (c.durationTotal / 60)).toFixed(1) : '0';
      return {
        ...c,
        winrate: wr,
        kda: kda,
        csPerMin: csPerMin,
        avgKills: Math.round(c.kills / c.games),
        avgDeaths: Math.round(c.deaths / c.games),
        avgAssists: Math.round(c.assists / c.games)
      };
    }).sort((a: any, b: any) => b.games - a.games || b.winrate - a.winrate);
    
    // Top runas
    const topRunes = Object.values(runesMap)
      .map((r: any) => ({ ...r, winrate: r.games > 0 ? Math.round((r.wins / r.games) * 100) : 0 }))
      .sort((a: any, b: any) => b.games - a.games || b.winrate - a.winrate)
      .slice(0, 3);
    
    // Calcular tendencia (últimas 10 vs anteriores)
    const recent10 = allMatchesDetailed.slice(0, 10);
    const previous10 = allMatchesDetailed.slice(10, 20);
    
    // Calcular rachas
    let winStreak = 0;
    let lossStreak = 0;
    let currentStreakType = '';
    
    for (const match of allMatchesDetailed) {
      if (match.win) {
        if (currentStreakType === 'win' || currentStreakType === '') {
          winStreak++;
          currentStreakType = 'win';
        } else {
          break;
        }
      } else {
        if (currentStreakType === 'loss' || currentStreakType === '') {
          lossStreak++;
          currentStreakType = 'loss';
        } else {
          break;
        }
      }
    }
    
    const calcTrend = (matches: any[]) => {
      if (matches.length === 0) return { winrate: 0, kda: '0', csPerMin: '0' };
      const wins = matches.filter(m => m.win).length;
      let totalK = 0, totalD = 0, totalA = 0, totalCs = 0, totalDur = 0;
      for (const m of matches) {
        totalK += m.kills;
        totalD += m.deaths;
        totalA += m.assists;
        totalCs += m.cs;
        totalDur += m.duration;
      }
      const wr = Math.round((wins / matches.length) * 100);
      const kda = totalD > 0 ? ((totalK + totalA) / totalD).toFixed(2) : (totalK + totalA).toFixed(2);
      const csPm = totalDur > 0 ? (totalCs / (totalDur / 60)).toFixed(1) : '0';
      return { winrate: wr, kda, csPerMin: csPm };
    };
    
    const trend = {
      last10: calcTrend(recent10),
      previous10: calcTrend(previous10),
      isImproving: (() => {
        const last = calcTrend(recent10).winrate;
        const prev = calcTrend(previous10).winrate;
        return last > prev ? 'up' : last < prev ? 'down' : 'neutral';
      })()
    };
    
    // Calcular counters (mejores y peores matchups) usando datos cacheados
    const counters: { better: any[], worse: any[] } = { better: [], worse: [] };
    const matchupStats: Record<number, { championId: string, wins: number, losses: number, games: number }> = {};
    
    for (const matchData of allMatchesDetailed) {
      if (!matchData.enemyChampId) continue;
      const enemyId = matchData.enemyChampId;
      if (!matchupStats[enemyId]) {
        matchupStats[enemyId] = { championId: championMap[enemyId] || `Champion ${enemyId}`, wins: 0, losses: 0, games: 0 };
      }
      if (matchData.win) matchupStats[enemyId].wins++;
      else matchupStats[enemyId].losses++;
      matchupStats[enemyId].games++;
    }
    
    const matchupArray = Object.values(matchupStats)
      .filter((m: any) => m.games >= 2)
      .map((m: any) => ({ ...m, winrate: Math.round((m.wins / m.games) * 100) }))
      .sort((a: any, b: any) => b.winrate - a.winrate);
    
    counters.better = matchupArray.slice(0, 3).map((m: any) => ({
      champion: m.championId,
      winrate: m.winrate,
      games: m.games
    }));
    counters.worse = matchupArray.slice(-3).reverse().map((m: any) => ({
      champion: m.championId,
      winrate: m.winrate,
      games: m.games
    }));
    
    // Top builds por campeón
    const topBuilds = Object.values(championStats)
      .filter((c: any) => c.games >= 2)
      .map((c: any) => {
        const builds = Object.values(c.itemsMap)
          .map((b: any) => ({ ...b, winrate: Math.round((b.wins / b.games) * 100) }))
          .sort((a: any, b: any) => b.games - a.games || b.winrate - a.winrate)
          .slice(0, 3);
        return {
          championId: c.championId,
          championName: c.championName,
          championImage: c.championImage,
          games: c.games,
          builds: builds.filter((b: any) => b.games >= 1)
        };
      })
      .sort((a: any, b: any) => b.games - a.games)
      .slice(0, 3);
    
    let rankInfo = null;
    if (entries) {
      const soloQueue = entries.find((e: any) => e.queueType === 'RANKED_SOLO_5x5');
      if (soloQueue) {
        const totalGames = soloQueue.wins + soloQueue.losses;
        const wr = totalGames > 0 ? Math.round((soloQueue.wins / totalGames) * 100) : 0;
        rankInfo = {
          tier: soloQueue.tier.charAt(0) + soloQueue.tier.slice(1).toLowerCase(),
          rank: soloQueue.rank,
          lp: soloQueue.leaguePoints,
          wins: soloQueue.wins,
          losses: soloQueue.losses,
          wr: wr
        };
      }
    }

    let masteriesInfo = null;
    if (masteries && masteries.length > 0) {
      const champName = championMap[masteries[0]?.championId] || '';
      masteriesInfo = masteries.map((m: any) => ({
        championId: m.championId,
        championName: championMap[m.championId] || `Champion ${m.championId}`,
        championImage: getChampionImage(championMap[m.championId] || ''),
        level: m.championLevel,
        points: m.championPoints
      }));
    }

    // Usar championMap para los nombres
    const getChampionName = (id: number) => {
      return championMap[id] || `Champion ${id}`;
    };

    return NextResponse.json({
      puuid,
      summonerName: gameName,
      summonerLevel: summoner.summonerLevel,
      profileIconId: summoner.profileIconId,
      tagLine: tagLine,
      region: region,
      rank: rankInfo,
      masteries: masteriesInfo,
      matches: recentMatches,
      championStats: championStatsArray,
      topRunes: topRunes,
      topBuilds: topBuilds,
      trend: trend,
      counters: counters,
      roleStats: (() => {
        const allRoles = ['TOP', 'JUNGLE', 'MIDDLE', 'BOTTOM', 'UTILITY'];
        return allRoles.map(role => {
          const r = roleStats[role] || { role, wins: 0, losses: 0, games: 0 };
          return {
            role: r.role,
            wins: r.wins,
            losses: r.losses,
            games: r.games,
            winrate: r.games > 0 ? Math.round((r.wins / r.games) * 100) : 0
          };
        });
      })(),
      winStreak,
      lossStreak,
      totalMatchesAnalyzed: allMatchesDetailed.length
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}