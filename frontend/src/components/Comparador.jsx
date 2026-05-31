import { useEffect, useState } from "react";
import { ChevronDown, RefreshCcw, Sparkles, TrendingDown, TrendingUp } from "lucide-react";
import api from "../api";
import CompareChart from "./CompareChart";

const opcoes = ["PETR4", "VALE3", "ITUB4", "AAPL", "MGLU3"];

const Variacao = ({ valor }) => {
  const positiva = valor >= 0;
  const Icon = positiva ? TrendingUp : TrendingDown;
  return <span className={`flex items-center gap-1 text-sm font-bold ${positiva ? "text-[#00f2aa]" : "text-red-500"}`}><Icon size={16} />{valor > 0 ? "+" : ""}{valor}%</span>;
};

const Comparador = () => {
  const [ticker1, setTicker1] = useState("PETR4");
  const [ticker2, setTicker2] = useState("VALE3");
  const [dados, setDados] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.post("/comparar", { ticker1, ticker2 }).then(({ data }) => setDados(data)).finally(() => setLoading(false));
  }, [ticker1, ticker2]);

  const atualizarTicker = (setter, valor) => {
    setLoading(true);
    setter(valor);
  };

  return <div className="space-y-8 pb-20">
    <header><h2 className="text-3xl font-bold">Comparador Inteligente</h2><p className="text-sm text-slate-500">Compare ativos lado a lado com métricas históricas reais</p></header>
    <div className="grid gap-6 md:grid-cols-2">{[[ticker1, setTicker1, "Ação 1"], [ticker2, setTicker2, "Ação 2"]].map(([value, setter, label]) => <label key={label} className="rounded-2xl border border-slate-800 bg-[#161b22] p-6 text-xs font-bold uppercase text-slate-500">{label}<span className="relative mt-3 block"><select value={value} onChange={(event) => atualizarTicker(setter, event.target.value)} className="w-full appearance-none rounded-xl border border-slate-700 bg-[#0d1117] p-4 text-sm text-white">{opcoes.map((ticker) => <option key={ticker}>{ticker}</option>)}</select><ChevronDown size={16} className="pointer-events-none absolute right-4 top-4" /></span></label>)}</div>
    {loading && <p className="flex justify-center py-16 text-[#00f2aa]"><RefreshCcw className="mr-2 animate-spin" />Sincronizando mercado...</p>}
    {!loading && dados && <><div className="grid gap-6 md:grid-cols-2">{[dados.ativo1, dados.ativo2].map((ativo) => <section key={ativo.ticker} className="rounded-[2rem] border border-slate-800 bg-[#161b22] p-8"><div className="flex justify-between"><div><h3 className="text-3xl font-black">{ativo.ticker}</h3><p className="text-xs text-slate-500">{ativo.nomeEmpresa}</p></div><Variacao valor={ativo.variacao} /></div><p className="mt-6 text-4xl font-black">R$ {ativo.preco}</p></section>)}</div>
    <section className="rounded-[2rem] border border-slate-800 bg-[#161b22] p-8"><h4 className="mb-6 font-bold">Comparação Visual</h4><CompareChart dados={dados.historico} ticker1={dados.ativo1.ticker} ticker2={dados.ativo2.ticker} /></section>
    <section className="flex gap-4 rounded-2xl border border-[#00f2aa]/20 bg-[#00f2aa]/5 p-6"><Sparkles className="text-[#00f2aa]" /><p className="text-sm text-slate-300">{dados.resumo}</p></section>
    <div className="grid gap-4 md:grid-cols-3">{[["Melhor dividendo", dados.melhorDividendo], ["Menor risco histórico", dados.menorRisco], ["Maior crescimento", dados.maiorCrescimento]].map(([label, value]) => <section key={label} className="rounded-xl border border-slate-800 bg-[#161b22] p-5"><p className="text-[10px] uppercase text-slate-500">{label}</p><strong className="mt-2 block text-xl text-[#00f2aa]">{value}</strong></section>)}</div></>}
  </div>;
};

export default Comparador;
