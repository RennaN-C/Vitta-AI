import { useState } from "react";
import { Brain, TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import api from "../api";

const ativos = ["PETR4", "VALE3", "ITUB4", "AAPL", "MGLU3"];
const dinheiro = (valor) => Number(valor || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

const Simulator = () => {
  const [ticker, setTicker] = useState("PETR4");
  const [valor, setValor] = useState(10000);
  const [meses, setMeses] = useState(24);
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");

  const simular = async () => {
    setErro("");
    try {
      const { data } = await api.post("/simulador", { ticker, valor_inicial: Number(valor), meses: Number(meses) });
      setResultado(data);
    } catch (error) {
      setErro(error.response?.data?.detail || "Não foi possível calcular a simulação.");
    }
  };

  return <div className="space-y-6 pb-20">
    <header><h2 className="text-3xl font-bold">Simulador de Investimento</h2><p className="text-sm text-slate-500">Simule o desempenho com base no histórico real do ativo</p></header>
    <div className="grid gap-6 lg:grid-cols-3">
      <section className="rounded-2xl border border-slate-800 bg-[#1d2a40] p-6">
        <h3 className="mb-5 font-bold">Parâmetros</h3>
        <label className="mb-4 block text-xs text-slate-400">Ação<select value={ticker} onChange={(event) => setTicker(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-[#080f1e] p-4 text-sm text-white">{ativos.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="mb-4 block text-xs text-slate-400">Valor Inicial<input type="number" min="1" value={valor} onChange={(event) => setValor(event.target.value)} className="mt-2 w-full rounded-xl border border-slate-700 bg-[#080f1e] p-4 text-sm text-white" /></label>
        <label className="block text-xs text-slate-400">Período: <strong className="text-[#00f2aa]">{meses} meses</strong><input type="range" min="6" max="60" step="3" value={meses} onChange={(event) => setMeses(event.target.value)} className="mt-4 w-full accent-[#00f2aa]" /></label>
        <button onClick={simular} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-[#00e6ad] py-4 text-sm font-bold text-[#07111d]"><TrendingUp size={17} />Simular Investimento</button>
      </section>
      <section className="rounded-2xl border border-slate-800 bg-[#1d2a40] p-6 lg:col-span-2">
        <h3 className="mb-4 font-bold">Evolução do Investimento</h3>
        {resultado ? <div className="h-[330px]"><ResponsiveContainer><AreaChart data={resultado.evolucao}><defs><linearGradient id="simFill"><stop stopColor="#00f2aa" stopOpacity={0.35} /><stop offset="100%" stopColor="#00f2aa" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#263852" strokeDasharray="3 3" /><XAxis dataKey="mes" stroke="#8aa5ca" /><YAxis stroke="#8aa5ca" /><Tooltip formatter={(value) => dinheiro(value)} /><Area dataKey="valor" stroke="#00f2aa" strokeWidth={3} fill="url(#simFill)" /></AreaChart></ResponsiveContainer></div> : <div className="flex h-[330px] items-center justify-center text-sm text-slate-500">Configure os parâmetros e inicie a simulação.</div>}
      </section>
    </div>
    {erro && <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-300">{erro}</p>}
    {resultado && <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-3">{[["Valor Final Estimado", dinheiro(resultado.valorFinal)], ["Lucro", dinheiro(resultado.lucro)], ["Rentabilidade", `${resultado.rentabilidade > 0 ? "+" : ""}${resultado.rentabilidade}%`]].map(([label, value]) => <section key={label} className="rounded-xl border border-slate-700 bg-[#1d2a40] p-5"><p className="text-xs text-slate-400">{label}</p><strong className="mt-2 block text-2xl text-[#00f2aa]">{value}</strong></section>)}</div>
      <div className="space-y-5 lg:col-span-2"><section className="flex gap-4 rounded-xl border border-[#00f2aa]/30 bg-[#00f2aa]/5 p-6"><Brain className="text-[#00f2aa]" /><div><h4 className="font-bold text-[#00f2aa]">Leitura da Simulação</h4><p className="mt-2 text-sm text-slate-200">O cálculo replica a variação histórica de {resultado.ticker} no período selecionado. {resultado.aviso}</p></div></section><section className="rounded-xl border border-slate-700 bg-[#1d2a40] p-6"><h4 className="mb-4 font-bold">Detalhamento de Performance</h4><div className="grid gap-3 md:grid-cols-2">{[["Retorno mensal médio", resultado.retornoMensalMedio], ["Retorno anual estimado", resultado.retornoAnualEstimado], ["Melhor mês", resultado.melhorMes], ["Pior mês", resultado.piorMes]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#080f1e] p-4"><p className="text-xs text-slate-400">{label}</p><strong className={value >= 0 ? "text-[#00f2aa]" : "text-red-500"}>{value > 0 ? "+" : ""}{value}%</strong></div>)}</div></section></div>
    </div>}
  </div>;
};

export default Simulator;
