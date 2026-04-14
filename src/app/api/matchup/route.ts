import { NextResponse } from 'next/server';

const RIOT_API_KEY = process.env.RIOT_API_KEY;

const accountRoutes: Record<string, string> = {
  na1: 'americas', euw1: 'europe', eune: 'europe', kr: 'asia',
  la1: 'americas', la2: 'americas', br1: 'americas'
};

const regionRoutes: Record<string, string> = {
  na1: 'na1', euw1: 'euw1', eune: 'eun1', kr: 'kr1',
  la1: 'la1', la2: 'la2', br1: 'br1'
};

const championMap: Record<number, string> = {
  1: 'Annie', 2: 'Olaf', 3: 'Galio', 4: 'TwistedFate', 5: 'XinZhao',
  6: 'Urgot', 7: 'Leblanc', 8: 'Vladimir', 9: 'Fiddlesticks', 10: 'Kayle',
  11: 'MasterYi', 12: 'Alistar', 13: 'Ryze', 14: 'Sion', 15: 'Sivir',
  16: 'Soraka', 17: 'Teemo', 18: 'Tristana', 19: 'Warwick', 20: 'Nunu',
  21: 'MissFortune', 22: 'Ashe', 23: 'Tryndamere', 24: 'Jax', 25: 'Morgana',
  26: 'Zilean', 27: 'Singed', 28: 'Evelynn', 29: 'Twitch', 30: 'Karthus',
  31: 'ChoGath', 32: 'Amumu', 33: 'Rammus', 34: 'Anivia', 35: 'Shaco',
  36: 'DrMundo', 37: 'Sona', 38: 'Kassadin', 39: 'Irelia', 40: 'Janna',
  41: 'Gangplank', 42: 'Corki', 43: 'Karma', 44: 'Taric', 45: 'Veigar',
  48: 'Trundle', 50: 'Swain', 51: 'Caitlyn', 53: 'Blitzcrank', 54: 'Malphite',
  55: 'Katarina', 56: 'Nocturne', 57: 'Maokai', 58: 'Renekton', 59: 'JarvanIV',
  60: 'Elise', 61: 'Orianna', 62: 'Wukong', 63: 'Brand', 64: 'LeeSin',
  67: 'Vayne', 68: 'Rumble', 69: 'Cassiopeia', 72: 'Skarner', 74: 'Heimerdinger',
  75: 'Nasus', 76: 'Nidalee', 77: 'Udyr', 78: 'Poppy', 79: 'Gragas',
  80: 'Pantheon', 81: 'Ezreal', 82: 'Mordekaiser', 83: 'Yorick', 84: 'Akali',
  85: 'Kennen', 86: 'Garen', 89: 'Leona', 90: 'Malzahar', 91: 'Talon',
  92: 'Riven', 96: 'KogMaw', 98: 'Shen', 99: 'Lux', 101: 'Xerath',
  102: 'Shyvana', 103: 'Ahri', 104: 'Graves', 105: 'Fizz', 106: 'Volibear',
  107: 'Rengar', 110: 'Varus', 111: 'Nautilus', 112: 'Viktor', 113: 'Sejuani',
  114: 'Fiora', 115: 'Ziggs', 117: 'Lulu', 119: 'Draven', 120: 'Hecarim',
  121: 'Khazix', 122: 'Darius', 126: 'Jayce', 127: 'Lissandra', 131: 'Diana',
  133: 'Quinn', 134: 'Syndra', 136: 'AurelionSol', 141: 'Kayn', 142: 'Zoe',
  143: 'Zyra', 145: 'Kaisa', 147: 'Seraphine', 150: 'Gnar', 154: 'Zac',
  157: 'Yasuo', 161: 'Velkoz', 163: 'Taliyah', 164: 'Camille', 166: 'Akshan',
  200: 'Belveth', 201: 'Braum', 202: 'Jhin', 203: 'Kindred', 221: 'Zeri',
  222: 'Jinx', 223: 'TahmKench', 233: 'Briar', 234: 'Viego', 235: 'Senna',
  236: 'Lucian', 238: 'Zed', 240: 'Kled', 245: 'Ekko', 246: 'Qiyana',
  254: 'Vi', 266: 'Aatrox', 267: 'Nami', 268: 'Azir', 350: 'Yuumi',
  360: 'Samira', 412: 'Thresh', 420: 'Illaoi', 421: 'RekSai', 427: 'Ivern',
  429: 'Kalista', 432: 'Bard', 497: 'Rakan', 498: 'Xayah', 516: 'Ornn',
  517: 'Sylas', 518: 'Neeko', 523: 'Aphelios', 526: 'Rell', 555: 'Pyke',
  711: 'Vex', 777: 'Yone', 799: 'Ambessa', 875: 'Sett', 876: 'Lillia',
  887: 'Gwen', 888: 'Renata', 893: 'Aurora', 895: 'Nilah', 897: 'KSante',
  901: 'Smolder', 902: 'Milio', 904: 'Zaheen', 910: 'Hwei', 950: 'Naafiri'
};

