from fastapi import APIRouter, HTTPException
from database import database
from schemas import UserLogin, UserRegister

router = APIRouter(prefix="/auth", tags=["Autenticação"])

@router.post("/login")
async def login(dados: UserLogin):
    query = """
        SELECT u.id, u.name, u.email, a."password" 
        FROM neon_auth."user" u 
        JOIN neon_auth.account a ON u.id = a."userId" 
        WHERE u.email = :email AND a."password" = :senha
    """
    user = await database.fetch_one(query=query, values={"email": dados.email, "senha": dados.senha})
    
    if user:
       
        return {
            "status": "success",
            "usuario": {
                "id": str(user["id"]), 
                "nome": user["name"],
                "email": user["email"],
                "empresa": "Pormade Portas"
            }
        }
    raise HTTPException(status_code=401, detail="E-mail ou senha incorretos.")

@router.post("/cadastro")
async def register(user: UserRegister):
    async with database.transaction():
        try:
            query_user = """
                INSERT INTO neon_auth."user" (name, email) 
                VALUES (:name, :email) 
                RETURNING id
            """
            user_id = await database.execute(
                query=query_user, 
                values={"name": user.nome, "email": user.email}
            )

            query_acc = """
                INSERT INTO neon_auth.account ("userId", "password") 
                VALUES (:uid, :pw)
            """
            await database.execute(
                query=query_acc, 
                values={"uid": user_id, "pw": user.senha}
            )
            
            return {"status": "success", "message": "Conta criada com sucesso!"}
        except Exception as e:
            print(f"Erro detalhado no registro: {str(e)}") 
            raise HTTPException(status_code=400, detail="Erro ao processar cadastro.")