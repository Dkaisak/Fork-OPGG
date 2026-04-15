import { NextResponse } from 'next/server';
import { isRateLimited } from '@utils/rateLimit';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

const accountRoutes: Record<string, string> = {
  na1: 'americas', euw1: 'europe', eune: 'europe', kr: 'asia',
  la1: 'americas', la2: 'americas', br1: 'americas'
};

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

const itemCache: Record<number, string> = {};
const spellCache: Record<string, { name: string; image: string }> = {};

async function loadItemMap(): Promise<Record<number, string>> {
  if (Object.keys(itemCache).length > 0) return itemCache;
  
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/cdn/16.7.1/data/en_US/item.json');
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    for (const [id, item] of Object.entries(data.data as any)) {
      const name = (item as any).name;
      if (name) itemCache[parseInt(id)] = name;
    }
    console.log('Loaded', Object.keys(itemCache).length, 'items from Data Dragon');
  } catch (e) {
    console.error('Failed to load item map:', e);
  }
  return itemCache;
}

async function loadSpellMap(): Promise<Record<string, { name: string; image: string }>> {
  if (Object.keys(spellCache).length > 0) return spellCache;
  
  try {
    const res = await fetch('https://ddragon.leagueoflegends.com/cdn/16.7.1/data/en_US/summoner.json');
    if (!res.ok) throw new Error('Failed to fetch');
    const data = await res.json();
    for (const [id, spell] of Object.entries(data.data as any)) {
      const s = spell as any;
      const name = s.name;
      const image = s.image?.full;
      const spellKey = s.key;
      if (name) {
        spellCache[id] = { name, image: image || `${id}.png` };
        if (spellKey) spellCache[spellKey] = { name, image: image || `${id}.png` };
      }
    }
    console.log('Loaded', Object.keys(spellCache).length, 'summoner spells');
  } catch (e) {
    console.error('Failed to load spell map:', e);
  }
  return spellCache;
}

function getItemName(itemId: number): string {
  if (Object.keys(itemCache).length === 0) {
    loadItemMap();
  }
  return itemCache[itemId] || `Item ${itemId}`;
}

function getSpellName(spellKey: string): { name: string; image: string } {
  if (Object.keys(spellCache).length === 0) {
    loadSpellMap();
  }
  return spellCache[spellKey] || { name: spellKey, image: `${spellKey}.png` };
}

const rankIcons: Record<string, string> = {
  iron: '/ranked-emblems/Rank=Iron.png',
  bronze: '/ranked-emblems/Rank=Bronze.png',
  silver: '/ranked-emblems/Rank=Silver.png',
  gold: '/ranked-emblems/Rank=Gold.png',
  platinum: '/ranked-emblems/Rank=Platinum.png',
  emerald: '/ranked-emblems/Rank=Emerald.png',
  diamond: '/ranked-emblems/Rank=Diamond.png',
  master: '/ranked-emblems/Rank=Master.png',
  grandmaster: '/ranked-emblems/Rank=Grandmaster.png',
  challenger: '/ranked-emblems/Rank=Challenger.png'
};

function getChampionImage(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
  return `https://ddragon.leagueoflegends.com/cdn/16.7.1/img/champion/${cleanName}.png`;
}

function getItemImage(itemId: number): string {
  return `https://ddragon.leagueoflegends.com/cdn/16.7.1/img/item/${itemId}.png`;
}

let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 60;

