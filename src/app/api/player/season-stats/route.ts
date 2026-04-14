import { NextResponse } from 'next/server';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

const accountRoutes: Record<string, string> = {
  na1: 'americas', euw1: 'europe', eune: 'europe', kr: 'asia',
  la1: 'americas', la2: 'americas', br1: 'americas', jp1: 'asia',
  ru: 'europe', tr1: 'europe', oc1: 'sea'
};

const regionRoutes: Record<string, string> = {
  na1: 'na1', euw1: 'euw1', eune: 'eun1', kr: 'kr1',
  la1: 'la1', la2: 'la2', br1: 'br1', jp1: 'jp1',
  ru: 'ru', tr1: 'tr1', oc1: 'oc1'
};

function getRoute(region: string) { return regionRoutes[region] || 'na1'; }
function getAccountRoute(region: string) { return accountRoutes[region] || 'americas'; }

async function getPuuid(gameName: string, tagLine: string, region: string) {
  const route = getAccountRoute(region);
  const url = `https://${route}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
  const response = await fetch(url, { headers: { 'X-Riot-Token': RIOT_API_KEY! } });
  if (!response.ok) return null;
  return (await response.json()).puuid;
}

async function getSummonerByPuuid(puuid: string, region: string) {
  const route = getRoute(region);
  const url = `https://${route}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${puuid}`;
  const response = await fetch(url, { headers: { 'X-Riot-Token': RIOT_API_KEY! } });
  if (!response.ok) return null;
  return response.json();
}

async function getLeagueEntriesByPuuid(puuid: string, region: string) {
  const route = getRoute(region);
  const url = `https://${route}.api.riotgames.com/lol/league/v4/entries/by-puuid/${puuid}`;
  const response = await fetch(url, { headers: { 'X-Riot-Token': RIOT_API_KEY! }, cache: 'no-store' });
  if (!response.ok) return null;
  return response.json();
}

async function getMatchHistory(puuid: string, region: string, count: number = 100) {
  const route = getAccountRoute(region);
  const url = `https://${route}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=${count}`;
  const response = await fetch(url, { headers: { 'X-Riot-Token': RIOT_API_KEY! }, cache: 'no-store' });
  if (!response.ok) return null;
  return response.json();
}

async function getMatchDetails(matchId: string, region: string) {
  const route = getAccountRoute(region);
  const url = `https://${route}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const response = await fetch(url, { headers: { 'X-Riot-Token': RIOT_API_KEY! } });
  if (!response.ok) return null;
  return response.json();
}

// Helper para obtener URL de imagen de campeón
function getChampionImage(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
  return `https://ddragon.leagueoflegends.com/cdn/16.7.1/img/champion/${cleanName}.png`;
}

