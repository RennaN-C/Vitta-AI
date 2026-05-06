# 💹 Vitta AI - Trading Terminal & Analyst

O **Vitta AI** é um terminal de inteligência financeira de alta performance, projetado para traders e investidores que buscam análises rápidas e técnicas de ativos do mercado financeiro. Utilizando o poder do modelo **Llama 3.3-70B via Groq**, o sistema fornece insights detalhados, enquanto o backend garante a persistência de todo o histórico de interações e autenticação robusta.

---

## 📂 Estrutura do Projeto

A arquitetura do sistema é dividida em dois grandes blocos (Frontend e Backend), orquestrados via **Docker** para garantir que o ambiente de desenvolvimento seja idêntico ao de produção.

```text
Vitta-AI/
├── backend/
│   ├── auth.py          # Gerenciamento de usuários e contas (UUID Logic)
│   ├── chatbot.py       # Integração com Groq API e histórico no PostgreSQL
│   ├── main.py          # Ponto de entrada FastAPI e análise de Tickers (yfinance)
│   ├── database.py      # Configuração de conexão com o banco Neon
│   ├── schemas.py       # Modelos de dados Pydantic (Validação de tipos)
│   └── Dockerfile       # Configuração da imagem do servidor
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Login.jsx    # Sistema de autenticação (Persistent Storage)
│   │   │   ├── ChatBot.jsx  # Interface de IA com histórico recuperável
│   │   │   └── Dashboard.jsx # Visualização de dados de mercado
│   └── Dockerfile       # Configuração da imagem Vite/React
└── docker-compose.yml   # Orquestração completa dos serviços


🚀 Tecnologias Utilizadas
Frontend: React.js, Tailwind CSS, Lucide React (Icons), Vite.

Backend: Python, FastAPI, Uvicorn.

Inteligência Artificial: Groq Cloud SDK (Llama 3.3-70B).

Banco de Dados: PostgreSQL (Hospedado no Neon.tech).

Dados de Mercado: Yahoo Finance API (yfinance).

DevOps: Docker, Docker Compose.

🛠️ Como Utilizar o Sistema
1. Requisitos
Docker e Docker Compose instalados.

Chaves de API: Groq API Key e Neon Database URL.

2. Configuração de Variáveis de Ambiente
Crie um arquivo .env na raiz do projeto ou dentro da pasta backend/:

Snippet de código
DATABASE_URL=sua_url_do_neon
GROQ_API_KEY=sua_chave_groq

3. Executando o Sistema
No terminal, na raiz do projeto, execute:

Bash
docker compose up -d --build
O sistema estará disponível em:

Frontend: http://localhost:5173

Backend (Docs): http://localhost:8000/docs

🔄 Fluxo de Uso

Registro/Login: Crie uma conta no terminal. O sistema gera automaticamente um UUID único para sua segurança.

Análise de Ativos: No Dashboard, digite um ticker (ex: PETR4 ou AAPL) para obter dados em tempo real.

Chatbot IA: Abra o terminal de análise no canto inferior. Suas dúvidas técnicas são respondidas pela IA e salvas automaticamente.

Persistência: Ao deslogar e entrar novamente, suas conversas anteriores serão carregadas do banco de dados para o chat.

🔐 Diferenciais Técnicos Implementados

UUID (Universally Unique Identifier): Substituição de IDs sequenciais por UUIDs para evitar exposição de dados.

Foreign Key Integrity: Relacionamentos sólidos entre tabelas de usuário, credenciais e histórico.

CORS Seguro: Configuração de middleware para comunicação fluida entre React e FastAPI.

Análise Técnica: Tradução automática de setores e resumos de empresas para Português Brasileiro.
