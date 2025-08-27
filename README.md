# 🚀 Jobify - Plataforma de Vagas de Emprego

## 📋 Sobre o Projeto

Jobify é uma plataforma completa para busca e gerenciamento de vagas de emprego, integrando com a API Remotive para oferecer oportunidades atualizadas.

## ✨ Funcionalidades Implementadas

### Backend (FastAPI + PostgreSQL)
- ✅ Integração completa com API Remotive
- ✅ Sistema de favoritos com persistência
- ✅ Filtros avançados (categoria, localização, tipo)
- ✅ Autenticação JWT
- ✅ Banco de dados PostgreSQL com SQLAlchemy
- ✅ Migrações Alembic
- ✅ Containerização Docker completa
- ✅ Configuração para produção e desenvolvimento

### Endpoints Principais
- `GET /api/jobs` - Lista vagas com filtros
- `POST /api/favorites` - Adiciona vaga aos favoritos
- `DELETE /api/favorites/{job_id}` - Remove dos favoritos
- `GET /api/favorites` - Lista favoritos do usuário

## 🚀 Como Executar

### Desenvolvimento
```bash
# Clone o repositório
git clone https://github.com/seu-usuario/mbras-jobify-challenge.git
cd mbras-jobify-challenge/backend-py

# Configure o ambiente
cp .env.example .env

# Execute com Docker
docker-compose up -d
```

### Produção
```bash
# Execute a versão de produção
docker-compose -f docker-compose.prod.yml up -d
```

## 🛠️ Tecnologias Utilizadas

- **Backend**: FastAPI, SQLAlchemy, PostgreSQL, Alembic
- **Autenticação**: JWT com bcrypt
- **Containerização**: Docker + Docker Compose
- **API Externa**: Remotive Jobs API

## 📊 Arquitetura