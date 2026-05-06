from pydantic import BaseModel, EmailStr

class UserRegister(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    empresa: str = "Pormade Portas"

class UserLogin(BaseModel):
    email: str
    senha: str

class ChatRequest(BaseModel):
    mensagem: str

class ChatMessage(BaseModel):
    user_id: str
    mensagem: str