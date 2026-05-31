import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import api from "../api";

export default function ResetPassword() {
  const [novaSenha, setNovaSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const token = new URLSearchParams(window.location.search).get("token");
  const mensagemErro = (error) => {
    const detail = error.response?.data?.detail;
    return Array.isArray(detail) ? detail.map((item) => item.msg).join(" ") : detail || "O link expirou ou é inválido.";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await api.post("/auth/resetar-senha", { token, nova_senha: novaSenha });
      setMensagem("Senha alterada. Você já pode voltar ao login.");
    } catch (error) {
      setMensagem(mensagemErro(error));
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1224] p-4">
      <div className="w-full max-w-[400px] rounded-2xl border border-slate-800 bg-[#0f172a] p-10 text-white shadow-2xl">
        <h2 className="mb-6 text-center text-2xl font-bold">Criar Nova Senha</h2>
        {mensagem ? (
          <div className="flex items-center gap-2 rounded bg-green-900/30 p-4 text-sm text-green-400"><CheckCircle2 />{mensagem}</div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center rounded border border-slate-700 bg-[#1e293b] px-4">
              <Lock className="text-blue-500" size={18} />
              <input required minLength={8} type="password" value={novaSenha} onChange={(event) => setNovaSenha(event.target.value)} placeholder="Nova senha segura" className="w-full bg-transparent px-3 py-4 outline-none" />
            </div>
            <button className="w-full rounded bg-blue-600 py-3 font-bold hover:bg-blue-500">Redefinir senha</button>
          </form>
        )}
      </div>
    </div>
  );
}
