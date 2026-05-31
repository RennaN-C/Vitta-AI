import { useEffect, useState } from "react";
import { Brain, RefreshCcw, TrendingDown, TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, PolarAngleAxis, PolarGrid, Radar, RadarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api";

const Trends = () => {
  const [dados, setDados] = useState(null);
  useEffect(() => { api.get("/tendencias").then(({ data }) => setDados(data)); }, []);
  if (!dados) return <div className="flex justify-center py-20 text-[#00f2aa]"><RefreshCcw className="mr-2 animate-spin" />Calculando indicadores reais...</div>;
  return <div className="space-y-6 pb-20">
    <header><h2 className="text-3xl font-bold">Previsão de Tendências</h2><p className="text-sm text-slate-500">Leitura quantitativa do momentum recente do mercado</p></header>
    <div className="grid gap-6 md:grid-cols-3"><section className="rounded-2xl border border-[#00f2aa]/40 bg-[#00f2aa]/5 p-6"><h3 className="flex gap-2 font-bold"><TrendingUp className="text-[#00f2aa]" />Tendência Geral</h3><strong className="mt-3 block text-3xl text-[#00f2aa]">{dados.tendencia}</strong><p className="text-xs text-slate-400">Confiança: {dados.confianca}%</p></section><section className="rounded-2xl border border-slate-700 bg-[#1d2a40] p-6"><p className="text-xs text-slate-400">Índice de Momentum</p><strong className="text-3xl">{dados.indice}</strong></section><section className="rounded-2xl border border-slate-700 bg-[#1d2a40] p-6"><p className="text-xs text-slate-400">Atualização</p><strong className="text-xl">Sob demanda</strong><p className="text-xs text-slate-400">Histórico recente do mercado</p></section></div>
    <section className="rounded-2xl border border-slate-700 bg-[#1d2a40] p-6"><h3 className="mb-4 font-bold">Evolução do Índice de Mercado</h3><div className="h-[240px]"><ResponsiveContainer><LineChart data={dados.evolucao}><CartesianGrid stroke="#263852" strokeDasharray="3 3" /><XAxis dataKey="dia" stroke="#8aa5ca" /><YAxis stroke="#8aa5ca" domain={["auto", "auto"]} /><Tooltip /><Line dataKey="indice" stroke="#00f2aa" strokeWidth={3} /></LineChart></ResponsiveContainer></div></section>
    <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-slate-700 bg-[#1d2a40] p-6"><h3 className="font-bold">Análise por Setor</h3><div className="h-[300px]"><ResponsiveContainer><RadarChart data={dados.setores}><PolarGrid stroke="#62748f" /><PolarAngleAxis dataKey="setor" tick={{ fill: "#9ab4d8", fontSize: 11 }} /><Radar dataKey="score" stroke="#00f2aa" fill="#00f2aa" fillOpacity={0.35} /></RadarChart></ResponsiveContainer></div></section><section className="rounded-2xl border border-slate-700 bg-[#1d2a40] p-6"><h3 className="mb-4 font-bold">Ações em Tendência</h3><div className="space-y-3">{dados.ativos.map((ativo) => { const Icon = ativo.variacao >= 0 ? TrendingUp : TrendingDown; return <div key={ativo.ticker} className="flex justify-between rounded-xl bg-[#080f1e] p-4"><span className="flex gap-3"><Icon className={ativo.variacao >= 0 ? "text-[#00f2aa]" : "text-red-500"} /><span><strong>{ativo.ticker}</strong><small className="block text-slate-400">{ativo.nome}</small></span></span><span className="text-right text-xs">Score: {ativo.score}<strong className={`block ${ativo.variacao >= 0 ? "text-[#00f2aa]" : "text-red-500"}`}>{ativo.variacao > 0 ? "+" : ""}{ativo.variacao}%</strong></span></div>; })}</div></section></div>
    <section className="flex gap-4 rounded-xl border border-[#00f2aa]/30 bg-[#00f2aa]/5 p-6"><Brain className="text-[#00f2aa]" /><div><h4 className="font-bold text-[#00f2aa]">Metodologia</h4><p className="mt-2 text-sm">{dados.metodologia}</p></div></section>
  </div>;
};

export default Trends;
