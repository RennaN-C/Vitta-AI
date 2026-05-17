import React, { useState } from "react";
import { 
  User, Activity, TrendingUp, Bell, Brain, 
  ShieldCheck, ArrowRight, Shield, Save, X, Sparkles 
} from "lucide-react";

const Profile = ({ usuario }) => {
  // 1. ESTADOS (Mantendo a tua estrutura original)
  const [formData, setFormData] = useState({
    nome: usuario?.nome || "marlon",
    email: usuario?.email || "marlon@gmail.com",
    telefone: "+55 11 98765-4321"
  });
  
  const [perfilRisco, setPerfilRisco] = useState("Moderado");
  const [notificacoes, setNotificacoes] = useState({
    precos: true,
    ia: true,
    newsletters: false
  });

  // 2. LÓGICA DE INSIGHTS DA IA
  const getInsights = () => {
    const insightsMap = {
      Conservador: "Com base no seu perfil conservador, a IA recomenda foco em Renda Fixa e Tesouro Direto. Sua carteira deve priorizar 80% em ativos de baixíssima volatilidade para garantir sua segurança patrimonial.",
      Moderado: "Com base no seu perfil moderado, a IA recomenda uma carteira diversificada com 60% em ações de dividendos e 40% em oportunidades de crescimento. Suas análises recentes indicam um bom timing para PETR4.",
      Agressivo: "Com base no seu perfil agressivo, a IA identifica oportunidades de retorno exponencial em Small Caps e Criptoativos. Recomendamos manter 70% de exposição em renda variável para maximizar ganhos."
    };
    return insightsMap[perfilRisco];
  };

  return (
    <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide animate-in fade-in duration-500 pb-40">
      
      {/* CABEÇALHO */}
      <header>
        <h2 className="text-3xl font-bold text-white tracking-tight">
          Perfil do Usuário
        </h2>
        <p className="text-slate-500 text-sm mt-1">
          Gerencie suas informações e preferências
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUNA ESQUERDA (3/12) */}
        <div className="lg:col-span-3 flex flex-col gap-8">
          {/* CARD USUÁRIO */}
          <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-8 flex flex-col items-center text-center shadow-2xl w-full">
            <div className="relative mb-6">
              <div className="w-32 h-32 rounded-full bg-gradient-to-br from-[#00f2aa] to-[#006fee] flex items-center justify-center shadow-lg shadow-[#00f2aa]/20">
                <User size={60} className="text-[#0d1117]" />
              </div>
            </div>
            <h3 className="text-white text-2xl font-bold tracking-tight lowercase">{formData.nome}</h3>
            <p className="text-slate-500 text-sm mb-4">{formData.email}</p>
            <div className="bg-[#00f2aa]/10 border border-[#00f2aa]/30 text-[#00f2aa] text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full mb-8">
              Conta Pro
            </div>
            <button className="w-full bg-[#1e293b]/50 hover:bg-[#1e293b] border border-slate-700 text-white font-bold py-3.5 rounded-2xl transition-all text-xs uppercase tracking-widest">
              Editar Foto
            </button>
          </div>

          {/* CARD ESTATÍSTICAS */}
          <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-8 flex flex-col gap-6 shadow-2xl w-full">
            <h4 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] ml-1">Estatísticas</h4>
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-300">
                  <Activity size={16} className="text-[#00f2aa]" />
                  <span className="text-xs font-bold">Análises</span>
                </div>
                <span className="text-[#00f2aa] font-bold text-sm">34</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-300">
                  <TrendingUp size={16} className="text-blue-500" />
                  <span className="text-xs font-bold">Simulações</span>
                </div>
                <span className="text-blue-500 font-bold text-sm">12</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 text-slate-300">
                  <Bell size={16} className="text-purple-500" />
                  <span className="text-xs font-bold">Alertas</span>
                </div>
                <span className="text-purple-500 font-bold text-sm">4</span>
              </div>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (9/12) */}
        <div className="lg:col-span-9 flex flex-col gap-8">
          
          {/* INFORMAÇÕES PESSOAIS */}
          <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-10 flex flex-col gap-8 shadow-2xl w-full">
            <div className="flex items-center gap-3">
              <User size={20} className="text-[#00f2aa]" />
              <h4 className="text-white font-bold text-lg">Informações Pessoais</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest ml-1">Nome Completo</label>
                <input 
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#00f2aa]/50 transition-all font-medium"
                />
              </div>
              <div className="space-y-2">
                <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest ml-1">Email</label>
                <input 
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#00f2aa]/50 transition-all font-medium"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-slate-500 text-[10px] font-bold uppercase tracking-widest ml-1">Telefone</label>
                <input 
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  className="w-full bg-[#0d1117] border border-slate-800 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#00f2aa]/50 transition-all font-medium"
                />
              </div>
            </div>
          </div>

          {/* PERFIL DE RISCO */}
          <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-10 flex flex-col gap-6 shadow-2xl w-full">
            <div className="flex items-center gap-3">
              <Brain size={20} className="text-[#00f2aa]" />
              <h4 className="text-white font-bold text-lg">Perfil de Risco</h4>
            </div>
            <div className="space-y-3">
              {[
                { id: "Conservador", desc: "Prioriza segurança e estabilidade" },
                { id: "Moderado", desc: "Busca equilíbrio entre risco e retorno" },
                { id: "Agressivo", desc: "Aceita riscos maiores por retornos mais altos" }
              ].map((perfil) => (
                <div 
                  key={perfil.id}
                  onClick={() => setPerfilRisco(perfil.id)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    perfilRisco === perfil.id 
                    ? "bg-[#00f2aa]/5 border-[#00f2aa]/50 shadow-lg shadow-[#00f2aa]/5" 
                    : "bg-[#0d1117] border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div>
                    <h5 className="text-white font-bold text-sm">{perfil.id}</h5>
                    <p className="text-slate-500 text-[11px] mt-1">{perfil.desc}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    perfilRisco === perfil.id ? "border-[#00f2aa]" : "border-slate-700"
                  }`}>
                    {perfilRisco === perfil.id && <div className="w-2.5 h-2.5 rounded-full bg-[#00f2aa]" />}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CARD NOTIFICAÇÕES */}
          <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-10 flex flex-col gap-6 shadow-2xl w-full">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-[#00f2aa]" />
              <h4 className="text-white font-bold text-lg">Notificações</h4>
            </div>
            <div className="space-y-4">
              {Object.keys(notificacoes).map((key) => (
                <div key={key} className="bg-[#0d1117] border border-slate-800 p-6 rounded-2xl flex items-center justify-between">
                  <div>
                    <h5 className="text-white font-bold text-sm capitalize">{key === 'precos' ? 'Alertas de Preço' : key === 'ia' ? 'Insights de IA' : 'Newsletters'}</h5>
                    <p className="text-slate-500 text-[11px] mt-1">Configurações de avisos automáticos via sistema e e-mail.</p>
                  </div>
                  <input 
                    type="checkbox" 
                    checked={notificacoes[key]}
                    onChange={() => setNotificacoes({...notificacoes, [key]: !notificacoes[key]})}
                    className="w-5 h-5 accent-[#00f2aa] cursor-pointer bg-[#161b22] border-slate-700 rounded"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CARD SEGURANÇA (CORRIGIDO CONFORME PROTÓTIPO) */}
          <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-10 flex flex-col gap-6 shadow-2xl w-full">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-[#00f2aa]" />
              <h4 className="text-white font-bold text-lg">Segurança</h4>
            </div>
            <div className="space-y-4">
              <button className="w-full bg-[#0d1117] border border-slate-800 p-6 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-all group">
                <div className="text-left">
                  <h5 className="text-white font-bold text-sm">Alterar Senha</h5>
                  <p className="text-slate-500 text-[11px] mt-1">Última alteração há 3 meses</p>
                </div>
                <ArrowRight size={18} className="text-[#00f2aa] group-hover:translate-x-1 transition-all" />
              </button>
              <button className="w-full bg-[#0d1117] border border-slate-800 p-6 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-all group">
                <div className="text-left">
                  <h5 className="text-white font-bold text-sm">Autenticação em Dois Fatores</h5>
                  <p className="text-slate-500 text-[11px] mt-1">Adicione uma camada extra de segurança</p>
                </div>
                <ArrowRight size={18} className="text-[#00f2aa] group-hover:translate-x-1 transition-all" />
              </button>
            </div>
          </div>

          {/* CARD INSIGHTS PERSONALIZADOS (LARGURA TOTAL E POR ÚLTIMO) */}
          <div className="bg-[#161b22] border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl w-full relative overflow-hidden">
             <div className="absolute inset-0 bg-gradient-to-br from-[#00f2aa]/5 to-transparent opacity-50"></div>
             <div className="relative flex gap-8">
                <div className="bg-gradient-to-br from-[#00f2aa] to-[#006fee] p-4 rounded-2xl h-fit shrink-0 shadow-lg shadow-[#00f2aa]/20">
                    <Sparkles className="text-[#0d1117]" size={32} />
                </div>
                <div className="space-y-3">
                    <h5 className="text-[#00f2aa] font-bold text-lg">Insights Personalizados</h5>
                    <p className="text-slate-300 text-sm leading-relaxed font-medium">
                      {getInsights()}
                    </p>
                </div>
             </div>
          </div>

        </div>
      </div>

      {/* RODAPÉ FIXO DE AÇÕES */}
      <footer className="fixed bottom-0 left-64 right-0 bg-[#0d1117]/80 backdrop-blur-md border-t border-slate-800 p-6 flex justify-end gap-4 z-50">
        <button className="px-8 py-4 rounded-2xl text-slate-400 font-bold text-xs uppercase hover:bg-slate-800 transition-all flex items-center gap-2">
          <X size={16} /> Cancelar
        </button>
        <button className="px-12 py-4 rounded-2xl bg-[#00f2aa] text-[#0d1117] font-black text-xs uppercase shadow-lg shadow-[#00f2aa]/20 hover:scale-105 transition-all flex items-center gap-2">
          <Save size={16} /> Salvar Alterações
        </button>
      </footer>

    </div>
  );
};

export default Profile;