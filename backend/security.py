import re


PALAVRAS_BLOQUEADAS = [
    "ignore as instruções anteriores", "ignore instructions", "jailbreak",
    "acting as", "mude suas regras", "delete", "drop table", "sudo",
    "rebele-se", "ignore o sistema", "instruções secretas"
]

def verificar_seguranca_prompt(input_usuario: str) -> bool:
  
    texto_limpo = input_usuario.lower().strip()
    
  
    for termo in PALAVRAS_BLOQUEADAS:
        if termo in texto_limpo:
            return False
            
  
    if re.search(r"(<script>|javascript:|system\(|exec\()", texto_limpo):
        return False
        
    palavras_escopo = ["ação", "ticker", "investimento", "mercado", "gráfico", "ajuda", "vitta", "ia", "como", "por que", "petr", "vale"]
    
    return True