import { useState } from "react";
import { Lock, Mail, TrendingUp, User } from "lucide-react";
import api from "../api";

export default function Login({ onLogin }) {
  const [modo, setModo] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [loading, setLoading] = useState(false);

  const mensagemErro = (error) => {
    const detail = error.response?.data?.detail;
    if (Array.isArray(detail)) return detail.map((item) => item.msg).join(" ");
    return detail || "Não foi possível concluir a solicitação.";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMensagem("");
    setLoading(true);
    try {
      if (modo === "login") {
        const response = await api.post("/auth/login", { email, senha: password });
        onLogin(response.data.usuario, response.data.token);
      } else if (modo === "cadastro") {
        await api.post("/auth/cadastro", { nome: name, email, senha: password });
        setMensagem("Conta criada. Faça login para continuar.");
        setModo("login");
      } else {
        const response = await api.post("/auth/solicitar-reset", { email });
        setMensagem(response.data.message);
      }
    } catch (error) {
      setMensagem(mensagemErro(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-vitta-portal p-4">
      <div className="relative z-10 w-full max-w-[400px] rounded-[2.5rem] border border-slate-800 bg-[#0b1224]/90 p-10 shadow-2xl backdrop-blur-xl">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Vitta <span className="text-blue-500">AI</span>
          </h1>
          <p className="mt-2 text-xs font-medium text-slate-500">Terminal de Inteligência Financeira</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === "cadastro" && (
            <div className="flex items-center rounded-xl border border-slate-800 bg-[#0f172a] px-4">
              <User className="text-blue-500" size={18} />
              <input required value={name} onChange={(event) => setName(event.target.value)} className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none" placeholder="Nome completo" />
            </div>
          )}
          <div className="flex items-center rounded-xl border border-slate-800 bg-[#0f172a] px-4">
            <Mail className="text-blue-500" size={18} />
            <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none" placeholder="E-mail" />
          </div>
          {modo !== "reset" && (
            <div className="flex items-center rounded-xl border border-slate-800 bg-[#0f172a] px-4">
              <Lock className="text-blue-500" size={18} />
              <input required minLength={8} type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full bg-transparent px-3 py-4 text-sm text-white outline-none" placeholder="Senha" />
            </div>
          )}
          {mensagem && <p className="rounded-xl border border-blue-500/20 bg-blue-500/10 p-3 text-xs text-blue-200">{mensagem}</p>}
          <button disabled={loading} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border-b-4 border-green-700 bg-green-500 py-4 font-bold text-black transition-all hover:bg-green-400 disabled:opacity-60">
            {loading ? "Processando..." : modo === "login" ? "Entrar" : modo === "cadastro" ? "Criar conta" : "Enviar link"}
            <TrendingUp size={20} />
          </button>
        </form>

        <div className="mt-8 space-y-3 text-center">
          {modo === "login" && (
            <button type="button" onClick={() => setModo("reset")} className="block w-full text-[10px] font-bold uppercase text-slate-500 hover:text-white">
              Recuperar acesso
            </button>
          )}
          <button type="button" onClick={() => setModo(modo === "cadastro" ? "login" : "cadastro")} className="text-xs font-semibold text-blue-500 hover:text-white">
            {modo === "cadastro" ? "Já possui acesso? Faça login" : "Não tem uma conta? Criar conta"}
          </button>
          {modo === "reset" && (
            <button type="button" onClick={() => setModo("login")} className="block w-full text-xs font-semibold text-slate-400 hover:text-white">
              Voltar ao login
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
