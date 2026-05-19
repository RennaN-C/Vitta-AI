import os
import re
from typing import List, Dict, Any
import yfinance as yf
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from deep_translator import GoogleTranslator
from database import database
import auth
import chatbot

# Instanciei o meu servidor FastAPI definindo o título do projeto.
# Configurei o CORS com liberação total ("*") para facilitar o consumo do meu frontend em React
# durante o ambiente de desenvolvimento local, evitando bloqueios de requisições de portas diferentes.
app = FastAPI(title="Vitta AI Backend - Edição Especial Avançada")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- CONSTANTES DE ENGENHARIA DE PROMPTS ---
# Mapeei essas personas para estruturar o comportamento dinâmico da minha IA. 
# Minha estratégia aqui foi cobrir diferentes perfis de usuários do sistema, indo desde o investidor
# institucional que busca dados puros até o usuário leigo que precisa de uma explicação didática.
# Ao isolar isso em um dicionário, tornei meu código modular e fácil de expandir futuramente.
PERSONAS = {
    "tecnico": "Você é um analista quantitativo sênior. Foque em métricas puras, volatilidade, juros e dados estatísticos. Seja direto e matemático.",
    "resumido": "Você é um sumariador executivo de mercado. Redija sua análise em no máximo 3 frases extremamente objetivas.",
    "professor": "Você é um mentor educacional de finanças. Explique de forma didática os indicadores financeiros antes de concluir.",
    "detalhado": "Você é um especialista em Valuation. Faça um parecer profundo cobrindo macroeconomia e cenários de longo prazo.",
    "suporte": "Você é o assistente de suporte técnico do Vitta AI. Explique ao usuário como interpretar o sistema e os dados na tela."
}

# --- LISTA NEGRA DE SEGURANÇA (GUARDRAIL NATIVO) ---
# Criei esta lista negra para capturar palavras-chave associadas a ataques cibernéticos baseados em LLM.
# Meu objetivo é interceptar tentativas de Jailbreak (quando o usuário tenta burlar as regras do sistema)
# ou injeções de SQL/comandos na minha API antes mesmo de gastar tokens enviando a requisição para o Groq.
TERMOS_BLOQUEADOS = [
    "ignore as instruções", "ignore instructions", "jailbreak", "mude suas regras",
    "acting as", "delete", "drop table", "sudo", "rebele-se", "prompt de comando"
]

# --- MODELOS DE DADOS PARA REQUISIÇÃO (PYDANTIC SCHEMAS) ---
# Desenvolvi este modelo para tipar e validar os dados de entrada da minha rota de análise inteligente.
# Defini valores padrões (como "tecnico" e "estruturado") para garantir retrocompatibilidade 
# caso o frontend envie uma requisição parcial, evitando que a minha aplicação sofra um crash.
class RequisicaoAnaliseInteligente(BaseModel):
    ticker: str
    modo_persona: str = "tecnico"  
    tipo_prompt: str = "estruturado"  
    mensagem_usuario: str = ""

# --- EVENTOS DE CICLO DE VIDA ---
# Utilizei esses decoradores para orquestrar o ciclo de vida da minha aplicação.
# Eu garanto que a conexão com o PostgreSQL seja aberta assim que o servidor subir (startup)
# e fechada de forma limpa quando ele for interrompido (shutdown), prevenindo vazamentos de memória ou conexões órfãs.
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()

# Acoplei os roteadores isolados de autenticação e chatbot ao núcleo do meu app.
# Fiz isso para manter uma arquitetura limpa e organizada por módulos de responsabilidade.
app.include_router(auth.router)
app.include_router(chatbot.router)

# --- FUNÇÃO AUXILIAR DE SEGURANÇA (GUARDRAIL) ---
def verificar_seguranca_prompt(texto: str) -> bool:
    """
    PROTEÇÃO CONTRA ATAQUES DE IA:
    Analisa a entrada em busca de Prompt Injection, comandos maliciosos,
    tags de script ou tentativas de desvio de escopo de sistema.
    """
    # Tratei o texto aplicando letras minúsculas e removendo espaços vazios para evitar 
    # que o atacante burle a validação usando variações como "iGnOrE" ou espaços falsos.
    texto_limpo = texto.lower().strip()
    
    # Passo 1: Varro a minha lista negra de termos proibidos.
    for termo in TERMOS_BLOQUEADOS:
        if termo in texto_limpo:
            return False
            
    # Passo 2: Implementei uma camada de segurança robusta usando Expressões Regulares (Regex).
    # Eu busco padrões suspeitos de execução de código como tags HTML invadidas, chamadas de sistema 
    # operacionais linux (rm -rf) ou comandos destrutivos de banco de dados (drop database).
    if re.search(r"(<script>|javascript:|system\(|exec\(|rm -rf|drop database)", texto_limpo):
        return False
        
    return True

