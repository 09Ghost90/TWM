# Sistema de Hotelaria

Projeto academico da disciplina de Tecnologias Web e Mobile (TWM), com front-end em React + Vite e API REST em Node.js/Express.

## Funcionalidades

- CRUD de hospedes
- CRUD de quartos
- CRUD de hospedagens (check-in/check-out)
- Calculo automatico de diarias e valor total
- Mascaras de CPF, CEP e telefone
- Consulta de endereco via ViaCEP

## Tecnologias

- React 19
- Vite 7
- React Router DOM 7
- React-Bootstrap + Bootstrap 5
- Axios
- Node.js + Express (backend)

## Estrutura

```
.
|- src/                  # Front-end React
|- backend/              # API REST
|- DOCUMENTACAO.md       # Documentacao completa do projeto
```

## Como executar

Pre-requisito: Node.js >= 18

### Front-end

```bash
npm install
cp .env.example .env
npm run dev
```

App em: `http://localhost:5173`

### Back-end

```bash
cd backend
npm install
npm start
```

API em: `http://localhost:3000`

## Variavel de ambiente

No arquivo `.env` da raiz:

```env
VITE_API_URL=http://localhost:3000
```

## Documentacao

Detalhes de arquitetura, rotas e modelos de dados em `DOCUMENTACAO.md`.
