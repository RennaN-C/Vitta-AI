# 🚀 Vitta AI - Inteligência Financeira e Análise de Ativos

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-High_Performance-05998B?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-Vite-61DAFB?logo=react&logoColor=black)
![PostgreSQL](https://img.shields.io/badge/Neon-PostgreSQL-00E699?logo=postgresql&logoColor=black)

O **Vitta AI** é uma plataforma Full-Stack de análise financeira baseada em Inteligência Artificial. Projetado para transformar dados complexos do mercado de ações em insights compreensíveis através de linguagem natural, o sistema combina robustez de backend em Python com uma interface intuitiva e moderna.

---

## ✨ Funcionalidades Principais

### 🧠 Inteligência Artificial Analítica
* **Multi-LLM Pipeline:** Integração com modelos avançados para análise técnica e fundamentalista de ações.
* **Orquestração de Dados:** Consultas assíncronas ao Yahoo Finance para extração de dados em tempo real.
* **Tradução de Dados:** Conversão de números brutos e séries temporais em relatórios de linguagem natural via IA.

### 🔐 Segurança e Autenticação
* **JWT & Bcrypt:** Autenticação stateless baseada em tokens (JWT) e senhas protegidas com hashing de alta segurança.
* **Arquitetura Assíncrona:** Backend em FastAPI otimizado para lidar com múltiplas requisições simultâneas sem bloqueio de I/O.
* **Gestão de Sessão:** Persistência de dados sensíveis e estado do usuário utilizando as melhores práticas de `localStorage`.

### 📊 Dashboard e Visualização
* **Interface Fintech:** Estética profissional em *Dark Mode / Neon*, otimizada para monitoramento de ativos.
* **Ferramenta de Comparação:** Engine para confronto de performance entre múltiplos ativos com gráficos interativos.
* **UX Responsiva:** Design focado na clareza de informações para investidores.

---

## 🛠️ Stack Tecnológico

A stack foi escolhida com foco em performance, escalabilidade e processamento de dados financeiros.

* **Frontend:** React.js, Vite, TailwindCSS, Lucide Icons, Axios.
* **Backend:** FastAPI (Python), uvicorn, Pydantic, Authlib (OAuth2).
* **Banco de Dados:** PostgreSQL (hospedado no Neon Serverless).
* **Infraestrutura:** Docker, Containerização para ambientes escaláveis.

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
* [Docker Desktop](https://www.docker.com/) rodando.
* Python 3.10+ e Node.js v18+.

### Passo 1: Configurar o Backend
1. Navegue até a pasta `backend/`.
2. Crie e ative seu ambiente virtual: 
```bash
   python -m venv venv
   source venv/bin/activate  # Ou venv\Scripts\activate no Windows
Instale as dependências:

Bash
   pip install -r requirements.txt
Crie um arquivo .env com as credenciais do banco Neon e chaves da API (OpenAI/Groq).

Inicie o servidor:

Bash
   uvicorn main:app --reload
Passo 2: Configurar o Frontend
Navegue até a pasta frontend/.

Instale as dependências:

Bash
   npm install
Inicie o ambiente de desenvolvimento:

Bash
   npm run dev
Acesse a aplicação no navegador em: http://localhost:5173

🧪 Estratégia de Desenvolvimento
O projeto foi estruturado seguindo os preceitos de engenharia de software, com um foco claro na modularidade entre a camada de processamento de dados (backend/IA) e a camada de visualização (frontend). A utilização de schemas rigorosos (Pydantic) garante a integridade dos dados desde o payload da requisição até a persistência no PostgreSQL.

👨‍💻 Autor
Rennan De Oliveira Cardoso

Estudante de Engenharia de Software | Full-Stack Developer
