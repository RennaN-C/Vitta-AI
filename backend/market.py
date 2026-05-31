import math
import urllib.request
from datetime import datetime
from statistics import pstdev

import yfinance as yf
from deep_translator import GoogleTranslator
from fastapi import HTTPException


WATCHLIST = ["PETR4", "VALE3", "ITUB4", "AAPL", "MGLU3"]
SECTOR_TICKERS = {
    "Tecnologia": ["AAPL", "MSFT"],
    "Petróleo": ["PETR4", "PRIO3"],
    "Bancos": ["ITUB4", "BBDC4"],
    "Mineração": ["VALE3"],
    "Varejo": ["MGLU3", "LREN3"],
    "Energia": ["EGIE3", "TAEE11"],
}


def normalizar_ticker(ticker: str) -> str:
    simbolo = ticker.upper().strip()
    if not simbolo:
        raise HTTPException(status_code=400, detail="Informe um ticker válido.")
    if "." not in simbolo and simbolo[-1].isdigit() and not simbolo.endswith(("-USD", "BTC", "ETH")):
        simbolo += ".SA"
    return simbolo


def ticker_exibicao(simbolo: str) -> str:
    return simbolo.removesuffix(".SA")


def traduzir_com_fallback(texto: str) -> str:
    if not texto or texto == "N/A":
        return texto or "N/A"
    try:
        return GoogleTranslator(source="en", target="pt").translate(texto)
    except Exception:
        return texto


def _historico(simbolo: str, period: str = "6mo"):
    historico = yf.Ticker(simbolo).history(period=period, auto_adjust=False)
    if historico.empty or "Close" not in historico:
        raise HTTPException(status_code=404, detail="Ativo não encontrado.")
    return historico.dropna(subset=["Close"])


def obter_snapshot(ticker: str, traduzir: bool = True) -> dict:
    simbolo = normalizar_ticker(ticker)
    acao = yf.Ticker(simbolo)
    historico = _historico(simbolo)
    info = {}
    try:
        info = acao.info or {}
    except Exception:
        info = {}
    preco_atual = float(historico["Close"].iloc[-1])
    fechamento_anterior = float(historico["Close"].iloc[-2]) if len(historico) > 1 else preco_atual
    variacao = ((preco_atual - fechamento_anterior) / fechamento_anterior) * 100 if fechamento_anterior else 0
    setor = info.get("sector", "N/A")
    resumo = info.get("longBusinessSummary", "Resumo corporativo indisponível.")
    return {
        "ticker": ticker_exibicao(simbolo),
        "simbolo": simbolo,
        "nomeEmpresa": info.get("longName") or info.get("shortName") or ticker_exibicao(simbolo),
        "preco": round(preco_atual, 2),
        "variacao": round(variacao, 2),
        "setor": (traduzir_com_fallback(setor) if traduzir else setor).upper(),
        "dividendYield": round(float(info.get("dividendYield") or 0), 2),
        "volume": int(info.get("regularMarketVolume") or 0),
        "resumo": traduzir_com_fallback(resumo) if traduzir else resumo,
        "historico": [
            {"data": index.strftime("%d/%m/%Y"), "preco": round(float(row["Close"]), 2)}
            for index, row in historico.iterrows()
        ],
    }


def obter_ibovespa() -> dict:
    historico = _historico("^BVSP", "5d")
    atual = float(historico["Close"].iloc[-1])
    anterior = float(historico["Close"].iloc[-2]) if len(historico) > 1 else atual
    variacao = ((atual - anterior) / anterior) * 100 if anterior else 0
    return {"pontos": round(atual), "variacao": round(variacao, 2)}


def obter_selic() -> float | None:
    try:
        url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.432/dados/ultimos/1?formato=json"
        with urllib.request.urlopen(url, timeout=5) as response:
            import json

            dados = json.loads(response.read().decode("utf-8"))
            return float(dados[-1]["valor"].replace(",", "."))
    except Exception:
        return None


def calcular_metricas(ticker: str, period: str = "6mo") -> dict:
    simbolo = normalizar_ticker(ticker)
    historico = _historico(simbolo, period)
    closes = [float(valor) for valor in historico["Close"].tolist()]
    retornos = [
        ((closes[index] / closes[index - 1]) - 1) * 100
        for index in range(1, len(closes))
        if closes[index - 1]
    ]
    crescimento = ((closes[-1] / closes[0]) - 1) * 100 if closes[0] else 0
    volatilidade = pstdev(retornos) if len(retornos) > 1 else 0
    return {
        "ticker": ticker_exibicao(simbolo),
        "simbolo": simbolo,
        "crescimento": round(crescimento, 2),
        "volatilidade": round(volatilidade, 2),
        "retornos": retornos,
        "historico": historico,
    }


