import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

const CompareChart = ({ dados, ticker1, ticker2 }) => {
  return (
   
    <div style={{ width: '100%', height: '350px', display: 'block', minWidth: '100%' }}>
      <ResponsiveContainer width="99%" height="100%">
        <AreaChart 
          data={dados} 
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="color1" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f2aa" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00f2aa" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="color2" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
          <XAxis 
            dataKey="data" 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 10}}
            minTickGap={30}
          />
          <YAxis hide={true} domain={['auto', 'auto']} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #1e293b', borderRadius: '12px' }}
            itemStyle={{ fontSize: '12px', fontWeight: 'bold' }}
          />
          <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
          <Area 
            type="monotone" 
            dataKey="valor1" 
            name={ticker1} 
            stroke="#00f2aa" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#color1)" 
            animationDuration={1000}
          />
          <Area 
            type="monotone" 
            dataKey="valor2" 
            name={ticker2} 
            stroke="#3b82f6" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#color2)" 
            animationDuration={1000}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CompareChart;