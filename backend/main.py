import json
from typing import Any

from fastapi import Depends, FastAPI, HTTPException
from fastapi.concurrency import run_in_threadpool
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

import auth
import chatbot
import features
from auth import obter_usuario_atual, obter_usuario_opcional
from database import database
from market import obter_ibovespa, obter_selic, obter_snapshot
from security import verificar_seguranca_prompt
from storage import garantir_perfil, inicializar_tabelas, registrar_atividade


app = FastAPI(title="Vitta AI Backend")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class RequisicaoAnaliseInteligente(BaseModel):
    ticker: str
    modo_persona: str = "tecnico"
    tipo_prompt: str = "estruturado"
    mensagem_usuario: str = ""


@app.on_event("startup")
async def startup():
    await database.connect()
    await inicializar_tabelas()


@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()


app.include_router(auth.router)
app.include_router(chatbot.router)
app.include_router(features.router)


@app.get("/analisar/{ticker}")
async def analisar_acao(ticker: str, user=Depends(obter_usuario_opcional)):
    try:
        resultado = await run_in_threadpool(obter_snapshot, ticker)
        if user:
            await registrar_atividade(
                str(user["id"]),
                "analysis",
                f"Análise {resultado['ticker']}",
                f"Variação diária: {resultado['variacao']:+.2f}% · Setor: {resultado['setor']}",
                ticker=resultado["ticker"],
                metadata_json=json.dumps(
                    {
                        "preco": resultado["preco"],
                        "variacao": resultado["variacao"],
                        "setor": resultado["setor"],
                    }
                ),
            )
        return resultado
    except HTTPException:
        raise
    except Exception as error:
        print(f"Erro ao analisar ativo: {error}")
        raise HTTPException(status_code=502, detail="Não foi possível consultar o mercado agora.") from error


@app.post("/analise-inteligente")
async def analise_inteligente(req: RequisicaoAnaliseInteligente, _user=Depends(obter_usuario_atual)):
    if not verificar_seguranca_prompt(req.mensagem_usuario):
        raise HTTPException(status_code=400, detail="Comando bloqueado pelas diretrizes de segurança.")
    return {
        "ticker": req.ticker.upper(),
        "seguro": True,
        "modo_ativo": req.modo_persona,
        "tipo_prompt_ativo": req.tipo_prompt,
        "message": "Entrada validada. Use o assistente lateral para gerar a análise auditada.",
    }


@app.get("/dashboard/portfolio-geral")
async def obter_portfolio_geral(user=Depends(obter_usuario_atual)):
    user_id = str(user["id"])
    await garantir_perfil(user_id)
    profile = await database.fetch_one(
        "SELECT cash_balance FROM vitta_profiles WHERE user_id = :user_id",
        {"user_id": user_id},
    )
    positions = await database.fetch_all(
        """
        SELECT ticker, quantity FROM vitta_portfolio_positions
        WHERE user_id = :user_id AND quantity > 0
        ORDER BY ticker
        """,
        {"user_id": user_id},
    )
    distribuicao = []
    total_acoes = 0.0
    for position in positions:
        try:
            snapshot = await run_in_threadpool(obter_snapshot, position["ticker"], False)
        except Exception:
            continue
        valor = float(position["quantity"]) * snapshot["preco"]
        total_acoes += valor
        distribuicao.append({"name": snapshot["ticker"], "value": round(valor, 2)})
    saldo = float(profile["cash_balance"])
    if saldo:
        distribuicao.append({"name": "Caixa Livre", "value": round(saldo, 2)})
    try:
        ibovespa = await run_in_threadpool(obter_ibovespa)
    except Exception:
        ibovespa = {"pontos": None, "variacao": None}
    selic = await run_in_threadpool(obter_selic)
    return {
        "saldoCaixa": round(saldo, 2),
        "patrimonioTotal": round(saldo + total_acoes, 2),
        "ibovespaPontos": ibovespa["pontos"],
        "ibovespaVariacao": ibovespa["variacao"],
        "selic": selic,
        "alerta": (
            "Dados de mercado sincronizados com sucesso."
            if ibovespa["pontos"] is not None
            else "Mercado temporariamente indisponível. Tente atualizar em instantes."
        ),
        "distribuicao": distribuicao,
    }