const championNameToId: Record<string, string> = {};
for (const [id, name] of Object.entries(championMap)) {
  championNameToId[name.toLowerCase()] = id;
  championNameToId[name.toLowerCase().replace(/[^a-z]/g, '')] = id;
}

function getChampionId(name: string): number | null {
  const normalized = name.toLowerCase().replace(/[^a-z]/g, '');
  const id = championNameToId[normalized];
  return id ? parseInt(id) : null;
}

function getChampionImage(name: string): string {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '');
  return `https://ddragon.leagueoflegends.com/cdn/16.7.1/img/champion/${cleanName}.png`;
}

const requestQueue: { resolve: () => void }[] = [];
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

async function getPuuid(gameName: string, tagLine: string, region: string) {
  const route = accountRoutes[region] || 'americas';
  const url = `https://${route}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}`;
  const response = await rateLimitedFetch(url);
  
  if (!response.ok) return null;
  const data = await response.json();
  return data.puuid;
}

async function getMatchHistory(puuid: string, region: string, count: number = 20) {
  const route = accountRoutes[region] || 'americas';
  const url = `https://${route}.api.riotgames.com/lol/match/v5/matches/by-puuid/${puuid}/ids?queue=420&start=0&count=${count}`;
  const response = await rateLimitedFetch(url, { cache: 'no-store' });
  
  if (!response.ok) return null;
  return response.json();
}

async function getMatchDetails(matchId: string, region: string) {
  const route = accountRoutes[region] || 'americas';
  const url = `https://${route}.api.riotgames.com/lol/match/v5/matches/${matchId}`;
  const response = await rateLimitedFetch(url);
  
  if (!response.ok) return null;
  return response.json();
}

interface ItemBuild {
  items: string[];
  wins: number;
  games: number;
  winrate: number;
}

function normalizeItems(items: any[]): string[] {
  return items
    .filter((id: any) => id && id > 0)
    .sort((a: any, b: any) => a - b);
}

function buildToKey(items: number[]): string {
  return items.join(',');
}

function analyzeBuilds(matches: any[], allyChampionId: number | null, enemyChampionId: number | null): ItemBuild[] {
  const buildMap = new Map<string, ItemBuild>();
  
  for (const match of matches) {
    if (match.allyChampionId !== allyChampionId) continue;
    if (enemyChampionId && match.enemyChampionId !== enemyChampionId) continue;
    
    const itemIds = [
      match.items.item0, match.items.item1, match.items.item2,
      match.items.item3, match.items.item4, match.items.item5,
      match.items.item6
    ].filter(id => id && id > 0);
    
    const key = buildToKey(itemIds);
    
    if (!buildMap.has(key)) {
      buildMap.set(key, {
        items: itemIds.map(id => getItemName(id)),
        wins: 0,
        games: 0,
        winrate: 0
      });
    }
    
    const build = buildMap.get(key)!;
    build.games++;
    if (match.win) build.wins++;
  }
  
  const builds = Array.from(buildMap.values())
    .map(b => ({ ...b, winrate: b.games > 0 ? b.wins / b.games : 0 }))
    .filter(b => b.games >= 1)
    .sort((a, b) => b.games - a.games || b.winrate - a.winrate)
    .slice(0, 5);
  
  return builds;
}

