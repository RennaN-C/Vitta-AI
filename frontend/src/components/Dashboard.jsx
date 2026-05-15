import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  Search,
  Bell,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Sparkles,
  RefreshCcw,
  ArrowUpRight,
  ChevronRight,
  BarChart3,
  PieChart,
} from "lucide-react";
import PortfolioChart from "./PortfolioChart";
import ChatBot from "./ChatBot";
import Comparador from "./Comparador";

const API_URL = "http://localhost:8000";

const Dashboard = ({ telaAtiva, setTelaAtiva, usuario }) => {
  const [busca, setBusca] = useState("");
  const [resultadoAcao, setResultadoAcao] = useState(null);
  const [loading, setLoading] = useState(false);

  // NOVOS ESTADOS: Controlam o consumo de dados reais na Home
  const [dadosHome, setDadosHome] = useState(null);
  const [loadingHome, setLoadingHome] = useState(true);

  const obterSaudacao = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Bom dia";
    if (hora >= 12 && hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  const dataHoje = new Date().toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  
  useEffect(() => {
    const carregarDadosDashboard = async () => {
      try {
        const response = await axios.get(
          `${API_URL}/dashboard/portfolio-geral`,
        );
        setDadosHome(response.data);
      } catch (err) {
        console.error("Erro ao sincronizar painel principal:", err);
      } finally {
        setLoadingHome(false);
      }
    };

    if (telaAtiva === "home") {
      carregarDadosDashboard();
    }
  }, [telaAtiva]);

  const buscarAcao = async (ticker) => {
    const alvo = ticker || busca;
    if (!alvo) return;
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/analisar/${alvo}`);
      setResultadoAcao({
        ...res.data,
        volumeFormatado: (res.data.volume / 1000000).toFixed(0) + "M",
      });
      if (setTelaAtiva) setTelaAtiva("analisar");
    } catch (err) {
      alert("Ativo não encontrado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#0d1117] flex flex-col h-screen overflow-hidden text-white">
      {/* HEADER GLOBAL */}
      <header className="flex items-center justify-between px-10 py-4 border-b border-slate-800 bg-[#0d1117] shrink-0">
        <div className="relative w-96 group">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00f2aa]"
            size={18}
          />
          <input
            className="w-full bg-[#161b22] border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white outline-none focus:border-[#00f2aa]/50 transition-all"
            placeholder="Buscar ativos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && buscarAcao()}
          />
        </div>
        <div className="flex items-center gap-6">
          <Bell
            className="text-slate-500 hover:text-white cursor-pointer transition-colors"
            size={20}
          />
          <div className="flex items-center gap-3 bg-[#161b22] border border-slate-800 p-1.5 pr-4 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-[#00f2aa]/10 flex items-center justify-center text-[#00f2aa] font-bold text-xs border border-[#00f2aa]/20">
              {usuario?.nome?.charAt(0) || "U"}
            </div>
            <span className="text-white text-xs font-medium">
              {usuario?.nome || "Operador"}
            </span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
          {/* TELA HOME COMPLETA E TOTALMENTE FUNCIONAL */}
          {telaAtiva === "home" && (
            <div className="space-y-8 animate-in fade-in duration-500 pb-10">
              {/* SAUDAÇÃO E HEADER INTERNO */}
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">
                    {obterSaudacao()},{" "}
                    <span className="text-[#00f2aa]">
                      {usuario?.nome || "Operador"}!
                    </span>
                  </h2>
                  <p className="text-slate-500 text-sm mt-1 capitalize">
                    {dataHoje}
                  </p>
                </div>
                <div className="bg-[#00f2aa]/10 border border-[#00f2aa]/20 px-4 py-2 rounded-xl flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-[#00f2aa] animate-pulse"></div>
                  <span className="text-[#00f2aa] text-xs font-bold tracking-wide uppercase">
                    Modo Pro Ativo
                  </span>
                </div>
              </div>

              {loadingHome ? (
                <div className="h-96 flex items-center justify-center text-[#00f2aa] animate-pulse font-medium text-sm tracking-wide">
                  <RefreshCcw className="animate-spin mr-3" size={18} />{" "}
                  Sincronizando carteira em tempo real com a B3...
                </div>
              ) : (
                <>
                  {/* GRID DE CARDS DINÂMICOS */}
                  <div className="grid grid-cols-3 gap-6">
                    {/* CARD 1: PATRIMÔNIO REAL DO BACKEND */}
                    <div className="bg-[#00f2aa] p-8 rounded-[2.5rem] shadow-xl shadow-[#00f2aa]/5 flex flex-col justify-between h-48 relative overflow-hidden group">
                      <div className="z-10">
                        <p className="text-[#0d1117] font-bold text-[10px] uppercase tracking-widest mb-1 opacity-70">
                          Patrimônio Líquido
                        </p>
                        <h3 className="text-[#0d1117] text-4xl font-black tracking-tighter">
                          R${" "}
                          {dadosHome?.patrimonioTotal.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </h3>
                        <p className="text-[#0d1117] text-xs mt-4 font-bold flex items-center gap-1 bg-[#0d1117]/10 w-fit px-3 py-1 rounded-full">
                          Caixa Livre: R${" "}
                          {dadosHome?.saldoCaixa.toLocaleString("pt-BR", {
                            minimumFractionDigits: 2,
                          })}
                        </p>
                      </div>
                      <BarChart3
                        className="absolute -right-4 -bottom-4 text-[#0d1117] opacity-10"
                        size={140}
                      />
                    </div>

                    {/* CARD 2: IBOVESPA EM TEMPO REAL */}
                    <div className="bg-[#161b22] border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between h-48">
                      <div>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">
                          IBOVESPA Hoje
                        </p>
                        <h3 className="text-white text-3xl font-black tracking-tighter">
                          {dadosHome?.ibovespaPontos.toLocaleString("pt-BR")}{" "}
                          <span className="text-xs text-slate-500 font-medium">
                            pts
                          </span>
                        </h3>
                      </div>
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-sm font-bold flex items-center gap-1 ${dadosHome?.ibovespaVariacao >= 0 ? "text-[#00f2aa]" : "text-red-500"}`}
                        >
                          {dadosHome?.ibovespaVariacao >= 0 ? (
                            <TrendingUp size={16} />
                          ) : (
                            <TrendingDown size={16} />
                          )}
                          {dadosHome?.ibovespaVariacao >= 0
                            ? `+${dadosHome?.ibovespaVariacao}`
                            : dadosHome?.ibovespaVariacao}
                          %
                        </span>
                      </div>
                    </div>

                    {/* CARD 3: TAXA SELIC META */}
                    <div className="bg-[#161b22] border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between h-48">
                      <div>
                        <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">
                          Taxa SELIC
                        </p>
                        <h3 className="text-white text-3xl font-black tracking-tighter">
                          10.50%
                        </h3>
                      </div>
                      <span className="text-slate-500 text-xs font-medium">
                        Meta Copom Estabilizada
                      </span>
                    </div>
                  </div>

                  {/* SEÇÃO CENTRAL SPLIT: PIECHART DINÂMICO + FAVORITOS */}
                  <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-between overflow-hidden">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-white font-bold text-sm">
                            Alocação Atual do Portfólio
                          </h3>
                          <p className="text-slate-500 text-xs mt-0.5">
                            Distribuição ponderada de ativos em custódia
                          </p>
                        </div>
                        <PieChart size={18} className="text-[#00f2aa]" />
                      </div>

                      {}
                      <div
                        className="w-full h-64 block"
                        style={{ minWidth: 0 }}
                      >
                        {dadosHome && dadosHome.distribuicao ? (
                          <PortfolioChart dados={dadosHome.distribuicao} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600 text-xs italic">
                            Aguardando dimensões do contêiner...
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-8 flex flex-col justify-between">
                      <div>
                        <h3 className="text-white font-bold text-sm mb-6">
                          Monitoramento Rápido
                        </h3>
                        <div className="space-y-3">
                          {["PETR4", "VALE3", "ITUB4"].map((ticker) => (
                            <div
                              key={ticker}
                              onClick={() => buscarAcao(ticker)}
                              className="flex items-center justify-between p-4 bg-[#0d1117]/50 rounded-2xl border border-slate-800/50 hover:border-[#00f2aa]/30 cursor-pointer transition-all group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-[#161b22] rounded-xl flex items-center justify-center text-white font-bold text-xs border border-slate-800 group-hover:border-[#00f2aa]/20">
                                  {ticker.slice(0, 2)}
                                </div>
                                <div>
                                  <p className="text-white font-bold text-sm">
                                    {ticker}
                                  </p>
                                  <p className="text-slate-500 text-[10px] font-medium uppercase">
                                    Ordem Corrente
                                  </p>
                                </div>
                              </div>
                              <ArrowUpRight
                                size={16}
                                className="text-slate-600 group-hover:text-[#00f2aa] transition-colors"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* BARRA DE ALERTA DINÂMICA */}
                  <div
                    className={`p-4 rounded-2xl flex items-center gap-3 border ${dadosHome?.ibovespaVariacao < -1.0 ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-amber-500/10 border-amber-500/20 text-amber-500"}`}
                  >
                    <div
                      className={`w-2 h-2 rounded-full ${dadosHome?.ibovespaVariacao < -1.0 ? "bg-red-500" : "bg-amber-500"}`}
                    ></div>
                    <p className="text-xs font-semibold">
                      <span className="font-bold uppercase mr-1">
                        [Radar Vitta AI]:
                      </span>
                      {dadosHome?.alerta}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}

          {/* TELA ANALISAR AÇÕES */}
          {telaAtiva === "analisar" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 pb-10">
              <header>
                <h2 className="text-2xl font-bold text-white tracking-tight">
                  Analisar Ações
                </h2>
              </header>

              <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-2 flex gap-2">
                <input
                  className="flex-1 bg-transparent px-4 text-white outline-none font-bold text-sm"
                  placeholder="EX: PETR4, AAPL..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value.toUpperCase())}
                />
                <button
                  onClick={() => buscarAcao()}
                  className="bg-[#00f2aa] text-[#0d1117] px-8 py-3 rounded-xl font-bold text-xs uppercase"
                >
                  {loading ? "Analisando..." : "Realizar Análise"}
                </button>
              </div>

              {resultadoAcao && (
                <div className="space-y-6">
                  <div className="bg-[#161b22] border border-slate-800 p-8 rounded-[2.5rem] flex justify-between items-center">
                    <div>
                      <h3 className="text-white text-4xl font-black tracking-tighter">
                        {resultadoAcao.ticker}
                      </h3>
                      <p className="text-slate-500 text-sm font-medium">
                        {resultadoAcao.nomeEmpresa}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-white text-4xl font-black tracking-tighter">
                        R$ {resultadoAcao.preco}
                      </div>
                      <div
                        className={`text-sm font-bold flex items-center justify-end gap-1 ${resultadoAcao.variacao >= 0 ? "text-[#00f2aa]" : "text-red-500"}`}
                      >
                        {resultadoAcao.variacao >= 0 ? (
                          <TrendingUp size={16} />
                        ) : (
                          <TrendingDown size={16} />
                        )}
                        {resultadoAcao.variacao >= 0
                          ? `+${resultadoAcao.variacao}`
                          : resultadoAcao.variacao}
                        %
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-8">
                    <PortfolioChart dados={resultadoAcao.historico} />
                  </div>

                  <div className="bg-gradient-to-br from-[#00f2aa]/10 to-transparent border border-[#00f2aa]/20 p-8 rounded-[2.5rem] flex gap-6">
                    <Sparkles className="text-[#00f2aa] shrink-0" size={28} />
                    <div>
                      <h5 className="text-[#00f2aa] font-bold text-xs uppercase mb-3 tracking-widest">
                        IA Resumo Estratégico
                      </h5>
                      <p className="text-slate-300 text-sm leading-relaxed font-medium">
                        {resultadoAcao.resumo}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TELA COMPARADOR */}
          {telaAtiva === "comparador" && <Comparador />}
        </div>

        {/* CHATBOT LADO DIREITO */}
        {telaAtiva === "analisar" && (
          <div className="w-[420px] border-l border-slate-800 bg-[#0d1117] h-full flex flex-col shrink-0 overflow-hidden">
            <ChatBot isFixed={true} tickerAtivo={resultadoAcao?.ticker} />
          </div>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
