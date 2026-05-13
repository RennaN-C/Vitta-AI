import os
import yfinance as yf
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from deep_translator import GoogleTranslator
from database import database
import auth
import chatbot

app = FastAPI(title="Vitta AI Backend")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
  
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


app.include_router(auth.router)
app.include_router(chatbot.router)


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
        print(f"❌ Erro na análise: {e}")
        raise HTTPException(status_code=500, detail="Erro ao processar dados reais do mercado.")

if __name__ == "__main__":
    import uvicorn
    
    uvicorn.run(app, host="0.0.0.0", port=8000)