import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import { Send, MessageSquare, Minus, Bot, Sparkles } from "lucide-react";

const API_URL = "100.48.58.153:8000";

const ChatBot = () => {
  const [chatAberto, setChatAberto] = useState(false);
  const [pergunta, setPergunta] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [mensagens, setMensagens] = useState([
    {
      role: "model",
      parts: [{ text: "Sistema **Vitta AI** online. Como posso auxiliar na sua estratégia de mercado hoje?" }],
    },
  ]);

  const scrollRef = useRef(null);
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [mensagens]);

  const enviarMensagem = async () => {
    if (!pergunta.trim() || enviando) return;

    const textoUsuario = pergunta;
    setPergunta("");
    setMensagens((prev) => [...prev, { role: "user", parts: [{ text: textoUsuario }] }]);
    setEnviando(true);

    try {
      const res = await axios.post(`${API_URL}/chat`, { mensagem: textoUsuario });
      
      const respostaIA = res.data.resposta || "Instabilidade momentânea. Por favor, repita a pergunta.";

      setMensagens((prev) => [
        ...prev,
        { role: "model", parts: [{ text: respostaIA }] },
      ]);
    } catch (err) {
      console.error("Erro ocultado:", err);
      setMensagens((prev) => [
        ...prev,
        { role: "model", parts: [{ text: "O terminal Vitta AI está passando por uma atualização de segurança. Tente novamente em alguns instantes." }] },
      ]);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="fixed bottom-10 right-10 z-[100] font-sans">
      {!chatAberto ? (
        <button
          onClick={() => setChatAberto(true)}
          className="bg-yellow-500 text-black px-8 py-5 rounded-full shadow-[0_20px_60px_rgba(234,179,8,0.4)] hover:scale-105 active:scale-95 transition-all flex items-center gap-4 font-black text-[10px] tracking-[0.2em] uppercase"
        >
          <MessageSquare size={24} /> <span>Análise IA</span>
        </button>
      ) : (
        <div className="w-[380px] md:w-[450px] h-[600px] bg-[#0c0c0c] border border-white/10 rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.9)] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 border-b-yellow-500 border-b-[12px]">
          
          <div className="p-8 bg-yellow-500 text-black flex justify-between items-center">
            <div className="flex items-center gap-4 font-black text-[10px] uppercase tracking-tighter italic">
              <Bot size={22} /> <span>Vitta Analyst v5.0</span>
            </div>
            <button onClick={() => setChatAberto(false)} className="hover:bg-black/10 p-2 rounded-full">
              <Minus size={28} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#0c0c0c] scrollbar-hide">
            {mensagens.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] p-6 rounded-[2.5rem] text-[13px] leading-relaxed shadow-2xl ${
                  msg.role === "user" 
                  ? "bg-yellow-500 text-black font-black rounded-tr-none" 
                  : "bg-[#151515] text-gray-300 border border-white/5 rounded-tl-none border-l-4 border-l-yellow-500"
                }`}>
                  <div className="prose prose-invert prose-sm max-w-none prose-strong:text-yellow-500">
                    <ReactMarkdown>{msg.parts[0].text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}
            {enviando && (
              <div className="flex items-center gap-2 text-[9px] text-yellow-500/50 animate-pulse font-black ml-4 tracking-widest uppercase italic">
                <Sparkles size={12} /> Processando dados de mercado...
              </div>
            )}
            <div ref={scrollRef} />
          </div>

          <div className="p-8 bg-[#080808] border-t border-white/5 flex gap-4">
            <input
              className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-xs text-white outline-none focus:border-yellow-500/50 font-medium"
              placeholder="Digite sua dúvida financeira..."
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && enviarMensagem()}
            />
            <button
              onClick={enviarMensagem}
              disabled={enviando}
              className="bg-yellow-500 text-black p-5 rounded-2xl hover:bg-yellow-400 active:scale-90 transition-all shadow-xl"
            >
              <Send size={22} />
            </button>
          </div>
        </div>
      )}
      <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};

export default ChatBot;