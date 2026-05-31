import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone


PASSWORD_ITERATIONS = 600_000
SESSION_EXPIRE_DAYS = 7
RESET_EXPIRE_MINUTES = 30


def gerar_hash_senha(senha: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", senha.encode("utf-8"), salt, PASSWORD_ITERATIONS)
    return f"pbkdf2_sha256${PASSWORD_ITERATIONS}${salt.hex()}${digest.hex()}"


def verificar_senha(senha_plana: str, senha_armazenada: str) -> bool:
    try:
        algoritmo, iteracoes, salt_hex, digest_hex = senha_armazenada.split("$", 3)
        if algoritmo != "pbkdf2_sha256":
            return False
        digest = hashlib.pbkdf2_hmac(
            "sha256",
            senha_plana.encode("utf-8"),
            bytes.fromhex(salt_hex),
            int(iteracoes),
        )
        return hmac.compare_digest(digest.hex(), digest_hex)
    except (AttributeError, TypeError, ValueError):
        return False


def senha_esta_hasheada(senha: str) -> bool:
    return isinstance(senha, str) and senha.startswith("pbkdf2_sha256$")


def gerar_token() -> str:
    return secrets.token_urlsafe(32)


def gerar_hash_token(token: str) -> str:
    return hashlib.sha256(token.encode("utf-8")).hexdigest()


def agora_utc() -> datetime:
    return datetime.now(timezone.utc)


def expiracao_sessao() -> datetime:
    return agora_utc() + timedelta(days=SESSION_EXPIRE_DAYS)


def expiracao_reset() -> datetime:
    return agora_utc() + timedelta(minutes=RESET_EXPIRE_MINUTES)
