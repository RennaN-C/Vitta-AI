Markdown
# Vitta AI – Terminal Inteligente de Trading & Portfólio

<p align="center">
  <img src="frontend/src/assets/vitta_bg.png" alt="Vitta AI Logo" width="120" />
</p>

<p align="center">
  <strong>Plataforma Full-Stack de Análise Financeira e Auditoria Baseada em Inteligência Artificial (Multi-LLM)</strong>
</p>

---

## 🛠️ Status do Projeto: 🚀 Em Desenvolvimento Ativo

O **Vitta AI** é um ecossistema vivo. Atualmente, a estrutura base da plataforma (Frontend, API Backend e Banco de Dados) está totalmente funcional, integrada e containerizada. O foco atual do desenvolvimento está na expansão dos recursos de inteligência artificial distributiva e na automação de ferramentas avançadas de finanças.

---

## 📋 Sobre o Projeto

O **Vitta AI** é um ecossistema financeiro projetado para consolidar dados de mercado em tempo real e fornecer insights estratégicos altamente contextualizados por IA. O grande diferencial do projeto reside na sua **Camada Avançada de Engenharia de Prompts**, que gerencia personas de forma dinâmica e mitiga falhas operacionais através de um barramento paralelo de IA (Multi-LLM), atuando em conjunto com rigorosos mecanismos de proteção e segurança de dados no backend.

Este projeto foi desenvolvido como aplicação prática para as diretrizes acadêmicas de Engenharia de Software (6º Período), unindo conceitos modernos de microsserviços, arquitetura cliente-servidor, segurança digital e inteligência artificial aplicada.

---

## 🔮 Funcionalidades e Próximos Passos (Roadmap de Adições)

Para consolidar o terminal como uma plataforma de nível corporativo, as seguintes implementações estão mapeadas e em fase de desenvolvimento:

### 1. Módulo do Simulador de Investimentos (Aba Dedicada)
* **Aportes Simulados:** Criação de uma carteira de testes onde o usuário pode simular a compra e venda de ativos com saldo fictício.
* **Projeção de Juros Compostos:** Gráfico interativo focado em demonstrar a evolução de patrimônio no longo prazo com aportes mensais recorrentes.

### 2. Integração Física com APIs de IA e Roteamento Avançado
* **Chamadas Assíncronas Reais:** Substituição completa dos mocks de auditoria por conexões físicas diretas via SDKs com provedores de mercado (OpenAI, Groq e Google Gemini).
* **Roteamento por Assunto:** Lógica inteligente no backend onde cada modelo responde estritamente por sua especialidade (ex: um modelo focado em análise macroeconômica e outro em análise fundamentalista de balanços).

### 3. Histórico de Consultas da IA e Auditorias
* **Persistência de Logs:** Salvamento automático de todas as análises geradas e dos prompts que passaram pela auditoria de segurança no banco de dados PostgreSQL.
* **Painel de Auditoria:** Tela administrativa para o usuário revisar o histórico de alertas e respostas geradas pelas LLMs.

### 4. Notificações e Webhooks em Tempo Real
* **Alertas via Webhook:** Integração com serviços de mensageria (como Telegram ou Discord) para disparar alertas automáticos assim que o robô de IA detectar anomalias ou oportunidades bruscas no mercado financeiro.

---

## 🛠️ Tecnologias e Arquitetura

O sistema foi modularizado utilizando uma arquitetura robusta, isolada por containers, para garantir escalabilidade e consistência de ambiente:

* **Frontend:** React.js, Vite, Tailwind CSS (estilização avançada com temática Dark Mode e Neon) e Recharts para plotagem de gráficos temporais responsivos.
* **Backend:** Python, FastAPI (alta performance e documentação automatizada via Swagger UI) e biblioteca `yfinance` para captura e tratamento de dados históricos da B3 e mercados internacionais.
* **Banco de Dados:** PostgreSQL para persistência estável de dados relacionais e modelagem estruturada.
* **DevOps & Infraestrutura:** Docker e Docker Compose para gerenciamento, isolamento de rede local e orquestração de serviços.

---

## 🧠 Engenharia de Prompts & Inteligência Artificial (Diferenciais Técnicos)

O ecossistema foi blindado para cumprir com rigor as técnicas avançadas de consumo de modelos de linguagem:

1.  **Definição Estrita de Papéis (5 Personas):** O sistema parametriza o comportamento da IA dinamicamente baseando-se na escolha do operador, mapeando os modos: **Técnico**, **Resumido**, **Professor**, **Detalhado** e **Suporte Técnico**.
2.  **Três Níveis de Prompts Combinados:**
    * *Prompt Simples:* Requisições diretas de mercado.
    * *Prompt Estruturado:* Delimitação estrita via marcações XML para forçar saídas padronizadas em Markdown.
    * *Prompt Especializado:* Implementação de técnicas de *Few-Shot Prompting* associadas à metodologia *Chain-of-Thought* (Cadeia de Pensamento) para dedução lógica de riscos.
3.  **Arquitetura Multi-LLM (Múltiplas APIs):** Implementação de chamadas cruzadas e assíncronas onde a **IA Primária** (pipeline principal) gera a análise de mercado e a **IA Secundária** atua na camada de controle de qualidade, auditando se as diretrizes da persona selecionada foram estritamente cumpridas.

---

## 🛡️ Camada de Segurança (Guardrails)

