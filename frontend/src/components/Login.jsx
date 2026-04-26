import React, { useState } from "react";
import axios from "axios";
import { Lock, Mail, UserPlus, LogIn, RefreshCw, AlertCircle, TrendingUp } from "lucide-react";
import vittaBg from "../assets/vitta_bg.png"; 

const API_URL = "http://127.0.0.1:8000";

const Login = ({ onLogin }) => {
  const [abaAtiva, setAbaAtiva] = useState("login");
  const [loading, setLoading] = useState(false);
  const [servidorStatus, setServidorStatus] = useState("online");

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [nome, setNome] = useState("");

  const tratarAutenticacao = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServidorStatus("online");

    const rota = abaAtiva === "login" ? "/auth/login" : "/auth/cadastro";
    const payload = abaAtiva === "login" ? { email, senha } : { nome, email, senha };

    try {
      const res = await axios.post(`${API_URL}${rota}`, payload);
      
      if (abaAtiva === "login") {
        if (res.data.status === "success" || res.status === 200) {
          onLogin(res.data.usuario);
        }
      } else {
        alert("✅ Conta criada com sucesso! Faça login agora.");
        setAbaAtiva("login");
      }
    } catch (err) {
      if (!err.response) {
        setServidorStatus("offline");
      } else {
        alert(err.response.data.detail || "Erro na autenticação.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen w-full flex items-center justify-center p-6 relative overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${vittaBg})` }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] -z-10" />

      <div className="w-full max-w-md bg-[#0a0a0a]/90 border border-white/10 p-10 rounded-[3rem] shadow-[0_0_50px_rgba(0,0,0,0.8)] backdrop-blur-xl">
        <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 p-4 rounded-2xl -rotate-6 shadow-[0_10px_30px_rgba(234,179,8,0.3)] mb-4 border border-yellow-300/20">
                <TrendingUp className="text-black" size={36} strokeWidth={3} />
            </div>
          
          <h1 className="text-4xl font-black uppercase italic tracking-tighter text-white">
            Vitta <span className="text-yellow-500 font-serif">AI</span>
          </h1>
          <p className="text-[9px] font-black text-gray-500 tracking-[0.4em] uppercase mt-1">
            Trading Terminal
          </p>
          
          <div className="flex gap-8 mt-10">
            <button 
              type="button"
              onClick={() => setAbaAtiva("login")}
              className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${abaAtiva === 'login' ? 'border-yellow-500 text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
            >
              Acessar
            </button>
            <button 
              type="button"
              onClick={() => setAbaAtiva("cadastro")}
              className={`text-[10px] font-black uppercase tracking-widest pb-2 border-b-2 transition-all ${abaAtiva === 'cadastro' ? 'border-yellow-500 text-white' : 'border-transparent text-gray-600 hover:text-gray-400'}`}
            >
              Registrar
            </button>
          </div>
        </div>

        <form onSubmit={tratarAutenticacao} className="space-y-4">
          {abaAtiva === "cadastro" && (
            <input
              type="text"
              placeholder="NOME COMPLETO"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-yellow-500/50 uppercase font-black placeholder:text-gray-600"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
            />
          )}

          <div className="relative">
            <input
              type="email"
              placeholder="E-MAIL"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-yellow-500/50 uppercase font-black placeholder:text-gray-600"
              value={email}
              onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
              required
            />
            <Mail className="absolute right-6 top-4 text-gray-600" size={18} />
          </div>

          <div className="relative">
            <input
              type="password"
              placeholder="SENHA"
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-yellow-500/50 uppercase font-black placeholder:text-gray-600"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
            />
            <Lock className="absolute right-6 top-4 text-gray-600" size={18} />
          </div>

          <button 
            type="submit"
            disabled={loading}
            className={`w-full flex items-center justify-center gap-3 py-5 rounded-2xl uppercase tracking-widest text-xs font-black transition-all shadow-lg active:scale-95 ${
              servidorStatus === 'offline' 
              ? 'bg-red-500/20 text-red-500 border border-red-500/50' 
              : 'bg-yellow-500 text-black hover:bg-yellow-400'
            }`}
          >
            {loading ? <RefreshCw className="animate-spin" size={18} /> : 
             servidorStatus === 'offline' ? <><AlertCircle size={18} /> Servidor Offline</> :
             abaAtiva === 'login' ? <><LogIn size={18} /> Entrar no Terminal</> : <><UserPlus size={18} /> Ativar Conta</>}
          </button>
        </form>

        <div className="mt-10 text-center">
          <button type="button" className="text-[9px] text-gray-600 hover:text-yellow-500 uppercase font-black tracking-widest transition-colors">
            Esqueceu sua chave de acesso?
          </button>
        </div>
      </div>

      <div className="absolute bottom-6 text-[9px] text-gray-600 font-black uppercase tracking-[0.4em]">
        Vitta Asset Intelligence © 2026
      </div>
    </div>
  );
};

export default Login;