// Mapa de campeones (Data Dragon 16.7.1)
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

  if (!gameName || !tagLine) {
    return NextResponse.json({ error: 'Faltan parámetros' }, { status: 400 });
  }

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: 'API Key no configurada' }, { status: 500 });
  }

  try {
    const puuid = await getPuuid(gameName, tagLine, region);
    if (!puuid) {
      return NextResponse.json({ error: 'Jugador no encontrado' }, { status: 404 });
    }

    // 1. Obtener rango actual
    const entries = await getLeagueEntriesByPuuid(puuid, region);
    let currentRank = null;
    if (entries) {
      const soloQueue = entries.find((e: any) => e.queueType === 'RANKED_SOLO_5x5');
      if (soloQueue) {
        currentRank = {
          tier: soloQueue.tier,
          rank: soloQueue.rank,
          lp: soloQueue.leaguePoints,
          wins: soloQueue.wins,
          losses: soloQueue.losses
        };
      }
    }

    // 2. Obtener historial de partidas (últimas 100)
    const matchIds = await getMatchHistory(puuid, region, 100);
    
    let totalKills = 0, totalDeaths = 0, totalAssists = 0;
    let totalWins = 0, totalLosses = 0;
    const championStats: Record<number, { wins: number, losses: number, kills: number, deaths: number, assists: number }> = {};
    const matchesDetails: any[] = [];

    if (matchIds && matchIds.length > 0) {
      for (const matchId of matchIds.slice(0, 100)) {
        const matchDetails = await getMatchDetails(matchId, region);
        if (!matchDetails) continue;

        const player = matchDetails.info.participants.find((p: any) => p.puuid === puuid);
        if (!player) continue;

        const isWin = player.win;
        const champId = player.championId;

        // Stats globales
        totalKills += player.kills;
        totalDeaths += player.deaths;
        totalAssists += player.assists;
        if (isWin) totalWins++; else totalLosses++;

        // Stats por campeón
        if (!championStats[champId]) {
          championStats[champId] = { wins: 0, losses: 0, kills: 0, deaths: 0, assists: 0 };
        }
        if (isWin) championStats[champId].wins++; else championStats[champId].losses++;
        championStats[champId].kills += player.kills;
        championStats[champId].deaths += player.deaths;
        championStats[champId].assists += player.assists;

        // Guardar timestamp para análisis por temporada
        matchesDetails.push({
          matchId,
          timestamp: matchDetails.info.gameCreation,
          championId: champId,
          win: isWin,
          kills: player.kills,
          deaths: player.deaths,
          assists: player.assists
        });
      }
    }

    // Calcular estadísticas globales
    const totalGames = totalWins + totalLosses;
    const globalWinrate = totalGames > 0 ? ((totalWins / totalGames) * 100).toFixed(1) : '0';
    const globalKDA = totalDeaths > 0 
      ? ((totalKills + totalAssists) / totalDeaths).toFixed(2) 
      : ((totalKills + totalAssists) / 1).toFixed(2);

    // Top 10 campeones más jugados
    const topChampions = Object.entries(championStats)
      .map(([id, stats]) => {
        const champName = championMap[parseInt(id)] || `Champion ${id}`;
        return {
          championId: parseInt(id),
          championName: champName,
          championImage: getChampionImage(champName),
          games: stats.wins + stats.losses,
          wins: stats.wins,
          losses: stats.losses,
          winrate: ((stats.wins / (stats.wins + stats.losses)) * 100).toFixed(1),
          kda: stats.deaths > 0 
            ? ((stats.kills + stats.assists) / stats.deaths).toFixed(2)
            : ((stats.kills + stats.assists) / 1).toFixed(2)
        };
      })
      .sort((a, b) => b.games - a.games)
      .slice(0, 10);

    // Análisis por períodos (simulando temporadas basado en meses recientes)
    const now = Date.now();
    const oneMonthAgo = now - (30 * 24 * 60 * 60 * 1000);
    const twoMonthsAgo = now - (60 * 24 * 60 * 60 * 1000);
    const threeMonthsAgo = now - (90 * 24 * 60 * 60 * 1000);

    const calculatePeriodStats = (startTime: number, endTime: number) => {
      const periodMatches = matchesDetails.filter(m => m.timestamp >= startTime && m.timestamp < endTime);
      if (periodMatches.length === 0) return null;
      
      const wins = periodMatches.filter(m => m.win).length;
      const kills = periodMatches.reduce((sum, m) => sum + m.kills, 0);
      const deaths = periodMatches.reduce((sum, m) => sum + m.deaths, 0);
      const assists = periodMatches.reduce((sum, m) => sum + m.assists, 0);
      
      return {
        games: periodMatches.length,
        wins,
        losses: periodMatches.length - wins,
        winrate: ((wins / periodMatches.length) * 100).toFixed(1),
        kda: deaths > 0 ? ((kills + assists) / deaths).toFixed(2) : (kills + assists).toFixed(2)
      };
    };

    const last30Days = calculatePeriodStats(oneMonthAgo, now);
    const last60Days = calculatePeriodStats(twoMonthsAgo, oneMonthAgo);
    const last90Days = calculatePeriodStats(threeMonthsAgo, twoMonthsAgo);

    return NextResponse.json({
      currentRank,
      summary: {
        totalGames,
        totalWins,
        totalLosses,
        winrate: globalWinrate,
        kda: globalKDA,
        avgKills: totalGames > 0 ? (totalKills / totalGames).toFixed(1) : '0',
        avgDeaths: totalGames > 0 ? (totalDeaths / totalGames).toFixed(1) : '0',
        avgAssists: totalGames > 0 ? (totalAssists / totalGames).toFixed(1) : '0'
      },
      topChampions,
      periods: {
        last30Days,
        last60Days,
        last90Days
      }
    });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}