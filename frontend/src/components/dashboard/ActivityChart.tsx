import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface ChartData {
  date: string;
  in: number;
  out: number;
}

interface ActivityChartProps {
  data: ChartData[];
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data }) => {
  return (
    <div className="w-full h-full min-h-[260px] flex flex-col bg-surface border border-border rounded-sm">
      <div className="px-4 py-2 border-b border-border">
        <h2 className="text-[11px] font-mono font-bold text-text-muted uppercase tracking-wider">
          AKTIVITAS MUTASI (7 HARI)
        </h2>
      </div>
      
      <div className="flex-1 p-4">
        {data.length === 0 ? (
          <div className="w-full h-full min-h-[200px] border border-dashed border-border flex items-center justify-center text-xs text-text-muted font-mono uppercase">
            Belum ada data
          </div>
        ) : (
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 500, fill: '#78716C', fontFamily: 'var(--font-geist-sans), sans-serif' }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fontWeight: 500, fill: '#78716C', fontFamily: 'var(--font-geist-sans), sans-serif' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1C1917', 
                    borderColor: '#44403C', 
                    borderRadius: '3px',
                    fontFamily: 'var(--font-geist-mono), monospace',
                    fontSize: '11px',
                    color: '#FAFAF9'
                  }}
                  itemStyle={{ fontSize: '11px' }}
                  cursor={{ stroke: 'var(--border-strong)' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="in" 
                  name="INBOUND" 
                  stroke="#EA580C" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#EA580C', strokeWidth: 0 }} 
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="out" 
                  name="OUTBOUND" 
                  stroke="#0284C7" 
                  strokeWidth={2} 
                  dot={{ r: 3, fill: '#0284C7', strokeWidth: 0 }} 
                  activeDot={{ r: 5, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
};
