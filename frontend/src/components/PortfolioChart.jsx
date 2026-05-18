import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { EyeOff } from 'lucide-react';

const PortfolioChart = ({ dados, ocultarPatrimonio }) => {

  const defaultData = [
    { data: 'Jan', preco: 30 },
    { data: 'Fev', preco: 34.2 },
    { data: 'Mar', preco: 33 },
    { data: 'Abr', preco: 38 },
    { data: 'Mai', preco: 40 },
    { data: 'Jun', preco: 38.45 },
  ];

  const chartData = dados && dados.length > 0 ? dados : defaultData;

  const isHistory = chartData[0]?.preco !== undefined;
  const xKey = isHistory ? "data" : "name";
  const yKey = isHistory ? "preco" : "value";

  // INTERFACE ALTERNATIVA: Se o modo privado estiver ativo, oculta os dados sensíveis do gráfico
  if (ocultarPatrimonio) {
    return (
      <div className="h-[300px] w-full flex flex-col items-center justify-center text-slate-500 text-xs font-semibold tracking-wide bg-[#0d1117]/40 border border-dashed border-slate-800 rounded-[1.5rem] p-6 animate-in fade-in duration-300">
        <EyeOff size={24} className="text-slate-600 mb-2 animate-pulse" />
        <span className="uppercase text-[10px] tracking-widest text-slate-600 mb-1">Dados Protegidos</span>
        <p className="text-slate-500 font-medium text-center normal-case">
          Gráfico e oscilações ocultados no Modo Privado.
        </p>
      </div>
    );
  }

  return (
    <div className="h-[300px] w-full animate-in fade-in duration-300" style={{ minWidth: 0 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00f2aa" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#00f2aa" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" opacity={0.3} />
          
          <XAxis 
            dataKey={xKey} 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 10}}
            dy={10}
            minTickGap={20}
          />
          
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{fill: '#64748b', fontSize: 10}}
            domain={['auto', 'auto']} 
          />
          
          <Tooltip 
            contentStyle={{ backgroundColor: '#161b22', border: '1px solid #1e293b', borderRadius: '12px' }}
            itemStyle={{ color: '#00f2aa', fontWeight: 'bold' }}
            cursor={{ stroke: '#1e293b', strokeWidth: 2 }}
            formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, isHistory ? 'Preço' : 'Valor']}
          />
          
          <Area 
            type="monotone" 
            dataKey={yKey} 
            stroke="#00f2aa" 
            strokeWidth={3}
            fillOpacity={1} 
            fill="url(#colorValue)" 
            dot={{ fill: '#00f2aa', strokeWidth: 2, r: 4, stroke: '#0d1117' }}
            activeDot={{ r: 6, strokeWidth: 0 }}
            animationDuration={1200}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;