import { useEffect, useState } from "react";
import { ArrowUpRight, BarChart3, Bell, Eye, EyeOff, PieChart, RefreshCcw, Search, Sparkles } from "lucide-react";
import api from "../api";
import Alerts from "./Alerts";
import ChatBot from "./ChatBot";
import Comparador from "./Comparador";
import History from "./History";
import PortfolioChart from "./PortfolioChart";
import Profile from "./Profile";
import Simulator from "./Simulator";
import Trends from "./Trends";

const dinheiro = (valor) => Number(valor || 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const Dashboard = ({ telaAtiva, setTelaAtiva, usuario, onUserUpdate }) => {
  const [busca, setBusca] = useState("");
  const [resultadoAcao, setResultadoAcao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dadosHome, setDadosHome] = useState(null);
  const [ocultarPatrimonio, setOcultarPatrimonio] = useState(false);

  useEffect(() => {
    if (telaAtiva !== "home") return;
    api.get("/dashboard/portfolio-geral").then(({ data }) => setDadosHome(data)).catch(() => setDadosHome(null));
  }, [telaAtiva]);

  const buscarAcao = async (ticker) => {
    const alvo = ticker || busca;
    if (!alvo) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/analisar/${alvo}`);
      setResultadoAcao(data);
      setTelaAtiva("analisar");
    } catch (error) {
      alert(error.response?.data?.detail || "Não foi possível consultar o ativo.");
    } finally {
      setLoading(false);
    }
  };

  const saudacao = new Date().getHours() < 12 ? "Bom dia" : new Date().getHours() < 18 ? "Boa tarde" : "Boa noite";
  const mascarar = (valor) => ocultarPatrimonio ? "••••••" : dinheiro(valor);

  const renderHome = () => !dadosHome ? <div className="flex h-72 items-center justify-center text-[#00f2aa]"><RefreshCcw className="mr-3 animate-spin" />Sincronizando seus dados...</div> : <div className="space-y-6">
    <header className="flex justify-between"><div><h2 className="text-3xl font-bold">{saudacao}, <span className="text-[#00f2aa]">{usuario.nome}</span></h2><p className="text-sm capitalize text-slate-500">{new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p></div><button onClick={() => setOcultarPatrimonio(!ocultarPatrimonio)} className="flex h-fit gap-2 rounded-xl border border-slate-800 bg-[#161b22] px-4 py-3 text-xs text-slate-300">{ocultarPatrimonio ? <Eye size={16} /> : <EyeOff size={16} />}Modo privado</button></header>
    <div className="grid gap-6 md:grid-cols-3"><section className="relative overflow-hidden rounded-[2rem] bg-[#00f2aa] p-7 text-[#07111d]"><p className="text-xs font-bold uppercase">Patrimônio Líquido</p><strong className="mt-3 block text-3xl">R$ {mascarar(dadosHome.patrimonioTotal)}</strong><p className="mt-5 text-xs font-bold">Caixa livre: R$ {mascarar(dadosHome.saldoCaixa)}</p><BarChart3 className="absolute -bottom-4 -right-4 opacity-10" size={130} /></section><section className="rounded-[2rem] border border-slate-800 bg-[#161b22] p-7"><p className="text-xs uppercase text-slate-500">Ibovespa hoje</p><strong className="mt-3 block text-3xl">{dadosHome.ibovespaPontos?.toLocaleString("pt-BR") || "--"} pts</strong><p className={dadosHome.ibovespaVariacao >= 0 ? "mt-4 text-[#00f2aa]" : "mt-4 text-red-500"}>{dadosHome.ibovespaVariacao == null ? "Indisponível" : `${dadosHome.ibovespaVariacao > 0 ? "+" : ""}${dadosHome.ibovespaVariacao}%`}</p></section><section className="rounded-[2rem] border border-slate-800 bg-[#161b22] p-7"><p className="text-xs uppercase text-slate-500">Taxa Selic Meta</p><strong className="mt-3 block text-3xl">{dadosHome.selic == null ? "--" : `${dadosHome.selic}%`}</strong><p className="mt-4 text-xs text-slate-500">Fonte: Banco Central do Brasil</p></section></div>
    <div className="grid gap-6 lg:grid-cols-3"><section className="rounded-[2rem] border border-slate-800 bg-[#161b22] p-7 lg:col-span-2"><h3 className="mb-4 flex justify-between text-sm font-bold">Alocação Atual do Portfólio <PieChart className="text-[#00f2aa]" size={18} /></h3><PortfolioChart dados={dadosHome.distribuicao} ocultarPatrimonio={ocultarPatrimonio} /></section><section className="rounded-[2rem] border border-slate-800 bg-[#161b22] p-7"><h3 className="mb-4 text-sm font-bold">Monitoramento rápido</h3>{["PETR4", "VALE3", "ITUB4"].map((ticker) => <button key={ticker} onClick={() => buscarAcao(ticker)} className="mb-3 flex w-full justify-between rounded-xl bg-[#0d1117] p-4 text-sm font-bold">{ticker}<ArrowUpRight className="text-[#00f2aa]" size={17} /></button>)}</section></div>
    <p className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4 text-xs text-amber-300">{dadosHome.alerta}</p>
  </div>;

  const renderAnalyze = () => <div className="space-y-6 pb-12"><h2 className="text-3xl font-bold">Analisar Ações</h2><div className="flex rounded-xl border border-slate-800 bg-[#161b22] p-2"><input value={busca} onChange={(event) => setBusca(event.target.value.toUpperCase())} onKeyDown={(event) => event.key === "Enter" && buscarAcao()} placeholder="Ex: PETR4, AAPL..." className="flex-1 bg-transparent px-4 text-sm outline-none" /><button onClick={() => buscarAcao()} className="rounded-xl bg-[#00f2aa] px-6 py-3 text-xs font-bold text-[#07111d]">{loading ? "Consultando..." : "Realizar análise"}</button></div>{resultadoAcao && <><section className="flex justify-between rounded-[2rem] border border-slate-800 bg-[#161b22] p-8"><div><h3 className="text-4xl font-black">{resultadoAcao.ticker}</h3><p className="text-sm text-slate-500">{resultadoAcao.nomeEmpresa}</p></div><div className="text-right"><strong className="text-4xl">R$ {resultadoAcao.preco}</strong><p className={resultadoAcao.variacao >= 0 ? "text-[#00f2aa]" : "text-red-500"}>{resultadoAcao.variacao > 0 ? "+" : ""}{resultadoAcao.variacao}%</p></div></section><section className="rounded-[2rem] border border-slate-800 bg-[#161b22] p-8"><PortfolioChart dados={resultadoAcao.historico} /></section><section className="flex gap-4 rounded-[2rem] border border-[#00f2aa]/20 bg-[#00f2aa]/5 p-6"><Sparkles className="shrink-0 text-[#00f2aa]" /><div><h4 className="text-xs font-bold uppercase text-[#00f2aa]">Resumo corporativo</h4><p className="mt-3 text-sm leading-relaxed text-slate-300">{resultadoAcao.resumo}</p></div></section></>}</div>;

  const telas = { home: renderHome(), analisar: renderAnalyze(), comparador: <Comparador />, simulador: <Simulator />, tendencias: <Trends />, alertas: <Alerts />, historico: <History />, perfil: <Profile onUserUpdate={onUserUpdate} /> };
  return <div className="flex h-screen flex-1 flex-col overflow-hidden bg-[#0d1117]"><header className="flex shrink-0 items-center justify-between border-b border-slate-800 px-8 py-4"><label className="relative w-96"><Search className="absolute left-3 top-3 text-slate-500" size={18} /><input value={busca} onChange={(event) => setBusca(event.target.value.toUpperCase())} onKeyDown={(event) => event.key === "Enter" && buscarAcao()} className="w-full rounded-xl border border-slate-700 bg-[#1d2a40] py-2.5 pl-10 text-sm outline-none" placeholder="Buscar ações... (Ex: PETR4, AAPL, TSLA)" /></label><div className="flex items-center gap-5"><button onClick={() => setTelaAtiva("alertas")}><Bell className="text-slate-400" size={19} /></button><div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#00f2aa] to-blue-500 font-bold text-[#07111d]">{usuario.nome?.charAt(0)}</div></div></header><main className="flex flex-1 overflow-hidden"><div className="flex-1 overflow-y-auto p-8">{telas[telaAtiva]}</div>{telaAtiva === "analisar" && <aside className="w-[390px] shrink-0 border-l border-slate-800"><ChatBot tickerAtivo={resultadoAcao?.ticker} /></aside>}</main></div>;
};

export default Dashboard;
