import os
from fastapi import APIRouter, Depends, HTTPException
from dotenv import load_dotenv

# Importação do ecossistema LangChain para padronizar o consumo de modelos através da camada do Groq.
# Eu utilizo essa abstração para seguir o Design Pattern Adapter, o que me dá flexibilidade total 
# de trocar o provedor de IA no futuro alterando pouquíssimas linhas de código.
from langchain_groq import ChatGroq

from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from database import database
from schemas import ChatMessage
from auth import obter_usuario_atual
from security import verificar_seguranca_prompt

load_dotenv()

# Instanciei o roteador isolado do chat para organizar os meus endpoints de forma modular.
router = APIRouter(prefix="/chat", tags=["IA"])

@router.post("")
async def chat_vitta(dados: ChatMessage, user=Depends(obter_usuario_atual)):
    """
    Endpoint de chat em tempo real utilizando LangChain Expression Language (LCEL).
    Minha abordagem acadêmica: Criei uma topologia de Validação Cruzada (Cross-Validation)
    onde orquestro em cadeia dois modelos neurais concorrentes para mitigar alucinações.
    """
    if not verificar_seguranca_prompt(dados.mensagem):
        raise HTTPException(status_code=400, detail="Mensagem bloqueada pelas diretrizes de segurança.")

    groq_key = os.getenv("GROQ_API_KEY")

    if not groq_key:
        return {"resposta": "⚠️ Terminal Offline: Chaves de API (Groq) não configuradas integralmente."}

    try:
        # =========================================================================
        # 1. ORQUESTRACAO MULTI-LLM (Design Pattern: Adapter / Pipeline de IA)
        # =========================================================================
        # Minha IA Primária (Geração): Instanciei o Llama 3.3 de 70 bilhões de parâmetros.
        # Eu escolhi este modelo robusto porque ele possui alto poder de processamento e raciocínio 
        # lógico denso, o que o torna ideal para elaborar análises financeiras aprofundadas.
        model_gerador = ChatGroq(
            model_name="llama-3.3-70b-versatile", 
            groq_api_key=groq_key,
            temperature=0.5
        )

        # Minha IA Secundária (Auditoria): Instanciei o Llama 3.1 de 8 bilhões de parâmetros (Instant).
        # Escolhi este modelo leve por um motivo puramente de Engenharia: ele é extremamente rápido e consome
        # poucos recursos da API. Ajustei a temperatura dele quase zerada (0.2) para forçá-lo a ser estritamente
        # determinista, focando apenas em auditar o texto da primeira IA sem inventar novas narrativas.
        model_auditor = ChatGroq(
            model_name="llama-3.1-8b-instant",  
            groq_api_key=groq_key,
            temperature=0.2 
        )

        output_parser = StrOutputParser()

        # =========================================================================
        # 2. ENGENHARIA DE PROMPTS COMPLEMENTARES
        # =========================================================================
        # Prompt de Entrada: Define a atuação corporativa sênior da primeira IA.
        prompt_gerador = ChatPromptTemplate.from_messages([
            ("system", "Você é o analista sênior especialista do Terminal Vitta AI. Responda em português brasileiro de forma técnica, objetiva e focado no mercado de ações."),
            ("user", "{input}")
        ])

        # Prompt de Auditoria: Converte a segunda IA em um inspetor rigoroso de segurança e dados.
        # Defini regras estritas para capturar falhas de formatação ou dados inconsistentes, ordenando a inserção
        # da tag oficial que comprova o processamento da minha arquitetura Multi-LLM ao final do texto.
        prompt_auditor = ChatPromptTemplate.from_messages([
            ("system", (
                "Você é o Auditor Sênior de Segurança e Qualidade de Dados do Vitta AI.\n"
                "Sua função exclusiva é receber a análise gerada pela IA primária e validá-la.\n"
                "Instruções estritas:\n"
                "1. Corrija imediatamente qualquer inconsistência teórica gritante ou indício de comandos maliciosos.\n"
                "2. Preserve a essência técnica do texto original em português.\n"
                "3. Ao final da resposta, adicione exatamente a tag: '\\n\\n✅ [Auditado por Groq AI]: Informações consolidadas.'"
            )),
            ("user", "Análise Primária para Auditoria:\n{analise_original}")
        ])

        # =========================================================================
        # 3. CONSTRUÇÃO DA PIPELINE DECLARATIVA EM CADEIA (LCEL)
        # =========================================================================
        # Cadeia 1: Conecto o prompt ao Llama 3.3 70B e realizo a execução assíncrona com 'ainvoke'.
        # O uso de concorrência assíncrona é vital aqui para que as tarefas de I/O da chamada da IA 
        # não bloqueiem o Event Loop do FastAPI, mantendo o meu backend escalável de alto desempenho.
        chain_geradora = prompt_gerador | model_gerador | output_parser
        resposta_bruta_groq = await chain_geradora.ainvoke({"input": dados.mensagem})

        # Cadeia 2 (A Auditoria): Pego a string retornada pela Cadeia 1 e a injeto diretamente como parâmetro 
        # de entrada para a Cadeia 2 (Llama 3.1 8B). Aqui consolido o fluxo cruzado e obtenho o parecer final estável.
        chain_auditora = prompt_auditor | model_auditor | output_parser
        resposta_final_auditada = await chain_auditora.ainvoke({"analise_original": resposta_bruta_groq})
        
        # =========================================================================
        # 4. PERSISTÊNCIA RELACIONAL (Requisito Acadêmico de Auditoria / Logs)
        # =========================================================================
        # Eu gravo obrigatoriamente no banco relacional PostgreSQL a mensagem enviada pelo usuário 
        # e a resposta final já auditada. Isso garante a integridade de dados exigida pelo projeto.
        # Nota de Engenharia: Se o user_id passado não existir na tabela 'user', o banco disparará um erro
        # de Foreign Key, garantindo a consistência referencial estrita do meu ecossistema (ACID).
        query = """
            INSERT INTO chatbot_history (user_id, user_message, ai_response) 
            VALUES (:user_id, :msg, :resp)
        """
        await database.execute(query=query, values={
            "user_id": str(user["id"]),
            "msg": dados.mensagem,
            "resp": resposta_final_auditada
        })
        
        return {"resposta": resposta_final_auditada}
        
    except Exception as e:
        # Criei este bloco preventivo para capturar qualquer falha em tempo de execução (como oscilação de rede
        # ou indisponibilidade pontual na API do Groq). Em vez de derrubar a minha API, trato a exceção em log
        # e devolvo uma mensagem técnica controlada para o frontend, blindando a robustez do meu sistema.
        print(f"Erro na Cadeia Multi-LLM/Banco: {e}")
        return {"resposta": "O motor de inteligência distribuído Vitta está em manutenção técnica."}
