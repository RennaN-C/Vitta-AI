import { useEffect, useState } from "react";
import { Activity, Calculator, GitCompare, History as HistoryIcon } from "lucide-react";
import api from "../api";

const icones = { analysis: Activity, simulation: Calculator, comparison: GitCompare };
const filtros = [["all", "Todos"], ["simulation", "Simulações"], ["analysis", "Análises"], ["comparison", "Comparações"]];

const History = () => {
  const [dados, setDados] = useState({ estatisticas: {}, atividades: [], maisAnalisadas: [] });
  const [filtro, setFiltro] = useState("all");
  useEffect(() => { api.get("/historico").then(({ data }) => setDados(data)); }, []);
  const atividades = dados.atividades.filter((item) => filtro === "all" || item.tipo === filtro);
  return <div className="space-y-6 pb-20"><header><h2 className="text-3xl font-bold">Histórico de Atividades</h2><p className="text-sm text-slate-500">Todas as suas análises, simulações e comparações persistidas</p></header><div className="grid gap-6 md:grid-cols-3">{[["Total de Análises", dados.estatisticas.analises, Activity], ["Simulações", dados.estatisticas.simulacoes, Calculator], ["Comparações", dados.estatisticas.comparacoes, GitCompare]].map(([label, value, Icon]) => <section key={label} className="rounded-2xl border border-slate-700 bg-[#1d2a40] p-6"><p className="flex gap-3 text-sm text-slate-400"><Icon className="text-[#00f2aa]" />{label}</p><strong className="mt-3 block text-3xl">{value || 0}</strong></section>)}</div><div className="flex gap-2">{filtros.map(([id, label]) => <button key={id} onClick={() => setFiltro(id)} className={`rounded-xl px-4 py-3 text-xs font-bold ${filtro === id ? "bg-[#00e6ad] text-[#07111d]" : "bg-[#1d2a40]"}`}>{label}</button>)}</div><section className="rounded-2xl border border-slate-700 bg-[#1d2a40] p-6"><h3 className="mb-4 font-bold">Timeline de Atividades</h3><div className="space-y-3">{atividades.length ? atividades.map((item) => { const Icon = icones[item.tipo] || HistoryIcon; return <div key={item.id} className="flex gap-4"><div className="rounded-xl bg-[#00f2aa]/10 p-4 text-[#00f2aa]"><Icon size={20} /></div><div className="flex-1 rounded-xl bg-[#080f1e] p-4 text-sm"><div className="flex justify-between gap-3"><strong>{item.titulo}</strong><small className="text-slate-400">{new Date(item.criadoEm).toLocaleString("pt-BR")}</small></div><p className="mt-1 text-xs text-blue-300">{item.descricao}</p></div></div>; }) : <p className="text-sm text-slate-500">Nenhuma atividade registrada ainda.</p>}</div></section><section className="rounded-2xl border border-slate-700 bg-[#1d2a40] p-6"><h3 className="mb-4 font-bold">Ações Mais Analisadas</h3><div className="grid gap-3 md:grid-cols-4">{dados.maisAnalisadas.map((item, index) => <div key={item.ticker} className="rounded-xl bg-[#080f1e] p-4"><strong>{item.ticker}</strong><span className="float-right text-[#00f2aa]">#{index + 1}</span><small className="block text-blue-300">{item.total} análises</small></div>)}</div></section></div>;
};

export default History;
