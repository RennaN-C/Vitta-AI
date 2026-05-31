import { useEffect, useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import api from "../api";

const ChatBot = ({ tickerAtivo = "" }) => {
  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagens, setMensagens] = useState([{ role: "model", text: `Analisando **${tickerAtivo || "o mercado"}**...` }]);
  const scrollRef = useRef(null);
  useEffect(() => scrollRef.current?.scrollIntoView({ behavior: "smooth" }), [mensagens]);
  const enviarMensagem = async () => {
    if (!pergunta.trim() || enviando) return;
    const texto = pergunta;
    setPergunta(""); setMensagens((prev) => [...prev, { role: "user", text: texto }]); setEnviando(true);
    try {
      const { data } = await api.post("/chat", { mensagem: tickerAtivo ? `Considere o ativo ${tickerAtivo}: ${texto}` : texto });
      setMensagens((prev) => [...prev, { role: "model", text: data.resposta }]);
    } catch {
      setMensagens((prev) => [...prev, { role: "model", text: "Não foi possível consultar o assistente agora." }]);
    } finally { setEnviando(false); }
  };
  return <div className="flex h-full flex-col bg-[#0d1117]"><header className="flex gap-3 border-b border-slate-800 p-6"><Bot className="text-[#00f2aa]" /><div><strong className="text-sm">Assistente IA</strong><p className="text-[10px] text-slate-500">Análise auditada via LangChain</p></div></header><div className="flex-1 space-y-5 overflow-y-auto p-6">{mensagens.map((item, index) => <div key={`${item.role}-${index}`} className={`flex gap-2 ${item.role === "user" ? "flex-row-reverse" : ""}`}>{item.role === "user" ? <User size={16} /> : <Bot size={16} className="text-[#00f2aa]" />}<div className="max-w-[85%] rounded-xl bg-[#161b22] p-3 text-xs text-slate-300"><ReactMarkdown>{item.text}</ReactMarkdown></div></div>)}<div ref={scrollRef} /></div><div className="flex border-t border-slate-800 p-4"><input value={pergunta} onChange={(event) => setPergunta(event.target.value)} onKeyDown={(event) => event.key === "Enter" && enviarMensagem()} className="flex-1 rounded-l-xl bg-[#161b22] p-3 text-xs outline-none" placeholder="Interagir com IA..." /><button onClick={enviarMensagem} className="rounded-r-xl bg-[#161b22] px-3 text-[#00f2aa]"><Send size={18} /></button></div></div>;
};

export default ChatBot;
