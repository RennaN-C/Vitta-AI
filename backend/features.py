import json
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.concurrency import run_in_threadpool

from auth import obter_usuario_atual
from database import database
from market import calcular_comparacao, obter_snapshot, obter_tendencias, simular_investimento
from schemas import AlertCreate, CompareRequest, SimulationRequest
from storage import registrar_atividade


router = APIRouter(tags=["Funcionalidades"])


@router.post("/comparar")
async def comparar(dados: CompareRequest, user=Depends(obter_usuario_atual)):
    resultado = await run_in_threadpool(calcular_comparacao, dados.ticker1, dados.ticker2)
    await registrar_atividade(
        str(user["id"]),
        "comparison",
        f"Comparação {resultado['ativo1']['ticker']} vs {resultado['ativo2']['ticker']}",
        resultado["resumo"],
        metadata_json=json.dumps(
            {
                "ticker1": resultado["ativo1"]["ticker"],
                "ticker2": resultado["ativo2"]["ticker"],
            }
        ),
    )
    return resultado


@router.post("/simulador")
async def simular(dados: SimulationRequest, user=Depends(obter_usuario_atual)):
    resultado = await run_in_threadpool(
        simular_investimento,
        dados.ticker,
        dados.valor_inicial,
        dados.meses,
    )
    await registrar_atividade(
        str(user["id"]),
        "simulation",
        f"Simulação {resultado['ticker']}",
        (
            f"R$ {resultado['valorInicial']:.2f} por {dados.meses} meses · "
            f"Retorno histórico: {resultado['rentabilidade']:+.2f}%"
        ),
        ticker=resultado["ticker"],
        metadata_json=json.dumps(resultado),
    )
    return resultado


@router.get("/tendencias")
async def tendencias(_user=Depends(obter_usuario_atual)):
    return await run_in_threadpool(obter_tendencias)


def _descricao_alerta(tipo: str, valor: float) -> str:
    if tipo == "preco_acima":
        return f"Quando atingir R$ {valor:.2f}"
    if tipo == "variacao_acima":
        return f"Quando variar +{valor:.2f}%"
    if tipo == "variacao_abaixo":
        return f"Quando variar {valor:.2f}%"
    raise HTTPException(status_code=422, detail="Tipo de alerta inválido.")


async def _avaliar_alertas(user_id: str, alerts) -> None:
    for alert in alerts:
        try:
            snapshot = await run_in_threadpool(obter_snapshot, alert["ticker"], False)
        except Exception:
            continue
        tipo = alert["alert_type"]
        alvo = float(alert["target_value"])
        disparou = (
            (tipo == "preco_acima" and snapshot["preco"] >= alvo)
            or (tipo == "variacao_acima" and snapshot["variacao"] >= alvo)
            or (tipo == "variacao_abaixo" and snapshot["variacao"] <= alvo)
        )
        if not disparou:
            continue
        ja_notificado = await database.fetch_val(
            """
            SELECT EXISTS(
                SELECT 1 FROM vitta_alert_notifications
                WHERE alert_id = :alert_id AND created_at >= CURRENT_DATE
            )
            """,
            {"alert_id": alert["id"]},
        )
        if ja_notificado:
            continue
        if tipo == "preco_acima":
            mensagem = f"Atingiu R$ {snapshot['preco']:.2f} ({snapshot['variacao']:+.2f}%)"
        else:
            mensagem = f"Variação diária atingiu {snapshot['variacao']:+.2f}%"
        await database.execute(
            """
            INSERT INTO vitta_alert_notifications (alert_id, user_id, ticker, message)
            VALUES (:alert_id, :user_id, :ticker, :message)
            """,
            {
                "alert_id": alert["id"],
                "user_id": user_id,
                "ticker": snapshot["ticker"],
                "message": mensagem,
            },
        )


