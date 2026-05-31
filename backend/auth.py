import os
import smtplib
from email.message import EmailMessage

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from auth_security import (
    expiracao_reset,
    expiracao_sessao,
    gerar_hash_senha,
    gerar_hash_token,
    gerar_token,
    senha_esta_hasheada,
    verificar_senha,
)
from database import database
from schemas import (
    PasswordChange,
    PasswordResetConfirm,
    PasswordResetRequest,
    ProfileUpdate,
    UserLogin,
    UserRegister,
)
from storage import garantir_perfil


router = APIRouter(prefix="/auth", tags=["Autenticação"])
security = HTTPBearer(auto_error=False)


def _serializar_usuario(user) -> dict:
    return {
        "id": str(user["id"]),
        "nome": user["name"],
        "email": user["email"],
    }


async def _buscar_usuario_por_email(email: str):
    return await database.fetch_one(
        """
        SELECT u.id, u.name, u.email, a."password"
        FROM neon_auth."user" u
        JOIN neon_auth.account a ON u.id = a."userId"
        WHERE LOWER(u.email) = LOWER(:email)
        LIMIT 1
        """,
        {"email": email},
    )


async def _criar_sessao(user_id: str) -> str:
    token = gerar_token()
    await database.execute(
        """
        INSERT INTO vitta_sessions (token_hash, user_id, expires_at)
        VALUES (:token_hash, :user_id, :expires_at)
        """,
        {
            "token_hash": gerar_hash_token(token),
            "user_id": str(user_id),
            "expires_at": expiracao_sessao(),
        },
    )
    return token


async def obter_usuario_atual(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
):
    if not credentials:
        raise HTTPException(status_code=401, detail="Sessão não autenticada.")
    user = await database.fetch_one(
        """
        SELECT u.id, u.name, u.email
        FROM vitta_sessions s
        JOIN neon_auth."user" u ON CAST(u.id AS TEXT) = s.user_id
        WHERE s.token_hash = :token_hash AND s.expires_at > NOW()
        """,
        {"token_hash": gerar_hash_token(credentials.credentials)},
    )
    if not user:
        raise HTTPException(status_code=401, detail="Sessão expirada ou inválida.")
    return user


async def obter_usuario_opcional(
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
):
    if not credentials:
        return None
    return await obter_usuario_atual(credentials)


@router.post("/login")
async def login(dados: UserLogin):
    user = await _buscar_usuario_por_email(dados.email)
    if not user:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    senha_armazenada = user["password"]
    senha_valida = verificar_senha(dados.senha, senha_armazenada)
    senha_legada_valida = not senha_esta_hasheada(senha_armazenada) and dados.senha == senha_armazenada
    if not senha_valida and not senha_legada_valida:
        raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

    if senha_legada_valida:
        await database.execute(
            """
            UPDATE neon_auth.account SET "password" = :password
            WHERE "userId" = :user_id
            """,
            {"password": gerar_hash_senha(dados.senha), "user_id": user["id"]},
        )

    await garantir_perfil(str(user["id"]))
    token = await _criar_sessao(str(user["id"]))
    return {"status": "success", "token": token, "usuario": _serializar_usuario(user)}


@router.post("/cadastro", status_code=201)
async def register(user: UserRegister):
    if await _buscar_usuario_por_email(user.email):
        raise HTTPException(status_code=409, detail="Já existe uma conta com este e-mail.")
    async with database.transaction():
        try:
            user_id = await database.execute(
                """
                INSERT INTO neon_auth."user" (name, email)
                VALUES (:name, :email)
                RETURNING id
                """,
                {"name": user.nome.strip(), "email": user.email.lower()},
            )
            await database.execute(
                """
                INSERT INTO neon_auth.account ("userId", "password")
                VALUES (:user_id, :password)
                """,
                {"user_id": user_id, "password": gerar_hash_senha(user.senha)},
            )
            await garantir_perfil(str(user_id))
        except HTTPException:
            raise
        except Exception as error:
            print(f"Erro ao cadastrar conta: {error}")
            raise HTTPException(status_code=400, detail="Não foi possível criar a conta.") from error
    return {"status": "success", "message": "Conta criada com sucesso."}


@router.post("/logout", status_code=204)
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    _user=Depends(obter_usuario_atual),
):
    await database.execute(
        "DELETE FROM vitta_sessions WHERE token_hash = :token_hash",
        {"token_hash": gerar_hash_token(credentials.credentials)},
    )


def _enviar_email_reset(destinatario: str, reset_url: str) -> None:
    email_origem = os.getenv("GMAIL_EMAIL")
    senha_app = os.getenv("GMAIL_APP_PASSWORD")
    if not email_origem or not senha_app:
        print("Recuperação de senha solicitada, mas SMTP não está configurado.")
        return
    message = EmailMessage()
    message["Subject"] = "Redefinição de senha - Vitta AI"
    message["From"] = email_origem
    message["To"] = destinatario
    message.set_content(
        "Recebemos uma solicitação para redefinir sua senha no Vitta AI.\n\n"
        f"Acesse este link em até 30 minutos:\n{reset_url}\n\n"
        "Se você não fez esta solicitação, ignore este e-mail."
    )
    try:
        with smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10) as smtp:
            smtp.login(email_origem, senha_app)
            smtp.send_message(message)
    except Exception as error:
        print(f"Falha ao enviar e-mail de recuperação: {error}")


