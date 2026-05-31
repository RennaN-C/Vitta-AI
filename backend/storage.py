from database import database


SCHEMA_STATEMENTS = [
    """
    CREATE TABLE IF NOT EXISTS vitta_profiles (
        user_id TEXT PRIMARY KEY,
        phone TEXT NOT NULL DEFAULT '',
        risk_profile TEXT NOT NULL DEFAULT 'Moderado',
        notify_prices BOOLEAN NOT NULL DEFAULT TRUE,
        notify_ai BOOLEAN NOT NULL DEFAULT TRUE,
        notify_newsletters BOOLEAN NOT NULL DEFAULT FALSE,
        cash_balance NUMERIC(16, 2) NOT NULL DEFAULT 0,
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS vitta_sessions (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS vitta_password_resets (
        token_hash TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMPTZ NOT NULL,
        used_at TIMESTAMPTZ
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS vitta_portfolio_positions (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        ticker TEXT NOT NULL,
        quantity NUMERIC(18, 6) NOT NULL CHECK (quantity >= 0),
        UNIQUE(user_id, ticker)
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS vitta_activities (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        activity_type TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        ticker TEXT,
        metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS vitta_alerts (
        id BIGSERIAL PRIMARY KEY,
        user_id TEXT NOT NULL,
        ticker TEXT NOT NULL,
        alert_type TEXT NOT NULL,
        target_value NUMERIC(16, 4) NOT NULL,
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
    """
    CREATE TABLE IF NOT EXISTS vitta_alert_notifications (
        id BIGSERIAL PRIMARY KEY,
        alert_id BIGINT NOT NULL REFERENCES vitta_alerts(id) ON DELETE CASCADE,
        user_id TEXT NOT NULL,
        ticker TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
    """,
]


async def inicializar_tabelas() -> None:
    for statement in SCHEMA_STATEMENTS:
        await database.execute(statement)


async def garantir_perfil(user_id: str) -> None:
    await database.execute(
        """
        INSERT INTO vitta_profiles (user_id)
        VALUES (:user_id)
        ON CONFLICT (user_id) DO NOTHING
        """,
        {"user_id": str(user_id)},
    )


async def registrar_atividade(
    user_id: str,
    activity_type: str,
    title: str,
    description: str = "",
    ticker: str | None = None,
    metadata_json: str = "{}",
) -> None:
    await database.execute(
        """
        INSERT INTO vitta_activities
            (user_id, activity_type, title, description, ticker, metadata_json)
        SELECT
            :user_id, :activity_type, :title, :description, :ticker, CAST(:metadata_json AS JSONB)
        WHERE NOT EXISTS (
            SELECT 1 FROM vitta_activities
            WHERE user_id = :user_id
              AND activity_type = :activity_type
              AND title = :title
              AND created_at >= NOW() - INTERVAL '5 seconds'
        )
        """,
        {
            "user_id": str(user_id),
            "activity_type": activity_type,
            "title": title,
            "description": description,
            "ticker": ticker,
            "metadata_json": metadata_json,
        },
    )