@router.get("/alertas")
async def listar_alertas(user=Depends(obter_usuario_atual)):
    user_id = str(user["id"])
    alerts = await database.fetch_all(
        """
        SELECT id, ticker, alert_type, target_value, active, created_at
        FROM vitta_alerts
        WHERE user_id = :user_id AND active = TRUE
        ORDER BY created_at DESC
        """,
        {"user_id": user_id},
    )
    await _avaliar_alertas(user_id, alerts)
    notifications = await database.fetch_all(
        """
        SELECT id, ticker, message, created_at
        FROM vitta_alert_notifications
        WHERE user_id = :user_id
        ORDER BY created_at DESC
        LIMIT 10
        """,
        {"user_id": user_id},
    )
    disparados_hoje = await database.fetch_val(
        """
        SELECT COUNT(*) FROM vitta_alert_notifications
        WHERE user_id = :user_id AND created_at >= CURRENT_DATE
        """,
        {"user_id": user_id},
    )
    disparados_semana = await database.fetch_val(
        """
        SELECT COUNT(*) FROM vitta_alert_notifications
        WHERE user_id = :user_id AND created_at >= NOW() - INTERVAL '7 days'
        """,
        {"user_id": user_id},
    )
    return {
        "estatisticas": {
            "ativos": len(alerts),
            "hoje": disparados_hoje,
            "semana": disparados_semana,
        },
        "alertas": [
            {
                "id": alert["id"],
                "ticker": alert["ticker"],
                "tipo": alert["alert_type"],
                "valor": float(alert["target_value"]),
                "descricao": _descricao_alerta(alert["alert_type"], float(alert["target_value"])),
            }
            for alert in alerts
        ],
        "notificacoes": [
            {
                "id": notification["id"],
                "ticker": notification["ticker"],
                "mensagem": notification["message"],
                "criadoEm": notification["created_at"].isoformat(),
            }
            for notification in notifications
        ],
    }


@router.post("/alertas", status_code=201)
async def criar_alerta(dados: AlertCreate, user=Depends(obter_usuario_atual)):
    _descricao_alerta(dados.tipo, dados.valor)
    snapshot = await run_in_threadpool(obter_snapshot, dados.ticker, False)
    alert_id = await database.execute(
        """
        INSERT INTO vitta_alerts (user_id, ticker, alert_type, target_value)
        VALUES (:user_id, :ticker, :alert_type, :target_value)
        RETURNING id
        """,
        {
            "user_id": str(user["id"]),
            "ticker": snapshot["ticker"],
            "alert_type": dados.tipo,
            "target_value": dados.valor,
        },
    )
    return {"id": alert_id, "message": "Alerta criado com sucesso."}


@router.delete("/alertas/{alert_id}", status_code=204)
async def excluir_alerta(alert_id: int, user=Depends(obter_usuario_atual)):
    await database.execute(
        "DELETE FROM vitta_alerts WHERE id = :alert_id AND user_id = :user_id",
        {"alert_id": alert_id, "user_id": str(user["id"])},
    )


@router.get("/historico")
async def historico(user=Depends(obter_usuario_atual)):
    user_id = str(user["id"])
    activities = await database.fetch_all(
        """
        SELECT id, activity_type, title, description, ticker, metadata_json, created_at
        FROM vitta_activities
        WHERE user_id = :user_id
        ORDER BY created_at DESC
        LIMIT 100
        """,
        {"user_id": user_id},
    )
    counts = await database.fetch_one(
        """
        SELECT
            COUNT(*) FILTER (WHERE activity_type = 'analysis') AS analyses,
            COUNT(*) FILTER (WHERE activity_type = 'simulation') AS simulations,
            COUNT(*) FILTER (WHERE activity_type = 'comparison') AS comparisons
        FROM vitta_activities WHERE user_id = :user_id
        """,
        {"user_id": user_id},
    )
    tickers = await database.fetch_all(
        """
        SELECT ticker, COUNT(*) AS total
        FROM vitta_activities
        WHERE user_id = :user_id AND activity_type = 'analysis' AND ticker IS NOT NULL
        GROUP BY ticker
        ORDER BY total DESC, ticker
        LIMIT 4
        """,
        {"user_id": user_id},
    )
    return {
        "estatisticas": {
            "analises": counts["analyses"],
            "simulacoes": counts["simulations"],
            "comparacoes": counts["comparisons"],
        },
        "atividades": [
            {
                "id": activity["id"],
                "tipo": activity["activity_type"],
                "titulo": activity["title"],
                "descricao": activity["description"],
                "ticker": activity["ticker"],
                "metadata": activity["metadata_json"],
                "criadoEm": activity["created_at"].isoformat(),
            }
            for activity in activities
        ],
        "maisAnalisadas": [
            {"ticker": item["ticker"], "total": item["total"]}
            for item in tickers
        ],
        "geradoEm": datetime.now(timezone.utc).isoformat(),
    }