Para mitigar vulnerabilidades comuns em aplicações ligadas a LLMs, o backend possui uma camada nativa de proteção (`security.py`) que intercepta e sanitiza o input do usuário antes do envio de tokens para as APIs, bloqueando de forma imediata:
* **Prompt Injection:** Tentativas de burlar as regras iniciais do sistema através de comandos como *"ignore as instruções anteriores"*.
* **Comandos Maliciosos & Scripts:** Bloqueio via expressões regulares (Regex) de injeções de código executável no servidor.
* **Pedidos Inadequados:** Filtro por lista negra de palavras-chave ofensivas ou fora do escopo financeiro.

---

## 📂 Mapeamento Absoluto da Estrutura do Repositório

```text
├── backend/
│   ├── main.py              # Espinha dorsal: centraliza rotas, autenticação e endpoints de ativos
│   ├── prompts.py           # Templates e dicionários da Engenharia de Prompts (5 Personas)
│   ├── security.py          # Camada de Guardrails contra Prompt Injection e sanitização via Regex
│   ├── chatbot.py           # Módulo lógico de consumo, integração e chamadas de IA
│   ├── database.py          # Configurações de conexão e persistência do PostgreSQL
│   ├── auth.py              # Gerenciamento de segurança, validação de tokens e hashing de senhas
│   ├── schemas.py           # Definição estrita das estruturas JSON (Pydantic) de entrada e saída
│   ├── requirements.txt     # Manifesto de todas as dependências instaladas do ecossistema Python
│   ├── Dockerfile           # Instruções de montagem da imagem isolada do servidor Python
│   └── .env.example         # Guia e documentação de variáveis de ambiente do servidor
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Arquitetura modular de componentes visuais reutilizáveis
│   │   │   ├── Sidebar.jsx       # Painel lateral de navegação interna por abas do sistema
│   │   │   ├── Dashboard.jsx     # Interface mestre da Home e do painel de Análise Dinâmica
│   │   │   ├── Comparador.jsx    # Módulo de duelo paralelo e cruzamento de ativos
│   │   │   ├── CompareChart.jsx  # Renderizador do gráfico histórico de comparação de ativos
│   │   │   ├── PortfolioChart.jsx# Gráfico dinâmico adaptável (Evolução histórica / Distribuição)
│   │   │   ├── ChatBot.jsx       # Widget flutuante de chat com IA contextualizado por ativo
│   │   │   ├── Login.jsx         # Tela de portal, autenticação e guarda de rotas do usuário
│   │   │   └── Profile.jsx       # Interface de gerenciamento e dados da conta Modo Pro
│   │   │
│   │   ├── assets/          # Texturas, logotipos e identidades visuais do projeto
│   │   │   ├── hero.png          # Banner de apresentação da interface principal
│   │   │   ├── vitta_bg.png      # Background escuro otimizado para o tema gráfico Neon
│   │   │   ├── vitta_icon.png    # Logotipo oficial do terminal inteligente Vitta AI
│   │   │   ├── react.svg         # Ícone de infraestrutura do framework cliente
│   │   │   └── vite.svg          # Logotipo do motor de renderização frontend
│   │   │
│   │   ├── App.jsx          # Ponto de entrada do React, controle de estados globais e abas ativas
│   │   ├── main.jsx         # Inicializador virtual do DOM do cliente web
│   │   ├── App.css          # Estilizações customizadas globais complementares
│   │   └── index.css        # Injeção e parametrização das diretrizes ativas do Tailwind CSS
│   │
│   ├── public/              # Arquivos públicos servidos diretamente pelo servidor Vite
│   │   ├── favicon.svg      # Ícone de aba do navegador do sistema
│   │   └── icons.svg        # Repositório consolidado de vetores e ícones gráficos
│   │
│   ├── .gitignore           # Filtros de exclusão de rastreamento Git para a pasta frontend
│   ├── Dockerfile           # Instruções de montagem e empacotamento do container do Vite
│   ├── eslint.config.js     # Padronização de qualidade e formatação estrita de código JS
│   ├── index.html           # Página raiz estática onde a árvore React é montada
│   ├── vite.config.js       # Configurações do compilador rápido e servidor de desenvolvimento
│   ├── package.json         # Manifesto e versões das dependências instaladas (Tailwind, Recharts)
│   └── package-lock.json    # Histórico imutável de instalações e árvores de nós do Node.js
│
├── .gitignore               # Filtros e regras de exclusão de arquivos globais do repositório
├── docker-compose.yaml      # Orquestrador global multi-container (Banco, Backend e Frontend)
└── README.md                # Documentação técnica e manual operacional da plataforma
🚀 Como Executar o Projeto com Docker
Graças à containerização completa do ecossistema, você só precisa ter o Docker e o Docker Compose instalados na sua máquina para rodar o projeto completo instantaneamente, sem precisar instalar Node ou Python localmente.

1. Clonar o Repositório
Bash
git clone [https://github.com/RennaN-C/vitta-ai.git](https://github.com/RennaN-C/vitta-ai.git)
cd vitta-ai
2. Configurar as Variáveis de Ambiente
Crie um arquivo .env na pasta backend/ seguindo as orientações encontradas no arquivo .env.example.

3. Inicializar os Containers
Execute o comando abaixo na raiz do projeto para construir as imagens e levantar o frontend, backend e banco de dados de forma totalmente integrada em uma rede isolada local:

Bash
docker-compose up --build
O ecossistema estará disponível nos seguintes endereços locais do seu navegador:

Frontend (Interface Web): http://localhost:5173

Backend (API FastAPI): http://localhost:8000

Documentação Interativa (Swagger UI): http://localhost:8000/docs
