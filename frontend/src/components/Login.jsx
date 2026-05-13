import React, { useState } from "react";
import axios from "axios";
import { Lock, Mail, User, TrendingUp } from "lucide-react";

const API_URL = "http://localhost:8000";

export default function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isLogin) {
        const res = await axios.post(`${API_URL}/auth/login`, { email, senha: password });
        onLogin(res.data.usuario);
      } else {
       
        await axios.post(`${API_URL}/auth/cadastro`, { nome: name, email, senha: password });
        alert("Conta criada com sucesso!");
        setIsLogin(true);
      }
    } catch (err) {
      alert("Erro no sistema. Verifique as suas credenciais.");
    }
  };

  return (
    <div className="bg-vitta-portal p-4">
      <div className="w-full max-w-[400px] bg-[#0b1224]/90 border border-slate-800 rounded-[2.5rem] p-10 shadow-2xl backdrop-blur-xl relative z-10">
        
        {}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Vitta <span className="text-blue-500">AI</span>
          </h1>
          <p className="text-xs font-medium text-slate-500 mt-2">
            Terminal de Inteligência Financeira
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div className="bg-[#0f172a] border border-slate-800 rounded-xl flex items-center px-4">
              <User className="text-blue-500" size={18} />
              <input
                type="text"
                placeholder="Nome completo"
                className="w-full bg-transparent py-4 px-3 outline-none text-white text-sm font-medium"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
          )}

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl flex items-center px-4">
            <Mail className="text-blue-500" size={18} />
            <input
              type="email"
              placeholder="E-mail"
              className="w-full bg-transparent py-4 px-3 outline-none text-white text-sm font-medium"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="bg-[#0f172a] border border-slate-800 rounded-xl flex items-center px-4">
            <Lock className="text-blue-500" size={18} />
            <input
              type="password"
              placeholder="Senha"
              className="w-full bg-transparent py-4 px-3 outline-none text-white text-sm font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {}
          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-400 text-black font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 mt-6 border-b-4 border-green-700 active:border-b-0"
          >
            Entrar <TrendingUp size={20} className="stroke-[3px]" />
          </button>
        </form>

        <div className="flex items-center my-6 gap-3">
          <div className="h-[1px] bg-slate-800 flex-1"></div>
          <span className="text-[10px] text-slate-500 font-bold uppercase">ou</span>
          <div className="h-[1px] bg-slate-800 flex-1"></div>
        </div>

        {}
        <button
          type="button"
          className="w-full bg-[#1e293b]/50 hover:bg-[#1e293b] border border-slate-800 text-white font-semibold py-4 rounded-xl transition-all flex items-center justify-center gap-3 text-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-4 h-4" />
          Logar com Google
        </button>

        <div className="mt-8 text-center space-y-2">
           <button type="button" className="text-[10px] font-bold text-slate-500 block w-full uppercase">
             Recuperar acesso
           </button>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-xs font-semibold text-blue-500 hover:text-white transition-colors"
          >
            {isLogin ? "Não tem uma conta? Criar conta" : "Já possui acesso? Faça Login"}
          </button>
        </div>
      </div>
    </div>
  );
}