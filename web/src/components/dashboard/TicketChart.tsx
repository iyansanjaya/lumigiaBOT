'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { TicketStats } from '@/types/ticket';

const COLORS = ['#10B981', '#F59E0B', '#6B7280'];

export function TicketChart({ stats }: { stats: TicketStats }) {
  const data = [
    { name: 'Terbuka', value: stats.open },
    { name: 'Diklaim', value: stats.claimed },
    { name: 'Ditutup', value: stats.closed },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-foreground-muted">
        Belum ada data tiket
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={5}
          dataKey="value"
        >
          {data.map((_, index) => (
            <Cell key={index} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: '#12121a',
            border: '1px solid #1e293b',
            borderRadius: '8px',
            color: '#e2e8f0',
          }}
        />
        <Legend
          formatter={(value) => <span className="text-foreground-muted text-sm">{value}</span>}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
