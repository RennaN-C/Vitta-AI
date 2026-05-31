import { EyeOff } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const PortfolioChart = ({ dados = [], ocultarPatrimonio }) => {
  if (ocultarPatrimonio) return <div className="flex h-[300px] items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-800 text-xs text-slate-500"><EyeOff size={20} />Dados protegidos no modo privado.</div>;
  if (!dados.length) return <div className="flex h-[300px] items-center justify-center rounded-2xl border border-dashed border-slate-800 text-xs text-slate-500">Ainda não há dados para exibir.</div>;
  const isHistory = dados[0]?.preco !== undefined;
  const xKey = isHistory ? "data" : "name";
  const yKey = isHistory ? "preco" : "value";
  return <div className="h-[300px] w-full"><ResponsiveContainer width="100%" height="100%"><AreaChart data={dados} margin={{ top: 10, right: 10, left: -20 }}><defs><linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#00f2aa" stopOpacity={0.3} /><stop offset="95%" stopColor="#00f2aa" stopOpacity={0} /></linearGradient></defs><CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1e293b" /><XAxis dataKey={xKey} tick={{ fill: "#64748b", fontSize: 10 }} /><YAxis tick={{ fill: "#64748b", fontSize: 10 }} /><Tooltip formatter={(value) => [`R$ ${Number(value).toFixed(2)}`, isHistory ? "Preço" : "Valor"]} contentStyle={{ background: "#161b22", border: "1px solid #1e293b" }} /><Area type="monotone" dataKey={yKey} stroke="#00f2aa" fill="url(#colorValue)" strokeWidth={3} /></AreaChart></ResponsiveContainer></div>;
};

export default PortfolioChart;
