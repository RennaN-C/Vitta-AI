import os
from fastapi import APIRouter, HTTPException
# Importação do ecossistema LangChain para padronização de modelos de linguagem
from langchain_groq import ChatGroq
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from database import database
from schemas import ChatMessage

router = APIRouter(prefix="/chat", tags=["IA"])

@router.post("")
async def chat_vitta(dados: ChatMessage):
    """
    Endpoint refatorado para utilizar o framework LangChain.
    Mudança Acadêmica: Migração de chamadas diretas de SDK para uma arquitetura baseada em Chains (Cadeias).
    """
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key:
        return {"resposta": "⚠️ Terminal Offline: Chave Groq não configurada."}

    try:
        # 1. ABSTRAÇÃO DO MODELO (Design Pattern: Adapter)
        # O LangChain permite que o modelo seja trocado (ex: Groq para OpenAI) sem alterar a lógica da aplicação.
        model = ChatGroq(
            model_name="llama-3.3-70b-versatile", 
            groq_api_key=api_key,
            temperature=0.5
        )

        # 2. ENGENHARIA DE PROMPT (Prompt Templating)
        # Uso de templates estruturados para garantir a separação entre diretrizes do sistema e inputs do usuário,
        # prevenindo ataques de Prompt Injection e melhorando a manutenibilidade.
        prompt = ChatPromptTemplate.from_messages([
            ("system", "Você é o analista sênior do Terminal Vitta AI. Responda em português brasileiro de forma técnica."),
            ("user", "{input}")
        ])

        # 3. CONSTRUÇÃO DA LCEL (LangChain Expression Language)
        # Implementação de uma pipeline declarativa (Chain). 
        # Fluxo: Entrada -> Template de Prompt -> Modelo de Linguagem -> Parser de Saída (String).
        chain = prompt | model | StrOutputParser()

        # 4. EXECUÇÃO ASSÍNCRONA
        # O uso de 'ainvoke' garante que a I/O-bound task da IA não bloqueie o event loop do FastAPI.
        resposta_ia = await chain.ainvoke({"input": dados.mensagem})
        
        # 5. PERSISTÊNCIA DE DADOS (Requisito Acadêmico de Auditoria)
        # Armazenamento obrigatório do histórico para futuras análises de log e treinamento de contexto.
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
        # Tratamento de exceções centralizado para depuração acadêmica
        print(f"Erro na Cadeia LangChain/Banco: {e}")
        return {"resposta": "O motor de inteligência Vitta está em manutenção técnica."}