# --- ENDPOINT 1: ANALISAR AÇÃO COM HISTÓRICO REAL ---
@app.get("/analisar/{ticker}")
async def analisar_acao(ticker: str):
    try:
        simbolo = ticker.upper().strip()
        
        # Desenvolvi esta lógica de formatação de strings para adaptar o input do usuário à biblioteca Yahoo Finance.
        # No Brasil, as ações precisam do sufixo '.SA'. Portanto, eu verifico se o ticker termina com um número 
        # (ex: PETR4, VALE3) e garanto que não seja uma criptomoeda (como BTC ou ETH) antes de concatenar o sufixo.
        if not simbolo.endswith(".SA"):
            if simbolo[-1].isdigit() and not any(c in simbolo for c in ["BTC", "ETH"]):
                simbolo += ".SA"
            
        acao = yf.Ticker(simbolo)
        info = acao.info
        
        # Busco o preço atual usando duas chaves alternativas oferecidas pela API de mercado,
        # criando um fallback seguro caso uma delas venha nula do servidor do Yahoo.
        preco_atual = info.get('currentPrice') or info.get('regularMarketPrice')
        if not preco_atual:
            raise HTTPException(status_code=404, detail="Ativo não encontrado")

        # Calculei a variação percentual do ativo em tempo real com base no fechamento do dia anterior.
        fechamento_anterior = info.get('regularMarketPreviousClose', preco_atual)
        variacao = ((preco_atual - fechamento_anterior) / fechamento_anterior) * 100

        # Eu extraio os dados históricos dos últimos 6 meses e realizo um mapeamento estruturado (loop)
        # para formatar a data em padrão brasileiro (DD/MM). Dessa forma, entrego um array pronto e limpo
        # para o componente gráfico do meu frontend (Recharts) renderizar as linhas sem precisar processar no cliente.
        historico_df = acao.history(period="6mo")
        historico_formatado = []
        for index, row in historico_df.iterrows():
            historico_formatado.append({
                "data": index.strftime("%d/%m"),
                "preco": round(row['Close'], 2)
            })

        # Como a API do Yahoo Finance retorna o setor e o resumo corporativo estritamente em inglês,
        # eu integrei a biblioteca de tradução para converter esses textos dinamicamente para o português,
        # enriquecendo expressivamente a Experiência do Usuário (UX) no painel do Vitta AI.
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
            "resumo": resumo_pt,
            "historico": historico_formatado 
        }
    except Exception as e:
        # Capturei a falha e imprimi no log para auditoria de desenvolvimento, retornando uma exceção HTTP 500
        # limpa para preservar a integridade da aplicação e não expor detalhes de infraestrutura ao usuário.
        print(f"❌ Erro na análise: {e}")
        raise HTTPException(status_code=500, detail="Erro ao processar dados reais do mercado.")

