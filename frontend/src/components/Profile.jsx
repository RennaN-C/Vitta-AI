import React from "react";
import { User, Mail, Building2, ShieldCheck, LogOut, Settings, Award } from "lucide-react";

const Profile = ({ usuario }) => {
  const user = usuario || { nome: "Rennan", email: "rennanoliveiracardoso@gmail.com", empresa: "Pormade Portas" };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in zoom-in-95 duration-700">
      {/* CABEÇALHO DO PERFIL */}
      <div className="mb-10 flex items-center gap-6">
        <div className="bg-yellow-500 p-3 rounded-2xl -rotate-6 shadow-xl shadow-yellow-500/20">
          <User className="text-black" size={24} />
        </div>
        <div>
          <h2 className="text-4xl font-black italic uppercase text-white leading-none">
            Meu <span className="text-yellow-500">Perfil</span>
          </h2>
          <p className="text-gray-500 font-bold text-[10px] uppercase tracking-[0.3em] mt-1">Dados de Acesso Vitta AI</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* CARD PRINCIPAL (ESQUERDA) */}
        <div className="md:col-span-4 flex flex-col items-center">
          <div className="relative group">
            <div className="w-48 h-48 bg-[#0f0f0f] border-4 border-yellow-500 rounded-[3rem] flex items-center justify-center overflow-hidden shadow-2xl transition-transform group-hover:scale-105">
                <span className="text-6xl font-black italic text-yellow-500">{user.nome.slice(0,1)}</span>
            </div>
            <div className="absolute -bottom-4 bg-yellow-500 text-black font-black text-[9px] px-6 py-2 rounded-full uppercase tracking-tighter shadow-xl">
              Nível Senior
            </div>
          </div>
          
          <button className="mt-12 w-full bg-white/5 hover:bg-red-500/10 border border-white/5 hover:border-red-500/30 text-gray-500 hover:text-red-500 py-4 rounded-2xl flex items-center justify-center gap-3 transition-all font-black uppercase text-[10px] tracking-widest">
            <LogOut size={16} /> Sair do Sistema
          </button>
        </div>

        {/* INFORMAÇÕES (DIREITA) */}
        <div className="md:col-span-8 space-y-6">
          <div className="bg-[#0f0f0f] border border-white/5 p-10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8 opacity-10 text-yellow-500 group-hover:rotate-12 transition-transform">
                <Award size={120} />
            </div>

            <div className="space-y-8 relative z-10">
              <div className="flex items-center gap-6">
                <div className="p-4 bg-black rounded-2xl border border-white/5 text-yellow-500">
                  <User size={20} />
                </div>
                <div>
                  <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">Nome Completo</p>
                  <h4 className="text-white text-xl font-black italic uppercase tracking-tight">{user.nome}</h4>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="p-4 bg-black rounded-2xl border border-white/5 text-yellow-500">
                  <Mail size={20} />
                </div>
                <div>
                  <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">E-mail de Acesso</p>
                  <h4 className="text-white text-xl font-black italic tracking-tight">{user.email}</h4>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="p-4 bg-black rounded-2xl border border-white/5 text-yellow-500">
                  <Building2 size={20} />
                </div>
                <div>
                  <p className="text-gray-600 text-[9px] font-black uppercase tracking-widest">Empresa / Cargo</p>
                  <h4 className="text-white text-xl font-black italic uppercase tracking-tight">{user.empresa || "Pormade Portas"}</h4>
                </div>
              </div>
            </div>
          </div>

          {/* STATUS DE SEGURANÇA */}
          <div className="bg-gradient-to-r from-green-500/10 to-transparent border border-green-500/20 p-8 rounded-[2.5rem] flex items-center justify-between">
            <div className="flex items-center gap-4">
               <ShieldCheck className="text-green-500" size={24} />
               <div>
                  <span className="text-white font-black text-[10px] uppercase italic">Autenticação Neon OK</span>
                  <p className="text-gray-500 text-[9px] font-bold uppercase mt-1 tracking-tighter">Sua conta está protegida por criptografia de ponta.</p>
               </div>
            </div>
            <button className="bg-white/5 p-3 rounded-xl hover:bg-white/10 transition-all">
                <Settings size={18} className="text-gray-500" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Profile;