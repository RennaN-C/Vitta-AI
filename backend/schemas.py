from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    email: EmailStr
    senha: str = Field(min_length=8, max_length=128)


class UserLogin(BaseModel):
    email: EmailStr
    senha: str


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str
    nova_senha: str = Field(min_length=8, max_length=128)


class PasswordChange(BaseModel):
    senha_atual: str
    nova_senha: str = Field(min_length=8, max_length=128)


class ProfileUpdate(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    telefone: str = Field(default="", max_length=40)
    perfil_risco: str
    notificacoes_precos: bool
    notificacoes_ia: bool
    newsletters: bool


class ChatMessage(BaseModel):
    mensagem: str = Field(min_length=1, max_length=4000)


class SimulationRequest(BaseModel):
    ticker: str
    valor_inicial: float = Field(gt=0)
    meses: int = Field(ge=1, le=120)


class CompareRequest(BaseModel):
    ticker1: str
    ticker2: str


class AlertCreate(BaseModel):
    ticker: str
    tipo: str
    valor: float
