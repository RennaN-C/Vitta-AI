import { useCallback, useEffect, useState } from "react";
import { Bell, Plus, Trash2, TrendingUp } from "lucide-react";
import api from "../api";

const Alerts = () => {
  const [dados, setDados] = useState({ estatisticas: {}, alertas: [], notificacoes: [] });
  const [form, setForm] = useState({ ticker: "", tipo: "preco_acima", valor: "" });
  const carregar = useCallback(() => api.get("/alertas").then(({ data }) => setDados(data)), []);
  useEffect(() => {
    carregar();
    const interval = window.setInterval(carregar, 60_000);
    return () => window.clearInterval(interval);
  }, [carregar]);
  const criar = async () => { await api.post("/alertas", { ...form, valor: Number(form.valor) }); setForm({ ticker: "", tipo: "preco_acima", valor: "" }); carregar(); };
  const excluir = async (id) => { await api.delete(`/alertas/${id}`); carregar(); };
  return <div className="space-y-6 pb-20">
    <header className="flex justify-between"><div><h2 className="text-3xl font-bold">Alertas Inteligentes</h2><p className="text-sm text-slate-500">Configure alertas personalizados para suas ações</p></div><button onClick={() => document.getElementById("novo-alerta")?.scrollIntoView({ behavior: "smooth" })} className="flex h-fit gap-2 rounded-xl bg-[#00e6ad] px-5 py-3 text-sm font-bold text-[#07111d]"><Plus size={18} />Novo Alerta</button></header>
    <div className="grid gap-6 md:grid-cols-3">{[["Alertas Ativos", dados.estatisticas.ativos, Bell], ["Disparados Hoje", dados.estatisticas.hoje, TrendingUp], ["Esta Semana", dados.estatisticas.semana, Bell]].map(([label, value, Icon], index) => <section key={label} className={`rounded-2xl border p-6 ${index === 0 ? "border-[#00f2aa]/40 bg-[#00f2aa]/5" : "border-slate-700 bg-[#1d2a40]"}`}><p className="flex gap-3 text-sm text-slate-400"><Icon className={index === 0 ? "text-[#00f2aa]" : "text-blue-400"} size={20} />{label}</p><strong className="mt-3 block text-3xl">{value || 0}</strong></section>)}</div>
    <div className="grid gap-6 lg:grid-cols-2"><section className="rounded-2xl border border-slate-700 bg-[#1d2a40] p-6"><h3 className="mb-4 font-bold">Alertas Configurados</h3><div className="space-y-3">{dados.alertas.length ? dados.alertas.map((alerta) => <div key={alerta.id} className="flex justify-between rounded-xl bg-[#080f1e] p-4 text-sm"><span><strong>{alerta.ticker}</strong><small className="block text-blue-300">{alerta.descricao}</small></span><button onClick={() => excluir(alerta.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={17} /></button></div>) : <p className="text-sm text-slate-500">Nenhum alerta configurado.</p>}</div></section><section className="rounded-2xl border border-slate-700 bg-[#1d2a40] p-6"><h3 className="mb-4 font-bold">Notificações Recentes</h3><div className="space-y-3">{dados.notificacoes.length ? dados.notificacoes.map((item) => <div key={item.id} className="rounded-xl bg-[#080f1e] p-4 text-sm"><strong>{item.ticker}</strong><p className="text-blue-300">{item.mensagem}</p><small className="text-slate-500">{new Date(item.criadoEm).toLocaleString("pt-BR")}</small></div>) : <p className="text-sm text-slate-500">Nenhum alerta disparado.</p>}</div></section></div>
    <section id="novo-alerta" className="rounded-2xl border border-slate-700 bg-[#1d2a40] p-6"><h3 className="mb-4 font-bold">Criar Novo Alerta</h3><div className="grid gap-4 md:grid-cols-3"><input value={form.ticker} onChange={(event) => setForm({ ...form, ticker: event.target.value.toUpperCase() })} placeholder="Ex: PETR4" className="rounded-xl border border-slate-700 bg-[#080f1e] p-4 text-sm" /><select value={form.tipo} onChange={(event) => setForm({ ...form, tipo: event.target.value })} className="rounded-xl border border-slate-700 bg-[#080f1e] p-4 text-sm"><option value="preco_acima">Quando atingir preço</option><option value="variacao_acima">Quando variar acima de</option><option value="variacao_abaixo">Quando variar abaixo de</option></select><input type="number" value={form.valor} onChange={(event) => setForm({ ...form, valor: event.target.value })} placeholder="Ex: 40.00" className="rounded-xl border border-slate-700 bg-[#080f1e] p-4 text-sm" /></div><button disabled={!form.ticker || !form.valor} onClick={criar} className="mt-4 flex w-full justify-center gap-2 rounded-xl bg-[#00e6ad] py-4 text-sm font-bold text-[#07111d] disabled:opacity-40"><Bell size={17} />Criar Alerta</button></section>
  </div>;
};

export default Alerts;