@router.post("/solicitar-reset")
async def solicitar_reset(dados: PasswordResetRequest, background_tasks: BackgroundTasks):
    user = await _buscar_usuario_por_email(dados.email)
    if user:
        token = gerar_token()
        await database.execute(
            """
            INSERT INTO vitta_password_resets (token_hash, user_id, expires_at)
            VALUES (:token_hash, :user_id, :expires_at)
            """,
            {
                "token_hash": gerar_hash_token(token),
                "user_id": str(user["id"]),
                "expires_at": expiracao_reset(),
            },
        )
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173").rstrip("/")
        background_tasks.add_task(
            _enviar_email_reset,
            user["email"],
            f"{frontend_url}/resetar-senha?token={token}",
        )
    return {"message": "Se o e-mail estiver cadastrado, enviaremos um link de recuperação."}


@router.post("/resetar-senha")
async def resetar_senha(dados: PasswordResetConfirm):
    reset = await database.fetch_one(
        """
        SELECT user_id FROM vitta_password_resets
        WHERE token_hash = :token_hash AND used_at IS NULL AND expires_at > NOW()
        """,
        {"token_hash": gerar_hash_token(dados.token)},
    )
    if not reset:
        raise HTTPException(status_code=400, detail="Link expirado ou inválido.")
    async with database.transaction():
        await database.execute(
            """
            UPDATE neon_auth.account SET "password" = :password
            WHERE CAST("userId" AS TEXT) = :user_id
            """,
            {"password": gerar_hash_senha(dados.nova_senha), "user_id": reset["user_id"]},
        )
        await database.execute(
            "UPDATE vitta_password_resets SET used_at = NOW() WHERE token_hash = :token_hash",
            {"token_hash": gerar_hash_token(dados.token)},
        )
        await database.execute(
            "DELETE FROM vitta_sessions WHERE user_id = :user_id",
            {"user_id": reset["user_id"]},
        )
    return {"message": "Senha alterada com sucesso."}


@router.post("/alterar-senha")
async def alterar_senha(dados: PasswordChange, user=Depends(obter_usuario_atual)):
    conta = await database.fetch_one(
        'SELECT "password" FROM neon_auth.account WHERE "userId" = :user_id',
        {"user_id": user["id"]},
    )
    if not conta or not verificar_senha(dados.senha_atual, conta["password"]):
        raise HTTPException(status_code=400, detail="Senha atual incorreta.")
    await database.execute(
        'UPDATE neon_auth.account SET "password" = :password WHERE "userId" = :user_id',
        {"password": gerar_hash_senha(dados.nova_senha), "user_id": user["id"]},
    )
    return {"message": "Senha alterada com sucesso."}


@router.get("/profile")
async def obter_perfil(user=Depends(obter_usuario_atual)):
    user_id = str(user["id"])
    await garantir_perfil(user_id)
    profile = await database.fetch_one(
        "SELECT * FROM vitta_profiles WHERE user_id = :user_id",
        {"user_id": user_id},
    )
    stats = await database.fetch_one(
        """
        SELECT
            COUNT(*) FILTER (WHERE activity_type = 'analysis') AS analyses,
            COUNT(*) FILTER (WHERE activity_type = 'simulation') AS simulations,
            COUNT(*) FILTER (WHERE activity_type = 'comparison') AS comparisons
        FROM vitta_activities WHERE user_id = :user_id
        """,
        {"user_id": user_id},
    )
    alerts = await database.fetch_val(
        "SELECT COUNT(*) FROM vitta_alerts WHERE user_id = :user_id AND active = TRUE",
        {"user_id": user_id},
    )
    return {
        "nome": user["name"],
        "email": user["email"],
        "telefone": profile["phone"],
        "perfilRisco": profile["risk_profile"],
        "notificacoes": {
            "precos": profile["notify_prices"],
            "ia": profile["notify_ai"],
            "newsletters": profile["notify_newsletters"],
        },
        "estatisticas": {
            "analises": stats["analyses"],
            "simulacoes": stats["simulations"],
            "comparacoes": stats["comparisons"],
            "alertas": alerts,
        },
    }


@router.put("/profile")
async def atualizar_perfil(dados: ProfileUpdate, user=Depends(obter_usuario_atual)):
    if dados.perfil_risco not in {"Conservador", "Moderado", "Agressivo"}:
        raise HTTPException(status_code=422, detail="Perfil de risco inválido.")
    async with database.transaction():
        await database.execute(
            'UPDATE neon_auth."user" SET name = :name WHERE id = :user_id',
            {"name": dados.nome.strip(), "user_id": user["id"]},
        )
        await database.execute(
            """
            UPDATE vitta_profiles SET
                phone = :phone,
                risk_profile = :risk_profile,
                notify_prices = :notify_prices,
                notify_ai = :notify_ai,
                notify_newsletters = :notify_newsletters,
                updated_at = NOW()
            WHERE user_id = :user_id
            """,
            {
                "phone": dados.telefone.strip(),
                "risk_profile": dados.perfil_risco,
                "notify_prices": dados.notificacoes_precos,
                "notify_ai": dados.notificacoes_ia,
                "notify_newsletters": dados.newsletters,
                "user_id": str(user["id"]),
            },
        )
    return {"message": "Perfil atualizado com sucesso."}
