# Documentação — Sistema de Hotelaria

> Projeto acadêmico da disciplina de **Tecnologias Web e Mobile (TWM)**

---

## Sumário

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Front-end](#front-end)
   - [Tecnologias](#tecnologias-front-end)
   - [Estrutura de Pastas](#estrutura-de-pastas-front-end)
   - [Componentes](#componentes)
   - [Serviço de API](#serviço-de-api)
   - [Utilitários](#utilitários)
   - [Rotas](#rotas)
   - [Estilos](#estilos)
   - [Configuração e Execução](#configuração-e-execução-front-end)
4. [Back-end](#back-end)
   - [Tecnologias](#tecnologias-back-end)
   - [Endpoints da API REST](#endpoints-da-api-rest)
   - [Modelos de Dados](#modelos-de-dados)
   - [Configuração e Execução](#configuração-e-execução-back-end)
5. [Variáveis de Ambiente](#variáveis-de-ambiente)
6. [Funcionalidades](#funcionalidades)
7. [Melhorias Implementadas](#melhorias-implementadas)
8. [Melhorias Futuras](#melhorias-futuras)

---

## Visão Geral

O **Sistema de Hotelaria** é uma aplicação web full-stack para gerenciamento de um hotel, permitindo cadastrar hóspedes, quartos e registrar hospedagens (check-in/check-out) com cálculo automático de diárias e valor total.

---

## Arquitetura

```
┌──────────────────┐        HTTP/JSON        ┌──────────────────┐
│                  │ ◄────────────────────►  │                  │
│    Front-end     │     localhost:5173       │     Back-end     │
│   React + Vite   │ ────────────────────►   │  Node.js/Express │
│                  │     localhost:3000       │   + Banco de     │
│                  │                          │     Dados        │
└──────────────────┘                          └──────────────────┘
```

- **Front-end**: SPA (Single Page Application) em React, servida pelo Vite.
- **Back-end**: API REST em Node.js/Express rodando na porta 3000.
- Comunicação via HTTP com JSON.

---

## Front-end

### Tecnologias Front-end

| Tecnologia       | Versão  | Finalidade                       |
|------------------|---------|----------------------------------|
| React            | 19.x    | Biblioteca de UI                 |
| React Router DOM | 7.x     | Roteamento SPA (client-side)     |
| React-Bootstrap  | 2.x     | Componentes UI responsivos       |
| Bootstrap        | 5.x     | Framework CSS                    |
| Axios            | 1.x     | Cliente HTTP para chamadas à API |
| Vite             | 7.x     | Bundler e dev server             |
| ESLint           | 9.x     | Linter de código                 |

### Estrutura de Pastas Front-end

```
src/
├── main.jsx                          # Ponto de entrada da aplicação
├── App.jsx                           # Componente raiz (rotas, layout)
├── App.css                           # Estilos do layout principal
├── index.css                         # Estilos globais
├── services/
│   └── api.js                        # Instância centralizada do Axios
├── components/
│   ├── pages/
│   │   ├── Home.jsx                  # Página inicial (dashboard)
│   │   ├── About.jsx                 # Página sobre o sistema
│   │   ├── Contato.jsx               # Formulário de contato
│   │   ├── Hospedes.jsx              # CRUD de hóspedes (formulário)
│   │   ├── HospedesLista.jsx         # Tabela de hóspedes
│   │   ├── Quartos.jsx               # CRUD de quartos (formulário)
│   │   ├── QuartosLista.jsx          # Tabela de quartos
│   │   ├── Hospedagens.jsx           # CRUD de hospedagens (formulário)
│   │   └── HospedagensLista.jsx      # Tabela de hospedagens
│   └── utils/
│       ├── NavbarTWM.jsx             # Barra de navegação principal
│       ├── Footer.jsx                # Rodapé da aplicação
│       ├── ErrorBoundary.jsx         # Captura global de erros React
│       └── Utils.js                  # Máscaras (CPF, CEP, Telefone)
```

### Componentes

#### Páginas

| Componente           | Descrição                                                                               |
|----------------------|-----------------------------------------------------------------------------------------|
| `Home.jsx`           | Dashboard com cards de acesso rápido aos módulos                                        |
| `About.jsx`          | Informações sobre o sistema e tecnologias utilizadas                                    |
| `Contato.jsx`        | Formulário de contato com feedback visual                                               |
| `Hospedes.jsx`       | Formulário completo de CRUD de hóspedes com máscaras de CPF/CEP, busca ViaCEP, loading, erros e confirmação de exclusão |
| `HospedesLista.jsx`  | Tabela responsiva com colunas: ID, Nome, Email, Telefone, CPF                           |
| `Quartos.jsx`        | Formulário completo de CRUD de quartos com suporte a criar e atualizar                  |
| `QuartosLista.jsx`   | Tabela responsiva com badges de status (disponível, ocupado, manutenção)                |
| `Hospedagens.jsx`    | Formulário de check-in/check-out com cálculo automático de diárias e valor total        |
| `HospedagensLista.jsx` | Tabela responsiva com resolução de nomes de hóspedes e quartos                       |

#### Utilitários

| Componente           | Descrição                                                   |
|----------------------|-------------------------------------------------------------|
| `NavbarTWM.jsx`      | Navbar com navegação SPA (usa `Link` do React Router)       |
| `Footer.jsx`         | Rodapé persistente com layout flex                          |
| `ErrorBoundary.jsx`  | Captura erros React não tratados e exibe fallback amigável  |
| `Utils.js`           | Funções de máscara: `cpfMask`, `cepMask`, `telefoneMask`   |

### Serviço de API

**`src/services/api.js`** — Instância centralizada do Axios:

- `baseURL` configurável via variável de ambiente `VITE_API_URL`
- Timeout de 10 segundos
- Interceptor de resposta para log centralizado de erros
- Headers `Content-Type: application/json` por padrão

**Uso nos componentes:**
```js
import api from '../../services/api';

// GET
const response = await api.get('/hospedes/');

// POST
await api.post('/hospedes/', dataToSend);

// PUT
await api.put(`/hospedes/${id}`, dataToSend);

// DELETE
await api.delete(`/hospedes/${id}`);
```

### Utilitários

| Função          | Parâmetro | Retorno            | Exemplo               |
|-----------------|-----------|--------------------|------------------------|
| `cpfMask(v)`    | string    | `000.000.000-00`   | `12345678901` → `123.456.789-01` |
| `cepMask(v)`    | string    | `00000-000`        | `01001000` → `01001-000`         |
| `telefoneMask(v)` | string | `(00) 00000-0000`  | `11999998888` → `(11) 99999-8888` |

### Rotas

| Rota            | Componente      | Descrição                     |
|-----------------|-----------------|-------------------------------|
| `/`             | `Home`          | Página inicial                |
| `/about`        | `About`         | Sobre o sistema               |
| `/contato`      | `Contato`       | Formulário de contato         |
| `/hospedes`     | `Hospedes`      | Cadastro de hóspedes          |
| `/quartos`      | `Quartos`       | Cadastro de quartos           |
| `/hospedagens`  | `Hospedagens`   | Registro de hospedagens       |
| `*`             | `NotFound`      | Página 404                    |

### Estilos

- **Bootstrap 5** importado globalmente via `import 'bootstrap/dist/css/bootstrap.min.css'`
- **`index.css`**: Reset mínimo, body com fundo `#f8f9fa` e fonte sistema
- **`App.css`**: Layout do container principal, max-width 1400px centralizado
- Layout flex com `min-vh-100` para footer fixo no rodapé

### Configuração e Execução Front-end

**Pré-requisitos:** Node.js >= 18

```bash
# 1. Instalar dependências
npm install

# 2. Criar arquivo .env (copiar do .env.example)
cp .env.example .env

# 3. Executar servidor de desenvolvimento
npm run dev
# → Acesse http://localhost:5173

# 4. Build de produção (opcional)
npm run build

# 5. Pré-visualizar build
npm run preview

# 6. Executar linter
npm run lint
```

---

## Back-end

> O back-end é uma API REST externa que roda em `http://localhost:3000`.
> Abaixo está a documentação dos endpoints que o front-end consome.

### Tecnologias Back-end

| Tecnologia  | Finalidade                          |
|-------------|-------------------------------------|
| Node.js     | Runtime JavaScript server-side      |
| Express     | Framework HTTP para API REST        |
| Banco SQL   | Persistência (PostgreSQL/MySQL/SQLite) |

### Endpoints da API REST

#### Hóspedes (`/hospedes`)

| Método   | Endpoint           | Descrição                      | Body (JSON)                                       |
|----------|--------------------|--------------------------------|---------------------------------------------------|
| `GET`    | `/hospedes/`       | Listar todos os hóspedes       | —                                                 |
| `GET`    | `/hospedes/:id`    | Buscar hóspede por ID          | —                                                 |
| `POST`   | `/hospedes/`       | Criar novo hóspede             | `{ nome, email, telefone, cpf, cep, rua, numero }`|
| `PUT`    | `/hospedes/:id`    | Atualizar hóspede existente    | `{ nome, email, telefone, cpf, cep, rua, numero }`|
| `DELETE` | `/hospedes/:id`    | Remover hóspede                | —                                                 |

#### Quartos (`/quartos`)

| Método   | Endpoint          | Descrição                     | Body (JSON)                                       |
|----------|-------------------|-------------------------------|---------------------------------------------------|
| `GET`    | `/quartos/`       | Listar todos os quartos       | —                                                 |
| `GET`    | `/quartos/:id`    | Buscar quarto por ID          | —                                                 |
| `POST`   | `/quartos/`       | Criar novo quarto             | `{ numero, tipo, preco, descricao, status }`      |
| `PUT`    | `/quartos/:id`    | Atualizar quarto existente    | `{ numero, tipo, preco, descricao, status }`      |
| `DELETE` | `/quartos/:id`    | Remover quarto                | —                                                 |

#### Hospedagens (`/hospedagens`)

| Método   | Endpoint              | Descrição                        | Body (JSON)                                                              |
|----------|-----------------------|----------------------------------|--------------------------------------------------------------------------|
| `GET`    | `/hospedagens/`       | Listar todas as hospedagens      | —                                                                        |
| `GET`    | `/hospedagens/:id`    | Buscar hospedagem por ID         | —                                                                        |
| `POST`   | `/hospedagens/`       | Criar nova hospedagem            | `{ id_hospede, id_quarto, data_entrada, data_saida, diarias, valor_total, observacoes }` |
| `PUT`    | `/hospedagens/:id`    | Atualizar hospedagem existente   | `{ id_hospede, id_quarto, data_entrada, data_saida, diarias, valor_total, observacoes }` |
| `DELETE` | `/hospedagens/:id`    | Remover hospedagem               | —                                                                        |

#### API Externa

| Serviço  | URL                              | Descrição                       |
|----------|----------------------------------|---------------------------------|
| ViaCEP   | `https://viacep.com.br/ws/{cep}/json/` | Consulta de endereço por CEP |

### Modelos de Dados

#### Hóspede

| Campo       | Tipo    | Obrigatório | Descrição                |
|-------------|---------|-------------|--------------------------|
| id_hospede  | int     | auto        | ID (PK, auto-increment) |
| nome        | string  | sim         | Nome completo            |
| email       | string  | sim         | E-mail                   |
| telefone    | string  | não         | Telefone com máscara     |
| cpf         | string  | não         | CPF com máscara          |
| cep         | string  | não         | CEP com máscara          |
| rua         | string  | não         | Logradouro               |
| numero      | string  | não         | Número do endereço       |

#### Quarto

| Campo       | Tipo    | Obrigatório | Descrição                                      |
|-------------|---------|-------------|------------------------------------------------|
| id_quarto   | int     | auto        | ID (PK, auto-increment)                       |
| numero      | string  | sim         | Número do quarto                               |
| tipo        | string  | sim         | Tipo: solteiro, casal, duplo, suite            |
| preco       | decimal | sim         | Preço da diária                                |
| descricao   | string  | não         | Descrição do quarto                            |
| status      | string  | sim         | Status: disponível, ocupado, manutenção        |

#### Hospedagem

| Campo          | Tipo    | Obrigatório | Descrição                              |
|----------------|---------|-------------|----------------------------------------|
| id_hospedagem  | int     | auto        | ID (PK, auto-increment)               |
| id_hospede     | int     | sim         | FK → Hóspede                           |
| id_quarto      | int     | sim         | FK → Quarto                            |
| data_entrada   | date    | sim         | Data de check-in                       |
| data_saida     | date    | sim         | Data de check-out                      |
| diarias        | int     | calculado   | Número de diárias (saída - entrada)    |
| valor_total    | decimal | calculado   | Valor total (diárias × preço/diária)   |
| observacoes    | string  | não         | Observações adicionais                 |

### Configuração e Execução Back-end

```bash
# O backend é executado separadamente (porta 3000)
# Siga as instruções do repositório do backend

# Exemplo típico:
cd backend/
npm install
npm start
# → Servidor rodando em http://localhost:3000
```

---

## Variáveis de Ambiente

| Variável        | Valor Padrão             | Descrição                        |
|-----------------|--------------------------|----------------------------------|
| `VITE_API_URL`  | `http://localhost:3000`  | URL base da API REST (back-end)  |

Arquivo `.env` na raiz do projeto front-end:
```
VITE_API_URL=http://localhost:3000
```

---

## Funcionalidades

- [x] CRUD completo de Hóspedes (criar, listar, editar, excluir)
- [x] Máscara de CPF (000.000.000-00)
- [x] Máscara de CEP (00000-000) com busca automática ViaCEP
- [x] Máscara de Telefone ((00) 00000-0000)
- [x] CRUD completo de Quartos (criar, listar, editar, excluir)
- [x] Tipos de quarto: Solteiro, Casal, Duplo, Suite
- [x] Status de quarto com badges: Disponível, Ocupado, Manutenção
- [x] Registro de Hospedagens (check-in / check-out)
- [x] Cálculo automático de diárias e valor total
- [x] Filtro de quartos disponíveis na hospedagem
- [x] Navegação SPA sem recarregamento de página
- [x] Página 404 (Not Found)
- [x] ErrorBoundary global para captura de erros React
- [x] Loading spinners durante requisições
- [x] Alertas de sucesso e erro com auto-dismiss
- [x] Confirmação antes de excluir registros
- [x] Layout responsivo com Bootstrap
- [x] Footer persistente com layout flex
- [x] Página Home com dashboard de acesso rápido
- [x] Página Sobre com informações do sistema
- [x] Página Contato com formulário funcional

---

## Melhorias Implementadas

1. **Navegação SPA correta** — Substituição de `href` por `Link` do React Router (sem reloads)
2. **API centralizada** — `src/services/api.js` com Axios configurado via `.env`
3. **Loading states** — Spinners durante carregamento de dados
4. **Error states** — Alertas de erro com auto-dismiss
5. **Feedback de sucesso** — Alertas verdes ao salvar/atualizar/excluir
6. **Confirmação de exclusão** — `window.confirm` antes de deletar
7. **Validação de campos obrigatórios** — Antes de enviar formulários
8. **Máscara de telefone** — Nova função `telefoneMask`
9. **Remoção de console.log** — Limpeza de logs de debug
10. **ErrorBoundary** — Captura global de erros React
11. **Footer** — Rodapé com copyright
12. **Rota 404** — Página amigável para rotas inexistentes
13. **Página Home** — Dashboard com cards de acesso rápido
14. **Página About** — Conteúdo informativo real
15. **Página Contato** — Formulário completo com feedback
16. **Suporte a Update em Quartos** — Botão alterna entre Salvar/Atualizar
17. **Suporte a Update em Hospedagens** — Botão alterna entre Salvar/Atualizar
18. **Tables responsivas** — `<Table responsive>` do React-Bootstrap
19. **Badges de status** — Cores visuais para status de quartos
20. **Tabela de hóspedes expandida** — Email, telefone e CPF visíveis
21. **Variável de ambiente** — `VITE_API_URL` para configurar backend
22. **HTML semântico** — `lang="pt-BR"`, meta description, title correto
23. **CSS limpo** — Remoção do template Vite, estilos adequados para sistema

---

## Melhorias Futuras

- [ ] Autenticação e autorização (login, JWT, roles)
- [ ] Paginação e busca/filtro nas tabelas
- [ ] Testes unitários (Jest + React Testing Library)
- [ ] Testes E2E (Cypress)
- [ ] Migração para TypeScript
- [ ] Prettier + Husky + lint-staged (pré-commit)
- [ ] CI/CD (GitHub Actions)
- [ ] Docker e Docker Compose
- [ ] Logs e monitoramento (Sentry)
- [ ] PWA (Progressive Web App)
