import google.generativeai as genai
import os
from dotenv import load_dotenv

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

try:
    print("--- Verificando Modelos Disponíveis ---")
    modelos = genai.list_models()
    for m in modelos:
        print(f"Modelo: {m.name} | Suporta Geração: {'generateContent' in m.supported_generation_methods}")
except Exception as e:
    print(f"ERRO AO LISTAR: {e}")