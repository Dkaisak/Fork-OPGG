# Fork-OPGG

Clone estilo OP.GG para League of Legends - Stats de jugador, historial de partidas y más.

## Características

### Búsqueda de Jugador
- Busca por Riot ID (GameName#TagLine)
- Selector de región (NA, EUW, EUNE, LAN, LAS, BR, KR, JP, OCE, TR, RU)
- **Caché local + server (5 min TTL)**
- **Rate limiting (100 req/2min)**
- Botón X para borrar rápida

### Perfil del Jugador
- Imagen de perfil y nivel
- Tier actual (Iron a Challenger)
- LP, wins/losses, winrate
- Racha de victorias/derrotas

### Estadísticas
- **Por Rol** (TOP, JG, MID, ADC, SUP)
- **Por Campeón**
- **Maestrías**
- **Tendencia** - últimas 10 vs anteriores 10
- **Top Builds** - builds más usadas

### Historial de Partidas
- Últimas 20 partidas rankeadas
- Detalles expandibles: K/D/A, CS/m, Items, Spells

### Interfaz
- Tema oscuro estilo OP.GG
- Diseño responsive

## APIs Utilizadas

### Riot Games API
- `account-v1` - Buscar jugador
- `summoner-v4` - Datos del invocador
- `league-v4` - Rango
- `champion-mastery-v4` - Maestrías
- `match-v5` - Historial

### Endpoints locales
- `/api/player` - Datos completos
- `/api/match` - Detalles
- `/api/matchup` - Matchups
- `/api/player/season-stats` - Stats temporada

## Cómo usar

### Requisitos
- Node.js 18+
- API Key de Riot Games

### Configuración
```bash
cp .env.local.example .env.local
# Editar .env.local con tu API key
```

### Instalar y ejecutar
```bash
npm install
npm run dev
```

### Deploy
```bash
vercel
# o npm run build && npm start
```

## Tecnologías

- **Next.js 16**
- **TypeScript**
- **Tailwind CSS**

## Notas

- Rate limit: 100 requests/2 minutos
- Imágenes de Data Dragon CDN

## Licencia

MIT