const itemMap: Record<number, string> = {
  1001: 'Boots', 1002: 'Refillable Potion', 1003: 'Health Potion', 1004: 'Mana Potion',
  1011: 'Giant\'s Belt', 1018: 'Cloth Armor', 1029: 'Leather Armor',
  1031: 'Chain Vest', 1033: 'Null-Magic Mantle', 1036: 'Long Sword', 1037: 'Pickaxe',
  1038: 'B.F. Sword', 1040: 'Dagger', 1042: 'Recurve Bow', 1043: 'Amplifying Tome',
  1052: 'Fiendish Codex', 1053: 'Needlessly Large Rod', 1054: 'Serrated Dirk',
  1055: "Doran's Blade", 1056: "Doran's Ring", 1057: "Doran's Shield",
  1082: 'The Brutalizer', 1083: 'Cull', 1084: 'World Atlas',
  2015: 'The Gold Card', 2016: 'Old Mythic',
  2031: 'Refillable Potion', 2033: 'Health Potion',
  2051: 'Guardian Idol', 2052: 'Relic Shield',
  2053: 'Runesteel', 2054: 'Obsidian Edge',
  3001: 'IBG', 3003: 'Muramana', 3004: 'Muramana',
  3006: 'Berserker Greaves', 3007: 'Ninja Tabi', 3008: 'Mercury Treads',
  3009: 'Boots of Swiftness', 3010: 'Frozen Mallet',
  3020: 'Frozen Heart', 3036: 'Mercurial Scimitar',
  3041: 'Ninja Tabi', 3044: 'Phage', 3046: 'Phantom Dancer',
  3047: 'Serra Drake', 3050: 'Zhonya\'s Hourglass',
  3053: 'Trinity Force', 3056: 'Ohmwrecker',
  3058: 'Mejai\'s', 3065: 'Spirit Visage',
  3067: 'Spear of Shojin', 3068: 'Sunfire Aegis',
  3070: 'Tiamat', 3071: 'Sheen',
  3072: 'Bloodthirster', 3074: 'Rainbow',
  3075: 'Brittle', 3077: 'Tiamat',
  3083: 'Runaans', 3085: 'Runaans',
  3086: 'The Collector', 3087: 'Youmuu\'s Ghostblade',
  3089: ' Ravenous Hydra', 3091: 'Wits End',
  3092: 'Davblade', 3094: 'Bulwark',
  3100: 'Lich Bane', 3101: 'Bork',
  3102: 'Mercurial', 3105: 'Coap',
  3107: 'Mortal Reminder', 3108: 'Executioners',
  3109: 'Guardian Angel', 3110: 'Forbidden Idol',
  3111: 'Mercury\'s', 3112: 'Aether Wisp',
  3113: 'Chalice', 3114: 'Ionias',
  3115: 'Zeal', 3116: 'Phantom Dancer',
  3117: 'Statikk Shiv', 3118: 'Kircheis Shard',
  3119: 'Staff of Flow', 3121: 'Claw of Orb',
  3122: 'Warhammer', 3123: 'Executioners',
  3124: 'Guinsoo', 3128: 'Quickblade',
  3131: 'BoRK', 3132: 'Tiamat',
  3133: 'Caulfields', 3134: 'Warding',
  3135: 'Kindlegem', 3136: 'Sheen',
  3137: 'Dervish', 3138: 'Dmg',
  3139: 'Black Cleaver', 3140: 'Hextech Gunblade',
  3141: 'Stim', 3143: 'Sock',
  3144: 'Phage', 3152: 'Hourglass',
  3158: 'Umbral Glaive',
  3161: 'Frostfang', 3162: 'Morning Frost',
  3165: 'Goredrinker', 3166: 'Cleaver',
  3177: 'Sash', 3178: 'Shard',
  3179: 'Mace', 3180: 'Lens',
  3181: 'Stinger', 3182: 'P的话就',
  3183: 'Void Staff', 3184: 'Cosmic Drive',
  3185: 'Stack', 3186: 'Sparrow',
  3188: 'Edge', 3191: 'Kindlegem',
  3193: 'Aegis', 3194: 'Tiamat',
  3199: 'Peacbloom', 3204: 'Muramana',
  3206: 'Pauldron', 3207: 'Shard',
  3211: 'Spectre', 3222: 'Midnight',
  3224: 'Warmogs',
  3225: 'Protobelt', 3226: 'Rhabarber',
  3227: 'Magi', 3230: 'Odyns',
  3231: 'Chrono', 3241: 'Claw',
  3242: 'Soul', 3243: 'Rabadon',
  3244: 'Sanguine', 3245: 'Skrimisher',
  3248: 'Chainbl', 3251: 'Anguish',
  3252: 'Terminus', 3253: 'Rock',
  3256: 'Riftmaker', 3260: 'Echo',
  3301: 'Health', 3450: 'Petal',
  3504: 'ArPen', 3508: 'Fantasy',
  3512: 'Everfrost', 3513: 'Abyssal Mask',
  3520: 'God',
  3521: 'Duality', 3522: 'Tricks',
  3533: 'Ey', 3534: 'Corp',
  3548: 'Ice',
  3550: 'Heart',
  3553: 'Spine',
  3565: 'Elder',
  3800:'Ironsoul',
  3802: 'Crystal',
  3850: 'Shard',
  3851: 'Ring',
  3855: 'Cloak',
  3860: 'Shield',
  3900: 'Socks',
  3902: 'Puff',
  3903: 'GS',
  3905: 'GS',
  3907: 'GS',
  3908: 'GS',
  3911: 'GS',
  3912: 'GS',
  3913: 'GS',
  3915: 'GS',
  3916: 'GS',
  3917: 'GS',
  3918: 'Gale',
  3922: 'GS',
  3924: 'GS'
};

