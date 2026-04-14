'use client';

interface RoleStatsProps {
  roleStats: any[];
}

const roleColors: Record<string, string> = {
  MIDDLE: '#f59e0b',
  TOP: '#3b82f6',
  BOTTOM: '#ef4444',
  JUNGLE: '#22c55e',
  UTILITY: '#8b5cf6',
};

const roleLabels: Record<string, string> = {
  MIDDLE: 'MID',
  BOTTOM: 'ADC',
  JUNGLE: 'JG',
  TOP: 'TOP',
  UTILITY: 'SUP',
};

export default function RoleStats({ roleStats }: RoleStatsProps) {
  if (!roleStats || roleStats.length === 0) return null;

  return (
    <div className="mt-4 p-4 rounded-lg" style={{ background: '#1a2d42' }}>
      <h3 className="text-base font-semibold mb-1" style={{ color: '#8b949e' }}>ESTADÍSTICAS POR ROL</h3>
      <p className="text-xs mb-3" style={{ color: '#6e7681' }}>(últimas 20 partidas)</p>
      <div className="flex gap-2 w-full">
        {roleStats.map((r, idx) => (
          <div key={idx} className="flex-1 text-center p-2 rounded min-w-0" style={{ background: 'rgba(255,255,255,0.05)' }}>
            <p className="text-lg font-bold" style={{ color: roleColors[r.role] || '#f0f6fc' }}>
              {roleLabels[r.role] || r.role}
            </p>
            <p className="text-sm font-medium truncate" style={{ color: '#f0f6fc' }}>{r.wins}W - {r.losses}L</p>
            <p className="text-xs" style={{ color: r.winrate >= 50 ? '#4ade80' : '#f87171' }}>{r.winrate}% WR</p>
          </div>
        ))}
      </div>
    </div>
  );
}