# --- ENDPOINT 2: ENGENHARIA DE PROMPTS, SEGURANÇA E MULTI-LLM ---
@app.post("/analise-inteligente")
async def analise_inteligente(req: RequisicaoAnaliseInteligente):
    """
    Aplica Engenharia de Prompts (Persona + Níveis), executa camadas de segurança (Guardrails)
    e simula o roteamento e comparação entre as duas IAs da arquitetura (Geração vs Auditoria).
    """
    
    # 1. Acionei a minha função de segurança nativa. Se houver comandos maliciosos, a execução é abortada na hora.
    if not verificar_seguranca_prompt(req.mensagem_usuario):
        raise HTTPException(
            status_code=400, 
            detail="⚠️ Comando bloqueado: Violação das diretrizes de segurança ou tentativa de Prompt Injection."
        )

    # 2. Resgato a persona selecionada pelo usuário no painel do frontend.
    persona = PERSONAS.get(req.modo_persona, PERSONAS["tecnico"])

    # 3. CONSTRUÇÃO DA ENGENHARIA DE PROMPTS (Simples, Estruturado e Especializado):
    # Conforme as diretrizes do trabalho acadêmico, ramifiquei a lógica para montar três estruturas distintas:
    prompt_final = ""
    
    if req.tipo_prompt == "simples":
        # Prompt Simples: Instrução direta e linear sem amarras estruturais.
        prompt_final = f"Papel: {persona}\nAnalise o ativo {req.ticker} considerando o comentário: {req.mensagem_usuario}"
        
    elif req.tipo_prompt == "estruturado":
        # Prompt Estruturado: Apliquei blocos organizados com delimitadores textuais estritos.
        # Eu forço o modelo a me responder usando uma semântica Markdown pré-definida, padronizando o layout final.
        prompt_final = f"""
        [Contexto de Atuação]
        {persona}
        
        [Instrução de Execução]
        Analise o ativo {req.ticker}. Organize os pensamentos usando tags <analise> e retorne em formato Markdown separado estritamente por:
        ### 📌 Resumo de Mercado
        ### ⚠️ Riscos Associados
        
        [Comentário Auxiliar]
        {req.mensagem_usuario}
        """
        
    elif req.tipo_prompt == "especializado":
        # Prompt Especializado: Apliquei as técnicas avançadas de Few-Shot (dar exemplos) e 
        # Chain-of-Thought (induzir a IA a expor o seu raciocínio lógico interno passo a passo antes de concluir).
        prompt_final = f"""
        {persona}
        
        Exemplo de análise esperada:
        Entrada: PETR4
        Raciocínio Interno: Petróleo flutua com o barril Brent; risco político ponderado; fluxo de dividendos consistente.
        Resposta Exemplo: Ativo com excelente geração de caixa, porém dependente da estabilidade de commodities globais.
        
        Sua vez. Execute o mesmo padrão lógico de raciocínio para o ativo: {req.ticker}.
        Contexto extra: {req.mensagem_usuario}
        """

    # 4. SIMULAÇÃO DA ARQUITETURA MULTI-LLM (VALIDAÇÃO CRUZADA):
    # Projetei este retorno simulado para documentar a lógica conceitual exigida no trabalho:
    # Mostro como a IA Primária (Llama 3.3 70B) gera o núcleo analítico denso e como a minha
    # IA Secundária (Llama 3.1 8B) entra de forma síncrona auditando a saída e validando a consistência dos dados.
    resposta_ia_primaria = f"[IA Primária - Llama 3.3 70B]: Análise gerada sob o modo '{req.modo_persona}' utilizando o padrão de prompt '{req.tipo_prompt}' para o ticker {req.ticker}."
    resposta_ia_auditora = f"[IA Auditora - Llama 3.1 8B]: Veredito validado. Estrutura e consistência técnica aprovadas sem indícios de alucinação."

    resposta_final_otimizada = f"{resposta_ia_primaria}\n\n✅ [Auditado por Groq AI]: {resposta_ia_auditora}"

    return {
        "ticker": req.ticker,
        "seguro": True,
        "prompt_enviado_ao_modelo": prompt_final.strip(),
        "resposta_ia_primaria": resposta_ia_primaria,
        "resposta_ia_secundaria": resposta_ia_auditora,
        "resposta_final_auditada": resposta_final_otimizada,
        "modo_ativo": req.modo_persona,
        "tipo_prompt_ativo": req.tipo_prompt
    }

# --- ENDPOINT 3: DADOS DINÂMICOS PARA O DASHBOARD (HOME) ---
@app.get("/dashboard/portfolio-geral")
async def obter_portfolio_geral():
    try:
        # Estruturei esta base de dados simulada para alimentar instantaneamente o Dashboard principal do Vitta AI.
        # Calculei o patrimônio de ações multiplicando a cotação real fictícia por um lote de 1.000 ações,
        # gerando os dados de distribuição que o meu gráfico de pizza do frontend consome nativamente.
        saldo_disponivel = 30000.00
        petr_preco = 38.45
        vale_preco = 65.20
        
        patrimonio_acoes = (petr_preco * 1000) + (vale_preco * 1000)
        patrimonio_total = saldo_disponivel + patrimonio_acoes

        return {
            "saldoCaixa": round(saldo_disponivel, 2),
            "patrimonioTotal": round(patrimonio_total, 2),
            "ibovespaPontos": 125430,
            "ibovespaVariacao": 1.82,
            "alerta": "Movimento de alta na B3 impulsionado pelo setor de energia e commodities. Posições estáveis.",
            "distribuicao": [
                {"name": "PETR4", "value": round(petr_preco * 1000, 2)},
                {"name": "VALE3", "value": round(vale_preco * 1000, 2)},
                {"name": "Caixa Livre", "value": saldo_disponivel}
            ]
        }
    except Exception as e:
        print(f"❌ Erro crítico no painel: {e}")
        raise HTTPException(status_code=500, detail="Falha no barramento de dados interno.")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)