async function rateLimitedFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const now = Date.now();
  const timeSinceLastRequest = now - lastRequestTime;
  
  if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLastRequest));
  }
  
  lastRequestTime = Date.now();
  
  return fetch(url, {
    ...options,
    headers: {
      'X-Riot-Token': RIOT_API_KEY!,
      ...options.headers
    }
  });
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const matchId = searchParams.get('matchId');
  const region = searchParams.get('region') || 'la1';
  const puuid = searchParams.get('puuid');

  if (!matchId) {
    return NextResponse.json({ error: 'Falta matchId' }, { status: 400 });
  }

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: 'API Key no configurada' }, { status: 500 });
  }

  if (isRateLimited()) {
    return NextResponse.json({ error: 'Rate limit exceeded. Intenta más tarde.' }, { status: 429 });
  }

  try {
    await Promise.all([loadItemMap(), loadSpellMap()]);
    
    const route = accountRoutes[region] || 'americas';
    const url = `https://${route}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
    const response = await rateLimitedFetch(url);
    
    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: err }, { status: response.status });
    }
    
    const data = await response.json();
    
    const blueTeam = data.info.participants.filter((p: any) => p.teamId === 100);
    const redTeam = data.info.participants.filter((p: any) => p.teamId === 200);
    const gameDuration = data.info.gameDuration || 1800;
    
    const formatPlayer = (p: any) => {
      const totalCS = (p.totalMinionsKilled || 0) + (p.neutralMinionsKilled || 0);
      const csPerMin = (totalCS / (gameDuration / 60)).toFixed(2);
      const spell1 = getSpellName(p.summoner1Id || '');
      const spell2 = getSpellName(p.summoner2Id || '');
      return {
        championId: p.championId,
        championName: championMap[p.championId] || `Champion ${p.championId}`,
        championImage: getChampionImage(championMap[p.championId] || ''),
        teamId: p.teamId,
        team: p.teamId === 100 ? 'blue' : 'red',
        win: p.win,
        kills: p.kills,
        deaths: p.deaths,
        assists: p.assists,
        kda: `${p.kills}/${p.deaths}/${p.assists}`,
        cs: totalCS,
        csPerMin,
        role: p.teamPosition || p.role || 'UNKNOWN',
        summonerName: p.riotIdGameName || p.summonerName || 'Unknown',
        summonerTag: p.riotIdTagline || '',
        summonerId: p.summonerId || '',
        puuid: p.puuid || '',
        spells: [
          { key: p.summoner1Id, name: spell1.name, image: `https://ddragon.leagueoflegends.com/cdn/16.7.1/img/spell/${spell1.image}` },
          { key: p.summoner2Id, name: spell2.name, image: `https://ddragon.leagueoflegends.com/cdn/16.7.1/img/spell/${spell2.image}` }
        ],
        runes: {
          primaryStyle: p.perkPrimaryStyle || p.perks?.styles?.[0]?.style || 0,
          subStyle: p.perkSubStyle || p.perks?.styles?.[1]?.style || 0
        },
        items: [p.item0, p.item1, p.item2, p.item3, p.item4, p.item5, p.item6],
        goldEarned: p.goldEarned || 0,
        visionScore: p.visionScore || 0,
        wardsPlaced: p.wardsPlaced || 0,
        wardsKilled: p.wardsKilled || 0,
        damageDealtToChampions: p.totalDamageDealtToChampions || 0,
        magicDamageDealt: p.magicDamageDealtToChampions || 0,
        physicalDamageDealt: p.physicalDamageDealtToChampions || 0,
        damageTaken: p.totalDamageTaken || 0,
        healing: p.totalHealing || 0
      };
    };
    
    const participants = data.info.participants.map(formatPlayer);
    const formattedBlueTeam = blueTeam.map(formatPlayer);
    const formattedRedTeam = redTeam.map(formatPlayer);
    
    let myPlayer = null;
    if (puuid) {
      myPlayer = participants.find((p: any) => p.puuid === puuid || p.summonerId === puuid);
    }
    if (!myPlayer && participants.length > 0) {
      myPlayer = participants[0];
    }
    
    const blueTeamMaxDamage = Math.max(...formattedBlueTeam.map((p: any) => p.totalDamageDealtToChampions || 0));
    const redTeamMaxDamage = Math.max(...formattedRedTeam.map((p: any) => p.totalDamageDealtToChampions || 0));
    
    return NextResponse.json({
      matchId,
      gameDuration: data.info.gameDuration,
      queueId: data.info.queueId,
      gameMode: data.info.gameMode,
      participants,
      blueTeam: formattedBlueTeam,
      redTeam: formattedRedTeam,
      blueTeamMaxDamage,
      redTeamMaxDamage,
      myPlayer,
      result: myPlayer?.win ? 'Victoria' : 'Derrota'
    });
  } catch (error) {
    console.error('Match error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}