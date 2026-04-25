import os
import yfinance as yf
import sqlalchemy
from fastapi import FastAPI, Body, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from databases import Database
from sqlalchemy import create_engine, MetaData, Table, Column, String, Integer
from dotenv import load_dotenv
from deep_translator import GoogleTranslator
import google.generativeai as genai

# --- CONFIGURAÇÃO ---
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL")
app = FastAPI(title="Vitta AI Backend")

# --- CORS (ESSENCIAL PARA O REACT) ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

database = Database(DATABASE_URL)

@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# --- ANÁLISE REAL DE MERCADO ---
@app.get("/analisar/{ticker}")
async def analisar_acao(ticker: str):
    try:
        simbolo = ticker.upper()
        if not simbolo.endswith(".SA") and len(simbolo) <= 6:
            if not any(c in simbolo for c in ["BTC", "ETH"]):
                simbolo += ".SA"
            
        acao = yf.Ticker(simbolo)
        info = acao.info
        
        preco_atual = info.get('currentPrice') or info.get('regularMarketPrice')
        if not preco_atual:
            raise HTTPException(status_code=404, detail="Ativo não encontrado")

        fechamento_anterior = info.get('regularMarketPreviousClose', preco_atual)
        variacao = ((preco_atual - fechamento_anterior) / fechamento_anterior) * 100

        # Tradutor para Português
        translator = GoogleTranslator(source='en', target='pt')
        setor_en = info.get('sector', 'N/A')
        resumo_en = info.get('longBusinessSummary', 'Sem resumo disponível.')
        
        setor_pt = translator.translate(setor_en) if setor_en != 'N/A' else 'N/A'
        resumo_pt = translator.translate(resumo_en) if len(resumo_en) > 20 else resumo_en

        return {
            "ticker": ticker.upper(),
            "nomeEmpresa": info.get('longName', 'Empresa Listada'),
            "preco": round(preco_atual, 2),
            "variacao": round(variacao, 2),
            "setor": setor_pt.upper(),
            "dividendYield": round((info.get('dividendYield', 0) * 100), 2) if info.get('dividendYield') else 0,
            "volume": info.get('regularMarketVolume', 0),
            "resumo": resumo_pt
        }
    except Exception as e:
        print(f"Erro: {e}")
        raise HTTPException(status_code=500, detail="Erro ao processar dados reais.")

# --- CHAT IA (VERSÃO ESTÁVEL) ---
@app.post("/chat")
async def chat_vitta(dados: dict = Body(...)):
    from groq import Groq
    import os
    
    api_key = os.getenv("GROQ_API_KEY")
    mensagem_usuario = dados.get("mensagem")

    if not api_key:
        return {"resposta": "⚠️ Terminal Offline: Chave Groq não configurada."}

    try:
        client = Groq(api_key=api_key)
        
        completion = client.chat.completions.create(
            # MODELO ATUALIZADO (Llama 3.3 é o estado da arte na Groq agora)
            model="llama-3.3-70b-versatile", 
            messages=[
                {
                    "role": "system",
                    "content": "Você é o analista sênior do Terminal Vitta AI. Responda em português brasileiro, de forma curta, técnica e profissional. Foco em mercado financeiro e ações."
                },
                {
                    "role": "user",
                    "content": mensagem_usuario
                }
            ],
            temperature=0.5,
            max_tokens=1000,
        )
        
        return {"resposta": completion.choices[0].message.content}

    except Exception as e:
        error_msg = str(e)
        print(f"❌ ERRO REAL NA GROQ: {error_msg}")
        
        # Se der erro de modelo de novo, usamos o 3.1 8b que é o "coringa"
        if "model_decommissioned" in error_msg or "400" in error_msg:
             return {"resposta": "O motor de análise está sendo atualizado para a versão 3.3. Por favor, tente novamente em 5 segundos."}
             
        return {"resposta": "O motor de inteligência Vitta está em manutenção momentânea."}


@app.post("/auth/login")
async def login(dados: dict = Body(...)):
    # 1. Pegamos os dados que você digitou no Frontend
    identificador = dados.get("email", "").strip() 
    senha_input = dados.get("senha")
    
    user = None

    # 2. TENTATIVA 1: Buscar na tabela 'users'
    try:
        query_users = "SELECT * FROM users WHERE email = :id AND senha = :senha"
        user = await database.fetch_one(query=query_users, values={"id": identificador, "senha": senha_input})
    except Exception:
        # Se a tabela 'users' não existir, o Python ignora o erro e tenta a próxima
        pass

    # 3. TENTATIVA 2: Se não achou na primeira, busca na 'usuarios'
    if not user:
        try:
            query_usuarios = "SELECT * FROM usuarios WHERE email = :id AND senha = :senha"
            user = await database.fetch_one(query=query_usuarios, values={"id": identificador, "senha": senha_input})
        except Exception as e:
            # Se nenhuma das duas tabelas existir, ele avisa no terminal
            print(f"❌ Erro crítico: Nenhuma tabela (users ou usuarios) foi encontrada no Neon. Erro: {e}")
            raise HTTPException(status_code=500, detail="Banco de dados não configurado corretamente.")

    # 4. RESPOSTA FINAL
    # FORMA CORRETA DE ACESSAR OS DADOS DO OBJETO 'RECORD'
    if user:
        return {
            "status": "success",
            "usuario": {
            "nome": user["nome"],
            "email": user["email"],
            # Verificamos se a coluna existe no banco, se não, usamos o padrão
            "empresa": user["empresa"] if "empresa" in user._mapping else "Pormade Portas"
        }
    }
    
    # Se chegou aqui, as tabelas existem mas a senha ou email estão errados
    raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")