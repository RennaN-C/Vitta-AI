import { Activity, BarChart2, Bell, Calculator, History, LayoutDashboard, LogOut, Search, TrendingUp, User } from "lucide-react";

const Sidebar = ({ telaAtiva, setTelaAtiva, onLogout }) => {
  const menus = [
    { id: "home", label: "Dashboard", icon: LayoutDashboard },
    { id: "analisar", label: "Analisar Ações", icon: Search },
    { id: "comparador", label: "Comparador", icon: BarChart2 },
    { id: "simulador", label: "Simulador", icon: Calculator },
    { id: "tendencias", label: "Tendências", icon: Activity },
    { id: "alertas", label: "Alertas", icon: Bell },
    { id: "historico", label: "Histórico", icon: History },
    { id: "perfil", label: "Perfil", icon: User },
  ];

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-800 bg-[#0d1117] p-6">
      <div className="mb-10 flex items-center gap-3 px-2">
        <div className="rounded-lg bg-[#00f2aa] p-2"><TrendingUp className="text-[#0d1117]" size={24} /></div>
        <h1 className="text-xl font-bold tracking-tight text-white">Vitta <span className="text-[#00f2aa]">AI</span></h1>
      </div>
      <nav className="flex-1 space-y-2">
        {menus.map(({ id, label, icon: Icon }) => (
          <button key={id} onClick={() => setTelaAtiva(id)} className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-sm font-medium transition-all ${telaAtiva === id ? "border border-[#00f2aa]/30 bg-[#00f2aa]/10 text-[#00f2aa]" : "text-slate-500 hover:bg-[#161b22]/50 hover:text-slate-300"}`}>
            <Icon size={20} /><span>{label}</span>
          </button>
        ))}
      </nav>
      <div className="mb-4 rounded-xl border border-[#00f2aa]/20 bg-[#00f2aa]/5 px-4 py-3 text-[10px] text-[#00f2aa]">
        <strong>Modo Pro Ativo</strong><br /><span className="text-slate-400">Dados personalizados</span>
      </div>
      <button onClick={onLogout} className="flex items-center gap-4 px-4 py-3 text-sm font-medium text-slate-500 transition-colors hover:text-red-400"><LogOut size={20} />Sair</button>
    </aside>
  );
};

export default Sidebar;
