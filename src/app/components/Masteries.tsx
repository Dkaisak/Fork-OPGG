'use client';

interface MasteriesProps {
  masteries: any[];
}

export default function Masteries({ masteries }: MasteriesProps) {
  if (!masteries || masteries.length === 0) return null;

  const formatPoints = (pts: number) => {
    if (pts >= 1000000) return (pts / 1000000).toFixed(1) + 'M';
    if (pts >= 1000) return (pts / 1000).toFixed(1) + 'K';
    return pts;
  };

  return (
    <div className="op-card p-4 mt-6">
      <h3 className="text-base font-semibold mb-3" style={{ color: '#8b949e' }}>MAESTRÍAS</h3>
      <div className="flex gap-2 w-full">
        {masteries.slice(0, 5).map((m, idx) => (
          <div key={idx} className="flex-1 flex flex-col items-center p-2 rounded min-w-0" style={{ background: '#1a2d42' }}>
            <img src={m.championImage} alt={m.championName} className="w-12 h-12 rounded" />
            <p className="font-medium text-xs mt-1 truncate" style={{ color: '#f0f6fc' }}>{m.championName}</p>
            <div className="flex flex-col items-center">
              <span className="text-xs font-bold" style={{ color: '#fbbf24' }}>Nivel {m.level}</span>
              <span className="text-xs" style={{ color: '#6e7681' }}>{formatPoints(m.points || 0)} pts</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}