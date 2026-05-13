import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { time: 'Jan', value: 30 },
  { time: 'Fev', value: 34.2 },
  { time: 'Mar', value: 33 },
  { time: 'Abr', value: 38 },
  { time: 'Mai', value: 40 },
  { time: 'Jun', value: 38.45 },
];

const PortfolioChart = () => {
  return (
    <div className="h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f2aa" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00f2aa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
          <XAxis 
            dataKey="time" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 10}}
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 10}}
            domain={[0, 40]}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #1e293b', borderRadius: '12px' }}
            itemStyle={{ color: '#00f2aa', fontWeight: 'bold' }}
            cursor={{ stroke: '#1e293b', strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="#00f2aa" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            dot={{ fill: '#00f2aa', strokeWidth: 2, r: 4, stroke: '#0d1117' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;