def simular_investimento(ticker: str, valor_inicial: float, meses: int) -> dict:
    simbolo = normalizar_ticker(ticker)
    historico = _historico(simbolo, f"{max(meses, 1)}mo")
    mensal = historico["Close"].resample("ME").last().dropna()
    if mensal.empty:
        mensal = historico["Close"]
    if len(mensal) < 2:
        raise HTTPException(status_code=422, detail="Histórico insuficiente para simular o ativo.")
    mensal = mensal.tail(meses + 1)
    base = float(mensal.iloc[0])
    evolucao = [
        {
            "mes": "Início" if index == 0 else f"{index}m",
            "valor": round(valor_inicial * (float(preco) / base), 2),
        }
        for index, preco in enumerate(mensal)
    ]
    valor_final = evolucao[-1]["valor"]
    lucro = valor_final - valor_inicial
    rentabilidade = (lucro / valor_inicial) * 100
    retornos = mensal.pct_change().dropna() * 100
    return {
        "ticker": ticker_exibicao(simbolo),
        "valorInicial": round(valor_inicial, 2),
        "valorFinal": round(valor_final, 2),
        "lucro": round(lucro, 2),
        "rentabilidade": round(rentabilidade, 2),
        "retornoMensalMedio": round(float(retornos.mean()), 2),
        "retornoAnualEstimado": round(((1 + float(retornos.mean()) / 100) ** 12 - 1) * 100, 2),
        "melhorMes": round(float(retornos.max()), 2),
        "piorMes": round(float(retornos.min()), 2),
        "evolucao": evolucao,
        "meses": meses,
        "aviso": "A simulação usa o histórico real do ativo. Rentabilidade passada não garante resultados futuros.",
    }


def _score_momentum(crescimento: float, volatilidade: float) -> int:
    bruto = 50 + crescimento * 2 - volatilidade
    return max(0, min(100, round(bruto)))


def obter_tendencias() -> dict:
    ativos = []
    for ticker in WATCHLIST:
        try:
            metricas = calcular_metricas(ticker, "1mo")
            snapshot = obter_snapshot(ticker, traduzir=False)
            ativos.append(
                {
                    "ticker": ticker,
                    "nome": snapshot["nomeEmpresa"],
                    "variacao": metricas["crescimento"],
                    "score": _score_momentum(metricas["crescimento"], metricas["volatilidade"]),
                }
            )
        except Exception:
            continue
    ativos.sort(key=lambda item: item["score"], reverse=True)
    score_geral = round(sum(item["score"] for item in ativos) / len(ativos)) if ativos else 0
    setores = []
    for setor, tickers in SECTOR_TICKERS.items():
        scores = []
        for ticker in tickers:
            try:
                metricas = calcular_metricas(ticker, "1mo")
                scores.append(_score_momentum(metricas["crescimento"], metricas["volatilidade"]))
            except Exception:
                continue
        setores.append({"setor": setor, "score": round(sum(scores) / len(scores)) if scores else 0})
    agora = datetime.now()
    try:
        indice_historico = _historico("^BVSP", "5d")["Close"]
        base_indice = float(indice_historico.iloc[0])
        evolucao = [
            {"dia": index.strftime("%a"), "indice": round((float(valor) / base_indice) * 100, 2)}
            for index, valor in indice_historico.items()
        ]
    except Exception:
        evolucao = []
    return {
        "tendencia": "Alta" if score_geral >= 55 else "Baixa" if score_geral < 45 else "Estável",
        "indice": score_geral,
        "confianca": min(100, round(abs(score_geral - 50) * 2)),
        "atualizadoEm": agora.isoformat(),
        "ativos": ativos,
        "setores": setores,
        "evolucao": evolucao,
        "probabilidades": {
            "alta": max(0, min(100, score_geral)),
            "estabilidade": max(0, 100 - abs(score_geral - 50) * 2),
            "baixa": max(0, min(100, 100 - score_geral)),
        },
        "metodologia": "Índice calculado com momentum e volatilidade do histórico recente. Não constitui recomendação de investimento.",
    }


def calcular_comparacao(ticker1: str, ticker2: str) -> dict:
    snapshot1 = obter_snapshot(ticker1)
    snapshot2 = obter_snapshot(ticker2)
    metricas1 = calcular_metricas(ticker1)
    metricas2 = calcular_metricas(ticker2)
    serie2 = {item["data"]: item["preco"] for item in snapshot2["historico"]}
    historico = [
        {"data": item["data"], "valor1": item["preco"], "valor2": serie2[item["data"]]}
        for item in snapshot1["historico"]
        if item["data"] in serie2
    ]
    menor_risco = snapshot1["ticker"] if metricas1["volatilidade"] <= metricas2["volatilidade"] else snapshot2["ticker"]
    maior_crescimento = snapshot1["ticker"] if metricas1["crescimento"] >= metricas2["crescimento"] else snapshot2["ticker"]
    melhor_dividendo = snapshot1["ticker"] if snapshot1["dividendYield"] >= snapshot2["dividendYield"] else snapshot2["ticker"]
    return {
        "ativo1": snapshot1,
        "ativo2": snapshot2,
        "historico": historico,
        "menorRisco": menor_risco,
        "maiorCrescimento": maior_crescimento,
        "melhorDividendo": melhor_dividendo,
        "resumo": (
            f"{menor_risco} apresentou menor volatilidade no histórico analisado. "
            f"{maior_crescimento} teve o maior crescimento acumulado no mesmo período."
        ),
    }
