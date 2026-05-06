import os
from fastapi import APIRouter, HTTPException
from groq import Groq
from database import database
from schemas import ChatMessage

router = APIRouter(prefix="/chat", tags=["IA"])

@router.post("")
async def chat_vitta(dados: ChatMessage):
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"resposta": "⚠️ Terminal Offline: Chave Groq não configurada."}

    try:
        # 1. Obter resposta da IA (Groq)
        client = Groq(api_key=api_key)
        completion = client.chat.completions.create(
            model="llama-3.3-70b-versatile", 
            messages=[
                {"role": "system", "content": "Você é o analista sênior do Terminal Vitta AI. Responda em português brasileiro de forma técnica."},
                {"role": "user", "content": dados.mensagem}
            ],
            temperature=0.5
        )
        resposta_ia = completion.choices[0].message.content
        
        # 2. REALIZAR A INSERÇÃO NO BANCO (Requisito do Projeto)
        query = """
            INSERT INTO chatbot_history (user_id, user_message, ai_response) 
            VALUES (:user_id, :msg, :resp)
        """
        await database.execute(query=query, values={
            "user_id": dados.user_id,
            "msg": dados.mensagem,
            "resp": resposta_ia
        })
        
        return {"resposta": resposta_ia}
        
    except Exception as e:
        print(f"Erro no Chat/Banco: {e}")
        return {"resposta": "O motor de inteligência Vitta está em manutenção."}