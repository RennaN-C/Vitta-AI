import React, { useState } from "react";
import axios from "axios";
import { 
  Search, Bell, TrendingUp, DollarSign, 
  Activity, Sparkles, RefreshCcw, ArrowUpRight,
  ChevronRight, BarChart3, PieChart
} from "lucide-react";
import PortfolioChart from "./PortfolioChart";
import ChatBot from "./ChatBot";
import Comparador from "./Comparador"; 

const API_URL = "http://localhost:8000";

const Dashboard = ({ telaAtiva, setTelaAtiva, usuario }) => {
  const [busca, setBusca] = useState("");
  const [resultadoAcao, setResultadoAcao] = useState(null);
  const [loading, setLoading] = useState(false);

  const obterSaudacao = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Bom dia";
    if (hora >= 12 && hora < 18) return "Boa tarde";
    return "Boa noite";
  };

  const dataHoje = new Date().toLocaleDateString('pt-BR', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long',
    year: 'numeric'
  });

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
      {/* HEADER */}
      <header className="flex items-center justify-between px-10 py-4 border-b border-slate-800 bg-[#0d1117] shrink-0">
        <div className="relative w-96 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#00f2aa]" size={18} />
          <input 
            className="w-full bg-[#161b22] border border-slate-800 rounded-xl py-2.5 pl-12 pr-4 text-sm text-white outline-none focus:border-[#00f2aa]/50 transition-all" 
            placeholder="Buscar ativos..." 
            value={busca}
            onChange={(e) => setBusca(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && buscarAcao()}
          />
        </div>
        <div className="flex items-center gap-6">
          <Bell className="text-slate-500 hover:text-white cursor-pointer transition-colors" size={20} />
          <div className="flex items-center gap-3 bg-[#161b22] border border-slate-800 p-1.5 pr-4 rounded-xl">
            <div className="w-8 h-8 rounded-lg bg-[#00f2aa]/10 flex items-center justify-center text-[#00f2aa] font-bold text-xs border border-[#00f2aa]/20">
              {usuario?.nome?.charAt(0) || "U"}
            </div>
            <span className="text-white text-xs font-medium">{usuario?.nome || "Operador"}</span>
          </div>
        </div>
      </header>

      <main className="flex flex-1 overflow-hidden">
        <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
          
          {/* TELA HOME */}
          {telaAtiva === "home" && (
            <div className="space-y-8 animate-in fade-in duration-500">
              <div>
                <h2 className="text-3xl font-bold text-white tracking-tight">
                  {obterSaudacao()}, <span className="text-[#00f2aa]">{usuario?.nome || "Operador"}!</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1 capitalize">{dataHoje}</p>
              </div>

              <div className="grid grid-cols-3 gap-6">
                <div className="bg-[#00f2aa] p-8 rounded-[2.5rem] shadow-xl shadow-[#00f2aa]/5 flex flex-col justify-between h-48 relative overflow-hidden group">
                   <div className="z-10">
                     <p className="text-[#0d1117] font-bold text-[10px] uppercase tracking-widest mb-1 opacity-70">Saldo Disponível</p>
                     <h3 className="text-[#0d1117] text-4xl font-black tracking-tighter">R$ 136.800</h3>
                     <p className="text-[#0d1117] text-xs mt-4 font-bold flex items-center gap-1 bg-[#0d1117]/10 w-fit px-2 py-1 rounded-full">
                        <TrendingUp size={14}/> +9.4% este mês
                     </p>
                   </div>
                   <BarChart3 className="absolute -right-4 -bottom-4 text-[#0d1117] opacity-10" size={140} />
                </div>

                <div className="bg-[#161b22] border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between h-48">
                  <div>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">IBOVESPA Hoje</p>
                    <h3 className="text-white text-2xl font-bold">125.430 pts</h3>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#00f2aa] text-sm font-bold flex items-center gap-1"><TrendingUp size={16}/> +1.82%</span>
                  </div>
                </div>

                <div className="bg-[#161b22] border border-slate-800 p-8 rounded-[2.5rem] flex flex-col justify-between h-48">
                  <div>
                    <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mb-1">Taxa SELIC</p>
                    <h3 className="text-white text-2xl font-bold">10.75%</h3>
                  </div>
                </div>
              </div>

              <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-8">
                <h3 className="text-white font-bold text-sm mb-6">Ativos Favoritos</h3>
                <div className="space-y-3">
                  {["PETR4", "VALE3", "ITUB4"].map((ticker) => (
                    <div key={ticker} onClick={() => buscarAcao(ticker)} className="flex items-center justify-between p-4 bg-[#0d1117]/50 rounded-2xl border border-slate-800/50 hover:border-[#00f2aa]/30 cursor-pointer transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-white font-bold text-xs">{ticker.slice(0,2)}</div>
                        <p className="text-white font-bold text-sm">{ticker}</p>
                      </div>
                      <ArrowUpRight size={18} className="text-slate-600" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TELA ANALISAR AÇÕES */}
          {telaAtiva === "analisar" && (
            <div className="space-y-6 animate-in slide-in-from-bottom-2 duration-500 pb-10">
               <header>
                 <h2 className="text-2xl font-bold text-white tracking-tight">Analisar Ações</h2>
               </header>
               
               <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-2 flex gap-2">
                 <input 
                    className="flex-1 bg-transparent px-4 text-white outline-none font-bold text-sm"
                    placeholder="EX: PETR4, AAPL..."
                    value={busca}
                    onChange={(e) => setBusca(e.target.value.toUpperCase())}
                 />
                 <button onClick={() => buscarAcao()} className="bg-[#00f2aa] text-[#0d1117] px-8 py-3 rounded-xl font-bold text-xs uppercase">
                   {loading ? "Analisando..." : "Realizar Análise"}
                 </button>
               </div>

               {resultadoAcao && (
                 <div className="space-y-6">
                    <div className="bg-[#161b22] border border-slate-800 p-8 rounded-[2.5rem] flex justify-between items-center">
                       <div>
                         <h3 className="text-white text-4xl font-black tracking-tighter">{resultadoAcao.ticker}</h3>
                         <p className="text-slate-500 text-sm font-medium">{resultadoAcao.nomeEmpresa}</p>
                       </div>
                       <div className="text-right">
                         <div className="text-white text-4xl font-black tracking-tighter">R$ {resultadoAcao.preco}</div>
                         <div className="text-[#00f2aa] text-sm font-bold flex items-center justify-end gap-1"><TrendingUp size={16}/> +{resultadoAcao.variacao}%</div>
                       </div>
                    </div>

                    <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-8">
                      <PortfolioChart />
                    </div>

                    <div className="bg-gradient-to-br from-[#00f2aa]/10 to-transparent border border-[#00f2aa]/20 p-8 rounded-[2.5rem] flex gap-6">
                       <Sparkles className="text-[#00f2aa] shrink-0" size={28} />
                       <div>
                          <h5 className="text-[#00f2aa] font-bold text-xs uppercase mb-3 tracking-widest">IA Resumo Estratégico</h5>
                          <p className="text-slate-300 text-sm leading-relaxed font-medium">{resultadoAcao.resumo}</p>
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