function getItemName(itemId: number): string {
  return itemMap[itemId] || `Item ${itemId}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const gameName = searchParams.get('gameName');
  const tagLine = searchParams.get('tagLine');
  const region = searchParams.get('region') || 'la1';
  const ally = searchParams.get('ally');
  const enemy = searchParams.get('enemy');

  if (!gameName || !tagLine || !ally) {
    return NextResponse.json({ error: 'Faltan parámetros (gameName, tagLine, ally)' }, { status: 400 });
  }

  if (!RIOT_API_KEY) {
    return NextResponse.json({ error: 'API Key no configurada' }, { status: 500 });
  }

  try {
    const puuid = await getPuuid(gameName, tagLine, region);
    if (!puuid) {
      return NextResponse.json({ error: 'Jugador no encontrado' }, { status: 404 });
    }

    const allyChampionId = getChampionId(ally);
    const enemyChampionId = enemy ? getChampionId(enemy) : null;

    const matchIds = await getMatchHistory(puuid, region, 20);
    if (!matchIds || matchIds.length === 0) {
      return NextResponse.json({ 
        ally, enemy: enemy || 'Todos', 
        builds: [{ items: ['Sin datos'], winrate: 0 }] 
      });
    }

    const matches: any[] = [];
    for (const matchId of matchIds.slice(0, 10)) {
      const matchDetails = await getMatchDetails(matchId, region);
      if (!matchDetails) continue;

      const participants = matchDetails.info.participants;
      const allyPlayer = participants.find((p: any) => p.puuid === puuid);
      if (!allyPlayer) continue;

      const allyTeam = participants.filter((p: any) => p.teamId === allyPlayer.teamId);
      const enemyTeam = participants.filter((p: any) => p.teamId !== allyPlayer.teamId);
      
      const enemyChamp = enemyTeam.find((p: any) => p.teamPosition !== 'JUNGLE');

      matches.push({
        allyChampionId: allyPlayer.championId,
        enemyChampionId: enemyChamp?.championId || null,
        win: allyPlayer.win,
        items: allyPlayer
      });

      await new Promise(resolve => setTimeout(resolve, MIN_REQUEST_INTERVAL));
    }

    const builds = analyzeBuilds(matches, allyChampionId, enemyChampionId ?? null);

    if (builds.length === 0 && enemyChampionId) {
      const buildsNoEnemy = analyzeBuilds(matches, allyChampionId, null);
      return NextResponse.json({
        ally,
        enemy: enemy || 'todos',
        builds: buildsNoEnemy.length > 0 ? buildsNoEnemy : [{ items: ['Sin datos contra ' + enemy], winrate: 0 }],
        note: `Partidas encontradas sin filtro de enemigo`
      });
    }

    return NextResponse.json({
      ally,
      enemy: enemy || 'todos',
      builds: builds.length > 0 ? builds : [{ items: ['Sin datos'], winrate: 0 }],
      matchesAnalyzed: matches.length
    });
  } catch (error) {
    console.error('Matchup error:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}