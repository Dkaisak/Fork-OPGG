# Fork-OPGG

Clone estilo OP.GG para League of Legends - Stats de jugador, historial de partidas y más. con estadísticas de jugador, historial de partidas y más.

## Características

### Búsqueda de Jugador
- Busca por Riot ID (GameName#TagLine)
- Selector de región (NA, EUW, EUNE, LAN, LAS, BR, KR, JP, OCE, TR, RU)
- Caché local para evitar requests duplicados

### Perfil del Jugador
- Imagen de perfil y nivel de invocador
- Tier actual (Iron a Challenger)
- LP, wins/losses, winrate
- Racha de victorias/derrotas
- Gráfico circular de winrate

### Estadísticas
- **Por Rol** (TOP, JG, MID, ADC, SUP) - últimas 20 partidas
- **Por Campeón** - últimas 100 partidas (en sidebar)
- **Maestrías** - nivel y puntos por campeón
- **Tendencia** - últimas 10 vs anteriores 10 (WR%, KDA, CS/m)

### Historial de Partidas
- Últimas 20 partidas rankeadas
- Detalles expandibles por partida:
  - K/D/A
  - CS por minuto
  - Items equipados
  - Spells de invocador
  - Stats del equipo azul y rojo
  - Daño realizado/tomado (barras visuales)

### Interfaz
- Tema oscuro estilo OP.GG
- Sidebar fija izquierda con:
  - Campeones más jugados (10)
  - Roles (TOP, JG, MID, ADC, SUP)
  - Tendencia de rendimiento
- Diseño responsive

## APIs Utilizadas

### Riot Games API
- `account-v1` - Buscar jugador por Riot ID
- `summoner-v4` - Datos del invocador
- `league-v4` - Rango actual
- `champion-mastery-v4` - Maestrías (top 15)
- `match-v5` - Historial de partidas (últimas 50)

### Endpoints locales
- `/api/player` - Datos completos del jugador
- `/api/match` - Detalles de una partida
- `/api/player/season-stats` - Stats de temporada

## Cómo usar

### Requisitos
- Node.js 18+
- API Key de Riot Games (desarrollo o producción)

### Configuración
1. Crear archivo `.env.local`:
```bash
cp .env.local.example .env.local
```

2. Agregar tu API key:
```env
RIOT_API_KEY=RGAPI-tu-api-key-aqui
```

3. Instalar dependencias:
```bash
npm install
```

4. Iniciar servidor:
```bash
npm run dev
```

5. Abrir http://localhost:3000

## Deploy

### Vercel (recomendado)
```bash
npm i -g vercel
vercel
```

### Docker
```bash
docker build -t lol-optimizer .
docker run -p 3000:3000 -e RIOT_API_KEY=tu-api-key lol-optimizer
```

## Estructura del Proyecto

```
lol-optimizer/
├── src/app/
│   ├── api/
│   │   ├── player/          # API de datos del jugador
│   │   ├── match/           # API de detalles de partida
│   │   └── matchup/        # API de matchups
│   ├── components/         # Componentes React
│   │   ├── Sidebar.tsx
│   │   ├── PlayerCard.tsx
│   │   ├── MatchHistory.tsx
│   │   ├── Masteries.tsx
│   │   └── ...
│   ├── page.tsx            # Página principal
│   └── globals.css        # Estilos globales
├── public/
│   └── ranked-emblems/    # Imágenes de rangos
└── package.json
```

## Tecnologías

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Riot Games API** - Datos de League of Legends

## Notas

- Rate limit: 60 requests/2 minutos (puede variar por región)
- Las imágenes de campeones/run son de Data Dragon (CDN público)
- Requiere API key de desarrollo o producción de Riot Games

## Licencia

MIT