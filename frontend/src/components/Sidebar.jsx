import React from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  LogOut, 
  BrainCircuit, 
  ChevronRight 
} from "lucide-react";

const Sidebar = ({ usuario, telaAtiva, setTelaAtiva, onLogout }) => {
  return (
    <aside className="w-20 lg:w-72 border-r border-white/5 flex flex-col bg-[#080808] z-50 h-screen transition-all duration-300">
      
      {}
      <div className="p-8 mb-6 flex items-center gap-4">
        <div className="bg-yellow-500 p-2 rounded-xl shrink-0 shadow-lg shadow-yellow-500/20">
          <BrainCircuit className="text-black" size={24} />
        </div>
        <div className="hidden lg:block">
          <h1 className="font-black uppercase tracking-tighter text-xl italic text-white leading-none">
            Vitta <span className="text-yellow-500">AI</span>
          </h1>
          <p className="text-[9px] font-bold text-gray-600 tracking-widest uppercase mt-1 italic">
            Premium Trader
          </p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 px-4 space-y-2">
        <button
          onClick={() => setTelaAtiva("home")}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
            telaAtiva === "home" 
            ? "bg-yellow-500 text-black font-black shadow-xl" 
            : "text-gray-500 hover:bg-white/5 hover:text-white"
          }`}
        >
          <LayoutDashboard size={22} />
          <span className="hidden lg:block text-sm uppercase tracking-tighter">Início</span>
        </button>

        <button
          onClick={() => setTelaAtiva("analisar")}
          className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${
            telaAtiva === "analisar" 
            ? "bg-yellow-500 text-black font-black shadow-xl" 
            : "text-gray-500 hover:bg-white/5 hover:text-white"
          }`}
        >
          <BarChart3 size={22} />
          <span className="hidden lg:block text-sm uppercase tracking-tighter">Mercado</span>
        </button>
      </nav>

      {/* Perfil e Sair */}
      <div className="p-6 border-t border-white/5">
        
        {/* BOTÃO DO PERFIL  */}
        <button 
          onClick={() => setTelaAtiva("perfil")}
          className={`w-full hidden lg:flex items-center gap-3 p-3 rounded-2xl border mb-4 group transition-all ${
            telaAtiva === "perfil" 
            ? "bg-yellow-500 border-yellow-500" 
            : "bg-white/5 border-white/5 hover:border-yellow-500/30"
          }`}
        >
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black italic border ${
            telaAtiva === "perfil" ? "bg-black text-yellow-500" : "bg-yellow-500/20 text-yellow-500"
          }`}>
            {usuario?.nome?.charAt(0) || "R"}
          </div>
          <div className="flex-1 text-left">
            <p className={`text-xs font-black ${telaAtiva === "perfil" ? "text-black" : "text-white"}`}>
              {usuario?.nome || "Rennan"}
            </p>
            <p className={`text-[9px] font-bold uppercase tracking-tighter ${telaAtiva === "perfil" ? "text-black/60" : "text-gray-500"}`}>
              Pormade Portas
            </p>
          </div>
          <ChevronRight size={14} className={telaAtiva === "perfil" ? "text-black" : "text-gray-700"} />
        </button>

        {/* BOTÃO DESCONECTAR */}
        <button
          onClick={() => onLogout()} 
          className="w-full flex items-center gap-4 p-4 text-red-500/70 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all"
        >
          <LogOut size={22} />
          <span className="hidden lg:block text-xs font-black uppercase tracking-widest">Desconectar</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;