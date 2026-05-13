import React from "react";
import { 
  LayoutDashboard, Search, BarChart2, MousePointer2, 
  TrendingUp, Bell, History, User, LogOut, Activity 
} from "lucide-react";

const Sidebar = ({ usuario, telaAtiva, setTelaAtiva, onLogout }) => {
  const menus = [
    { id: "home", label: "Dashboard", icon: <LayoutDashboard size={20} /> },
    { id: "analisar", label: "Analisar Ações", icon: <Search size={20} /> },
    { id: "comparador", label: "Comparador", icon: <BarChart2 size={20} /> },
    { id: "simulador", label: "Simulador", icon: <MousePointer2 size={20} /> },
    { id: "tendencias", label: "Tendências", icon: <Activity size={20} /> },
    { id: "alertas", label: "Alertas", icon: <Bell size={20} /> },
    { id: "historico", label: "Histórico", icon: <History size={20} /> },
    { id: "perfil", label: "Perfil", icon: <User size={20} /> },
  ];

  return (
    <aside className="w-64 bg-[#0d1117] border-r border-slate-800 flex flex-col h-screen p-6 shrink-0">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="bg-[#00f2aa] p-2 rounded-lg">
          <TrendingUp className="text-[#0d1117]" size={24} />
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">Vitta <span className="text-slate-400">AI</span></h1>
      </div>

      <nav className="flex-1 space-y-2">
        {menus.map((item) => (
          <button
            key={item.id}
            onClick={() => setTelaAtiva(item.id)}
            className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl transition-all text-sm font-medium ${
              telaAtiva === item.id 
              ? "bg-[#161b22] text-[#00f2aa] border border-slate-700 shadow-lg" 
              : "text-slate-500 hover:text-slate-300 hover:bg-[#161b22]/50"
            }`}
          >
            {item.icon}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <button onClick={onLogout} className="mt-auto flex items-center gap-4 px-4 py-3 text-slate-500 hover:text-red-400 transition-colors text-sm font-medium">
        <LogOut size={20} />
        <span>Sair</span>
      </button>
    </aside>
  );
};

export default Sidebar;