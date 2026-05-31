import { useEffect, useState } from "react";
import { Activity, Bell, Brain, Save, Shield, Sparkles, TrendingUp, User } from "lucide-react";
import api from "../api";

const vazio = { nome: "", email: "", telefone: "", perfilRisco: "Moderado", notificacoes: { precos: true, ia: true, newsletters: false }, estatisticas: {} };

const Profile = ({ onUserUpdate }) => {
  const [profile, setProfile] = useState(vazio);
  const [mensagem, setMensagem] = useState("");
  const [senha, setSenha] = useState({ atual: "", nova: "" });

  useEffect(() => {
    api.get("/auth/profile").then(({ data }) => setProfile(data)).catch(() => setMensagem("Não foi possível carregar o perfil."));
  }, []);

  const salvar = async () => {
    await api.put("/auth/profile", {
      nome: profile.nome,
      telefone: profile.telefone,
      perfil_risco: profile.perfilRisco,
      notificacoes_precos: profile.notificacoes.precos,
      notificacoes_ia: profile.notificacoes.ia,
      newsletters: profile.notificacoes.newsletters,
    });
    onUserUpdate({ nome: profile.nome });
    setMensagem("Perfil atualizado com sucesso.");
  };

  const alterarSenha = async () => {
    try {
      await api.post("/auth/alterar-senha", { senha_atual: senha.atual, nova_senha: senha.nova });
      setSenha({ atual: "", nova: "" });
      setMensagem("Senha alterada com sucesso.");
    } catch (error) {
      setMensagem(error.response?.data?.detail || "Não foi possível alterar a senha.");
    }
  };

  const insight = {
    Conservador: "Seu perfil prioriza estabilidade. Compare volatilidade e diversificação antes de tomar decisões.",
    Moderado: "Seu perfil busca equilíbrio. Use o comparador e as tendências para avaliar risco e crescimento em conjunto.",
    Agressivo: "Seu perfil aceita maior oscilação. Observe volatilidade, pior mês e alertas antes de ampliar exposição.",
  }[profile.perfilRisco];

  return (
    <div className="space-y-8 pb-24">
      <header><h2 className="text-3xl font-bold">Perfil do Usuário</h2><p className="text-sm text-slate-500">Gerencie informações e preferências persistidas na sua conta</p></header>
      {mensagem && <p className="rounded-xl border border-[#00f2aa]/20 bg-[#00f2aa]/10 p-4 text-sm text-[#00f2aa]">{mensagem}</p>}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-3">
          <section className="rounded-[2rem] border border-slate-800 bg-[#161b22] p-8 text-center">
            <div className="mx-auto mb-5 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#00f2aa] to-blue-500"><User size={52} className="text-[#0d1117]" /></div>
            <h3 className="text-xl font-bold">{profile.nome || "Usuário"}</h3><p className="text-xs text-slate-500">{profile.email}</p>
          </section>
          <section className="space-y-4 rounded-[2rem] border border-slate-800 bg-[#161b22] p-6">
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400">Estatísticas reais</h4>
            {[["Análises", profile.estatisticas.analises, Activity], ["Simulações", profile.estatisticas.simulacoes, TrendingUp], ["Alertas", profile.estatisticas.alertas, Bell]].map(([label, value, Icon]) => <div key={label} className="flex justify-between text-sm"><span className="flex gap-2 text-slate-300"><Icon size={16} className="text-[#00f2aa]" />{label}</span><strong>{value || 0}</strong></div>)}
          </section>
        </div>
        <div className="space-y-8 lg:col-span-9">
          <section className="rounded-[2rem] border border-slate-800 bg-[#161b22] p-8">
            <h4 className="mb-6 flex gap-2 font-bold"><User className="text-[#00f2aa]" size={20} />Informações Pessoais</h4>
            <div className="grid gap-4 md:grid-cols-2">
              <input value={profile.nome} onChange={(event) => setProfile({ ...profile, nome: event.target.value })} className="rounded-xl border border-slate-800 bg-[#0d1117] p-4 text-sm outline-none" placeholder="Nome completo" />
              <input disabled value={profile.email} className="rounded-xl border border-slate-800 bg-[#0d1117] p-4 text-sm text-slate-500" />
              <input value={profile.telefone} onChange={(event) => setProfile({ ...profile, telefone: event.target.value })} className="rounded-xl border border-slate-800 bg-[#0d1117] p-4 text-sm outline-none md:col-span-2" placeholder="Telefone" />
            </div>
          </section>
          <section className="rounded-[2rem] border border-slate-800 bg-[#161b22] p-8">
            <h4 className="mb-5 flex gap-2 font-bold"><Brain className="text-[#00f2aa]" size={20} />Perfil de Risco</h4>
            <div className="grid gap-3 md:grid-cols-3">{["Conservador", "Moderado", "Agressivo"].map((tipo) => <button key={tipo} onClick={() => setProfile({ ...profile, perfilRisco: tipo })} className={`rounded-xl border p-4 text-left text-sm font-bold ${profile.perfilRisco === tipo ? "border-[#00f2aa]/60 bg-[#00f2aa]/10 text-[#00f2aa]" : "border-slate-800 bg-[#0d1117]"}`}>{tipo}</button>)}</div>
          </section>
          <section className="rounded-[2rem] border border-slate-800 bg-[#161b22] p-8">
            <h4 className="mb-5 flex gap-2 font-bold"><Bell className="text-[#00f2aa]" size={20} />Notificações</h4>
            {Object.entries(profile.notificacoes).map(([key, value]) => <label key={key} className="mb-3 flex justify-between rounded-xl border border-slate-800 bg-[#0d1117] p-4 text-sm capitalize"><span>{key === "precos" ? "Alertas de preço" : key === "ia" ? "Insights quantitativos" : "Newsletters"}</span><input type="checkbox" checked={value} onChange={() => setProfile({ ...profile, notificacoes: { ...profile.notificacoes, [key]: !value } })} className="accent-[#00f2aa]" /></label>)}
          </section>
          <section className="rounded-[2rem] border border-slate-800 bg-[#161b22] p-8">
            <h4 className="mb-5 flex gap-2 font-bold"><Shield className="text-[#00f2aa]" size={20} />Segurança</h4>
            <div className="grid gap-3 md:grid-cols-2"><input type="password" value={senha.atual} onChange={(event) => setSenha({ ...senha, atual: event.target.value })} className="rounded-xl border border-slate-800 bg-[#0d1117] p-4 text-sm" placeholder="Senha atual" /><input type="password" value={senha.nova} onChange={(event) => setSenha({ ...senha, nova: event.target.value })} className="rounded-xl border border-slate-800 bg-[#0d1117] p-4 text-sm" placeholder="Nova senha (mínimo 8 caracteres)" /></div>
            <button onClick={alterarSenha} disabled={!senha.atual || senha.nova.length < 8} className="mt-4 rounded-xl bg-blue-600 px-5 py-3 text-xs font-bold disabled:opacity-40">Alterar senha</button>
          </section>
          <section className="flex gap-4 rounded-[2rem] border border-[#00f2aa]/20 bg-[#00f2aa]/5 p-6"><Sparkles className="shrink-0 text-[#00f2aa]" /><div><h4 className="font-bold text-[#00f2aa]">Orientação do perfil</h4><p className="mt-2 text-sm text-slate-300">{insight}</p></div></section>
        </div>
      </div>
      <div className="flex justify-end"><button onClick={salvar} className="flex items-center gap-2 rounded-xl bg-[#00f2aa] px-8 py-4 text-xs font-black uppercase text-[#0d1117]"><Save size={16} />Salvar alterações</button></div>
    </div>
  );
};

export default Profile;
