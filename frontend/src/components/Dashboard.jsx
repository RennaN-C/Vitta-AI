import React, { useState } from "react";
import axios from "axios";
import {
  Search,
  Star,
  Zap,
  Activity,
  TrendingUp,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
  BrainCircuit,
  Globe,
  Wallet,
  ShieldCheck,
  RefreshCcw,
  PlusCircle,
  Bell,
  Newspaper,
  LayoutDashboard,
} from "lucide-react";
import Profile from "./Profile";

const API_URL = "100.48.58.153:8000";

const Dashboard = ({ telaAtiva, setTelaAtiva, usuario }) => {
  const [busca, setBusca] = useState("");
  const [resultadoAcao, setResultadoAcao] = useState(null);
  const [loading, setLoading] = useState(false);
  const [favoritos] = useState(["PETR4", "VALE3", "ITUB4", "BBAS3", "ROXO34"]);

  const buscarAcao = async (ticker) => {
    const alvo = ticker || busca;
    if (!alvo) return;

    setLoading(true);

    if (setTelaAtiva && typeof setTelaAtiva === "function") {
      setTelaAtiva("analisar");
    }

    try {
      const res = await axios.get(`${API_URL}/analisar/${alvo}`);
      const dados = res.data;

      let opiniaoIA = "";
      if (dados.variacao > 0) {
        opiniaoIA = `O ativo ${dados.ticker} demonstra força de mercado. O setor de ${dados.setor} atrai investidores hoje.`;
      } else {
        opiniaoIA = `Identificamos correção em ${dados.ticker}. Analistas observam suporte no setor de ${dados.setor}.`;
      }

      setResultadoAcao({
        ...dados,
        opiniaoIA,
        volumeFormatado: (dados.volume / 1000000).toFixed(2) + "M",
      });
    } catch (err) {
      console.error(err);
      alert("Ativo não encontrado. Verifique o ticker (Ex: PETR4).");
    } finally {
      setLoading(false);
    }
  };

  const limparBusca = () => {
    setResultadoAcao(null);
    setBusca("");
  };

  return (
    <div className="flex-1 relative bg-[#050505] overflow-y-auto">
      {/* BARRA DE COTAÇÕES */}
      <div className="h-10 bg-yellow-500 text-black flex items-center overflow-hidden whitespace-nowrap shadow-lg sticky top-0 z-40 font-black italic text-[10px] uppercase tracking-widest">
        <div className="flex animate-marquee gap-10 px-4">
          <span>IBOVESPA: 128.450 (+0.4%)</span>
          <span>DÓLAR: R$ 5,24 (-0.12%)</span>
          <span>PETR4: R$ 39,20 (+1.2%)</span>
          <span>VALE3: R$ 62,50 (-0.8%)</span>
        </div>
      </div>

      <div className="p-6 md:p-12">
        {/* TELA INICIAL */}
        {telaAtiva === "home" && (
          <div className="max-w-6xl mx-auto animate-in fade-in duration-700">
            <div className="mb-10 flex items-center gap-6">
              <div className="bg-yellow-500 p-3 rounded-2xl -rotate-6 shadow-xl shadow-yellow-500/20">
                <LayoutDashboard className="text-black" />
              </div>
              <h2 className="text-4xl font-black italic uppercase text-white leading-none">
                Painel <span className="text-yellow-500">Principal</span>
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 bg-[#0f0f0f] border border-white/5 rounded-[2.5rem] p-8">
                <h3 className="text-[10px] font-black uppercase text-gray-500 mb-8 tracking-[0.3em]">
                  Meus Ativos
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoritos.map((f) => (
                    <button
                      key={f}
                      onClick={() => buscarAcao(f)}
                      className="flex items-center justify-between p-6 bg-white/5 rounded-3xl border border-white/5 hover:border-yellow-500/30 transition-all group"
                    >
                      <span className="text-xl font-black italic text-white">
                        {f}
                      </span>
                      <ArrowUpRight
                        size={20}
                        className="text-gray-700 group-hover:text-yellow-500"
                      />
                    </button>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-4 bg-[#0f0f0f] border border-white/5 p-8 rounded-[2.5rem]">
                <div className="flex items-center gap-3 mb-6 text-yellow-500">
                  <Newspaper size={18} />
                  <h4 className="text-[10px] font-black uppercase tracking-widest">
                    Notícias
                  </h4>
                </div>
                <p className="text-[11px] font-bold text-white italic border-l-2 border-yellow-500 pl-4 mb-4 uppercase">
                  Mercado aguarda decisão da Taxa Selic.
                </p>
                <p className="text-[11px] font-bold text-gray-500 italic border-l-2 border-gray-800 pl-4 uppercase">
                  B3 registra alta no volume de opções.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TELA DE ANÁLISE */}
        {telaAtiva === "analisar" && (
          <div className="max-w-6xl mx-auto animate-in slide-in-from-right-10 duration-700">
            <div className="mb-10 flex items-center justify-between">
              <h2 className="text-3xl font-black italic uppercase text-white tracking-tighter">
                Market <span className="text-yellow-500">Scanner</span>
              </h2>
              {resultadoAcao && (
                <button
                  onClick={limparBusca}
                  className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-gray-400 py-3 px-6 rounded-2xl text-[10px] font-black uppercase transition-all"
                >
                  <RefreshCcw size={14} /> Nova Pesquisa
                </button>
              )}
            </div>

            {!resultadoAcao ? (
              <div className="bg-[#0f0f0f] p-4 rounded-[2.5rem] border border-white/5 shadow-2xl flex gap-4">
                <input
                  className="flex-1 bg-black/40 border border-white/10 rounded-2xl py-6 px-10 outline-none text-white font-black tracking-widest uppercase focus:border-yellow-500/50"
                  placeholder="DIGITE O TICKER (EX: PETR4)..."
                  value={busca}
                  onChange={(e) => setBusca(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && buscarAcao()}
                />
                <button
                  onClick={() => buscarAcao()}
                  className="bg-yellow-500 text-black font-black px-12 rounded-2xl hover:bg-yellow-400 active:scale-95 transition-all uppercase text-[11px] tracking-widest"
                >
                  {loading ? "SCANNEANDO..." : "ANALISAR"}
                </button>
              </div>
            ) : (
              <div className="space-y-8 animate-in zoom-in-95">
                <div className="bg-[#0f0f0f] p-10 rounded-[3rem] border border-white/5 border-l-[16px] border-l-yellow-500 flex justify-between items-center">
                  <div>
                    <span className="text-yellow-500 text-[10px] font-black uppercase tracking-widest">
                      {resultadoAcao.setor}
                    </span>
                    <h3 className="text-7xl font-black text-white italic tracking-tighter uppercase leading-none">
                      {resultadoAcao.ticker}
                    </h3>
                    <p className="text-gray-400 font-bold uppercase text-xs mt-2">
                      {resultadoAcao.nomeEmpresa}
                    </p>
                  </div>
                  <div className="text-right">
                    <h4 className="text-5xl font-black text-white italic">
                      R$ {resultadoAcao.preco}
                    </h4>
                    <div
                      className={`flex items-center justify-end gap-1 font-black text-2xl ${resultadoAcao.variacao >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {resultadoAcao.variacao}%{" "}
                      {resultadoAcao.variacao >= 0 ? (
                        <ArrowUpRight />
                      ) : (
                        <ArrowDownRight />
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  <div className="lg:col-span-7 bg-yellow-500 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden flex flex-col justify-center min-h-[250px]">
                    <BrainCircuit
                      className="absolute -right-10 -bottom-10 text-black/10"
                      size={200}
                    />
                    <h4 className="text-black font-black text-2xl italic uppercase mb-4 relative z-10">
                      Vitta Intelligence
                    </h4>
                    <p className="text-black font-bold text-sm italic leading-relaxed uppercase relative z-10">
                      {resultadoAcao.opiniaoIA}
                    </p>
                  </div>
                  <div className="lg:col-span-5 grid grid-cols-2 gap-4">
                    <div className="bg-[#0f0f0f] p-8 rounded-[2.5rem] border border-white/5">
                      <Wallet className="text-yellow-500 mb-4" size={24} />
                      <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">
                        Div. Yield
                      </p>
                      <h5 className="text-white font-black text-2xl italic">
                        {resultadoAcao.dividendYield}%
                      </h5>
                    </div>
                    <div className="bg-[#0f0f0f] p-8 rounded-[2.5rem] border border-white/5">
                      <Activity className="text-yellow-500 mb-4" size={24} />
                      <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">
                        Volume (M)
                      </p>
                      <h5 className="text-white font-black text-2xl italic">
                        {resultadoAcao.volumeFormatado}
                      </h5>
                    </div>
                  </div>
                </div>

                <div className="bg-[#0f0f0f] p-10 rounded-[3rem] border border-white/5">
                  <h4 className="text-white font-black text-[11px] uppercase tracking-widest mb-6 italic">
                    Visão da Empresa
                  </h4>
                  <p className="text-gray-500 text-xs font-bold leading-relaxed uppercase italic">
                    {resultadoAcao.resumo}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- TELA DE PERFIL  --- */}
        {telaAtiva === "perfil" && <Profile usuario={usuario} />}
      </div>

      <style>{`
        @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
        .animate-marquee { display: inline-flex; animation: marquee 40s linear infinite; }
      `}</style>
    </div>
  );
};

export default Dashboard;
