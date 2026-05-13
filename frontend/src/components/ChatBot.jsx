import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Send, Bot, User } from "lucide-react";

const API_URL = "http://localhost:8000";

const ChatBot = ({ isFixed = false, tickerAtivo = "" }) => {
  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagens, setMensagens] = useState([
    { role: "model", text: `Analisando **${tickerAtivo || 'o mercado'}**...` }
  ]);

  const scrollRef = useRef(null);
  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [mensagens]);

  /**
   * PROCESSO DE CONVERSAÇÃO (LANGCHAIN):
   * Envia o histórico de mensagens e o ID do usuário para o backend.
   * O LangChain utiliza Memory (ConversationBufferWindowMemory) para manter 
   * o contexto do diálogo e RAG (se implementado) para consultar dados externos.
   */
  const enviarMensagem = async () => {
    if (!pergunta.trim() || enviando) return;

    const usuarioStored = localStorage.getItem("vitta_user");
    const user = usuarioStored ? JSON.parse(usuarioStored) : null;

    const msgUser = pergunta;
    setPergunta("");
    setMensagens(prev => [...prev, { role: "user", text: msgUser }]);
    setEnviando(true);

    try {
      // POST para endpoint do LangChain que gerencia o fluxo de pensamento da IA
      const res = await axios.post(`${API_URL}/chat`, { 
        user_id: String(user?.id || "anonimo"), 
        mensagem: tickerAtivo ? `Considere o ativo ${tickerAtivo}: ${msgUser}` : msgUser 
      });
      setMensagens(prev => [...prev, { role: "model", text: res.data.resposta }]);
    } catch (err) {
      setMensagens(prev => [...prev, { role: "model", text: "Erro na conexão com o LLM." }]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0d1117] overflow-hidden">
      <div className="p-6 border-b border-slate-800 flex items-center gap-3 bg-[#0d1117] shrink-0">
        <div className="bg-[#00f2aa]/10 p-2 rounded-lg">
          <Bot size={20} className="text-[#00f2aa]" />
        </div>
        <div>
          <h4 className="text-white font-bold text-sm">Assistente IA</h4>
          <p className="text-slate-500 text-[10px]">Análise via LangChain NLP</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {mensagens.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`p-2 rounded-lg h-fit shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-[#00f2aa]/20'}`}>
              {msg.role === 'user' ? <User size={14} className="text-white" /> : <Bot size={14} className="text-[#00f2aa]" />}
            </div>
            <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
              msg.role === 'user' ? 'bg-[#1e293b] text-white' : 'bg-[#161b22] text-slate-300'
            }`}>
              <ReactMarkdown>{msg.text}</ReactMarkdown>
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <div className="p-6 bg-[#0d1117] border-t border-slate-800 shrink-0">
        <div className="bg-[#161b22] border border-slate-800 rounded-xl flex items-center px-4 focus-within:border-[#00f2aa]/50 transition-all">
          <input 
            className="flex-1 bg-transparent py-3 text-xs text-white outline-none placeholder:text-slate-600"
            placeholder="Interagir com IA..."
            value={pergunta}
            onChange={(e) => setPergunta(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
          />
          <button onClick={enviarMensagem} disabled={enviando} className="text-[#00f2aa] hover:scale-110 transition-transform">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;