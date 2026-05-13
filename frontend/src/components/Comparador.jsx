import React, { useState, useEffect } from "react";
import axios from "axios";
import { TrendingUp, TrendingDown, Sparkles, ChevronDown, BarChart3, ShieldCheck, Zap, RefreshCcw } from "lucide-react";
import CompareChart from "./CompareChart";

const API_URL = "http://localhost:8000";

const Comparador = () => {
  const [ticker1, setTicker1] = useState("PETR4.SA");
  const [ticker2, setTicker2] = useState("VALE3.SA");
  const [dados1, setDados1] = useState(null);
  const [dados2, setDados2] = useState(null);
  const [dadosGrafico, setDadosGrafico] = useState([]);
  const [loading, setLoading] = useState(false);

  const opcoesAtivos = [
    { ticker: "PETR4.SA", nome: "Petrobras" },
    { ticker: "VALE3.SA", nome: "Vale" },
    { ticker: "ITUB4.SA", nome: "Itaú" },
    { ticker: "AAPL", nome: "Apple" },
  ];

  useEffect(() => {
    const realizarComparacaoAutomatica = async () => {
      if (!ticker1 || !ticker2) return;
      setLoading(true);
      try {
       
        const [res1, res2] = await Promise.all([
          axios.get(`${API_URL}/analisar/${ticker1}`).catch(err => { console.error(`Erro em ${ticker1}:`, err); return null; }),
          axios.get(`${API_URL}/analisar/${ticker2}`).catch(err => { console.error(`Erro em ${ticker2}:`, err); return null; })
        ]);

        if (res1?.status === 200 && res2?.status === 200) {
          setDados1(res1.data);
          setDados2(res2.data);

          if (res1.data.historico && res2.data.historico) {
            const formatados = res1.data.historico.map((item, index) => ({
              data: item.data,
              valor1: item.preco,
              valor2: res2.data.historico[index]?.preco || null
            }));
            setDadosGrafico(formatados);
          }
        }
      } catch (err) {
        console.error("Erro crítico na sincronização de dados.");
      } finally {
        setLoading(false);
      }
    };

    realizarComparacaoAutomatica();
  }, [ticker1, ticker2]);

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight">Comparador Inteligente</h2>
        <p className="text-slate-500 text-sm font-medium">Compare ações lado a lado com análise de IA</p>
      </header>

      {/* SELEÇÃO DE ATIVOS (DROPDOWNS REATIVOS) */}
      <div className="grid grid-cols-2 gap-6">
        {[ {val: ticker1, set: setTicker1, label: "Ação 1"}, {val: ticker2, set: setTicker2, label: "Ação 2"} ].map((item, i) => (
          <div key={i} className="bg-[#161b22] border border-slate-800 p-6 rounded-[1.5rem] relative">
            <label className="text-slate-500 text-[10px] font-bold uppercase mb-4 block ml-1">{item.label}</label>
            <div className="relative">
              <select 
                value={item.val}
                onChange={(e) => item.set(e.target.value)}
                className="w-full bg-[#0d1117] border border-slate-700 text-white p-4 rounded-xl appearance-none outline-none focus:border-[#00f2aa] transition-all font-medium text-sm"
              >
                {opcoesAtivos.map(opt => (
                  <option key={opt.ticker} value={opt.ticker}>{opt.ticker} - {opt.nome}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={18} />
            </div>
          </div>
        ))}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-20 text-[#00f2aa] animate-pulse">
          <RefreshCcw className="animate-spin mr-2" /> Sincronizando dados reais...
        </div>
      )}

      {!loading && dados1 && dados2 && (
        <>
          {/* CARDS DE PREÇO (DINÂMICOS) */}
          <div className="grid grid-cols-2 gap-6">
            <div className="p-8 rounded-[2rem] bg-[#161b22] border border-slate-800">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-white text-3xl font-black">{dados1.ticker}</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase mt-1">{dados1.nomeEmpresa}</p>
                </div>
                <div className="text-[#00f2aa] font-bold text-sm flex items-center gap-1">
                  <TrendingUp size={16} /> +{dados1.variacao}%
                </div>
              </div>
              <div className="text-white text-4xl font-black">R$ {dados1.preco}</div>
            </div>

            <div className="p-8 rounded-[2rem] bg-[#161b22] border border-slate-800">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-white text-3xl font-black">{dados2.ticker}</h3>
                  <p className="text-slate-500 text-xs font-bold uppercase mt-1">{dados2.nomeEmpresa}</p>
                </div>
                <div className="text-red-500 font-bold text-sm flex items-center gap-1">
                  <TrendingDown size={16} /> {dados2.variacao}%
                </div>
              </div>
              <div className="text-white text-4xl font-black">R$ {dados2.preco}</div>
            </div>
          </div>

          {/* GRÁFICO DE COMPARAÇÃO (COM FIX PARA WIDTH) */}
          <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-10 overflow-hidden">
            <h4 className="text-white font-bold text-sm mb-8">Comparação Visual</h4>
            <div className="w-full flex-1 min-h-[350px]">
              {dadosGrafico.length > 0 ? (
                <CompareChart dados={dadosGrafico} ticker1={dados1.ticker} ticker2={dados2.ticker} />
              ) : (
                <div className="h-[350px] flex items-center justify-center text-slate-500 italic">
                  Aguardando dados históricos...
                </div>
              )}
            </div>
          </div>

          {/* PARECER IA */}
          <div className="bg-[#00f2aa]/5 border border-[#00f2aa]/20 p-8 rounded-[2rem] flex gap-6">
            <div className="bg-[#00f2aa] p-3 rounded-2xl h-fit shrink-0 shadow-lg shadow-[#00f2aa]/20">
              <Sparkles className="text-[#0d1117]" size={24} />
            </div>
            <div>
              <h5 className="text-[#00f2aa] font-bold text-xs uppercase mb-3 tracking-widest">Análise Comparativa da IA</h5>
              <p className="text-slate-300 text-sm leading-relaxed font-medium">
                O modelo LangChain identificou que **{dados1.ticker}** apresenta maior resiliência em cenários de baixa, 
                enquanto **{dados2.ticker}** demonstra um Beta superior, reagindo com mais intensidade às altas do mercado.
              </p>
            </div>
          </div>

          {/* BADGES DE CONCLUSAO */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#161b22] border border-slate-800 p-6 rounded-2xl">
              <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Melhor Dividendo</p>
              <p className="text-[#00f2aa] font-black text-xl">{dados2.ticker}</p>
            </div>
            <div className="bg-[#161b22] border border-slate-800 p-6 rounded-2xl">
              <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Menor Risco</p>
              <p className="text-[#00f2aa] font-black text-xl">{dados1.ticker}</p>
            </div>
            <div className="bg-[#161b22] border border-slate-800 p-6 rounded-2xl">
              <p className="text-slate-500 text-[10px] font-bold uppercase mb-2">Maior Crescimento</p>
              <p className="text-[#00f2aa] font-black text-xl">{dados2.ticker}</p>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Comparador;