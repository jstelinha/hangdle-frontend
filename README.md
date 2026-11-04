# Hangdle — front-end

A forca no estilo do Termo. Projeto da Tech Academy de Gabriel Zafani e Julia
Stela.

Vite + React 19 + TypeScript, com `react-router-dom`, `axios`, `zod` e Recharts.
A API fica em [hangdle-backend](https://github.com/jstelinha/hangdle-backend).

## Onde está cada item da rubrica

Todo trecho que atende um item da rubrica tem um comentário de marcação, sempre
no mesmo formato:

```text
// Rubrica de <Disciplina> - <Critério> - <Requisito>
```

Para ver todas as marcações de uma vez, busque pelo texto `Rubrica de`:

- **no GitHub:** aperte `.` na página do repositório (abre o editor no
  navegador) e use a busca (`Ctrl+Shift+F`);
- **no VS Code:** `Ctrl+Shift+F` com a pasta do projeto aberta;
- **no terminal:** `git grep -n "Rubrica de"`.

### Sprint 1

| Item da rubrica | Onde está | Teste que comprova |
|---|---|---|
| **Front-end · Cadastro de Usuário** · campos obrigatórios: nome, email, senha, CPF | `src/pages/CadastroPage.tsx`, `src/validacao/esquemas.ts` | `src/pages/CadastroPage.test.tsx` |
| **Front-end · Cadastro de Usuário** · verificação dupla de senha | `src/pages/CadastroPage.tsx` (campo "Repita a senha"), `src/validacao/esquemas.ts` | `src/pages/CadastroPage.test.tsx` |
| **Front-end · Cadastro de Usuário** · validação de CPF | `src/validacao/cpf.ts` | `src/validacao/validacao.test.ts`, `src/pages/CadastroPage.test.tsx` |
| **Front-end · Cadastro de Usuário** · validação de email | `src/validacao/email.ts` | `src/validacao/validacao.test.ts` |
| **Front-end · Cadastro de Usuário** · redirecionar para o login após o cadastro | `src/pages/CadastroPage.tsx` | `src/pages/CadastroPage.test.tsx` |
| **Front-end · Cadastro de Usuário** · lidar com as mensagens de erro da API | `src/api/erros.ts`, `src/pages/CadastroPage.tsx` | `src/api/erros.test.ts`, `src/pages/CadastroPage.test.tsx` |
| **Probabilidade e Estatística · Análise Descritiva** · gráficos adequados ao objetivo (colunas, dispersão e regressão) | `src/componentes/graficos/GraficoPontos.tsx` (colunas), `src/componentes/graficos/GraficoDispersao.tsx` (dispersão com a reta de regressão), `src/jogo/estatistica.ts` (cálculo da regressão) | `src/jogo/estatistica.test.ts`, `src/jogo/partida.test.ts` |
| **Tech Forge · Encapsulamento e Proteção do Estado** | Campos privados `#` e construtor limpo em `src/jogo/Rodada.ts` | `src/jogo/Rodada.test.ts` |
| **Tech Forge · Acesso Controlado e Propriedades** | `src/jogo/Rodada.ts`: só `get`, sem `set`; o estado só muda pelas regras do jogo (`chutar`, `atualizarTempo`) | `src/jogo/Rodada.test.ts` |

Os gráficos aparecem na tela de fim da partida, depois da terceira rodada.

A persona do projeto (Larissa), com a ligação entre ela e cada parte do jogo,
está em [PERSONA.md](PERSONA.md). Ela atende o item **Evolução do projeto · a
proposta tem conexão com a persona/cliente?**.

### Adiantado da Sprint 2

| Item da rubrica | Onde está | Teste que comprova |
|---|---|---|
| **Front-end · Autenticação** · campos, regex de e-mail, token no `localStorage`, erros amigáveis, ir para a área logada | `src/pages/LoginPage.tsx`, `src/sessao/sessao.ts`, `src/validacao/email.ts` | `src/pages/LoginPage.test.tsx`, `src/sessao/sessao.test.ts` |

### Exigências da disciplina

| Exigência | Onde está |
|---|---|
| `react-router-dom` | `src/Rotas.tsx` |
| `axios` (no lugar do `fetch`) | `src/api/axios.ts` |
| `zod` | `src/validacao/esquemas.ts` |
| Docker | `Dockerfile` (o compose fica no `hangdle-backend`) |
| Testes automáticos | arquivos `*.test.ts(x)` e `.github/workflows/testes.yml` |

## Onde o Node.js é usado

O jogo roda no navegador, mas tudo em volta dele usa Node.js 24: o servidor do
Vite (`npm run dev`, que é o que o container do front executa), o build
(`npm run build`) e os testes (`npm test`). O `Dockerfile` parte da imagem
`node:24-alpine`.

## Rodar tudo com Docker

O `docker-compose.yml` fica no `hangdle-backend`, numa pasta ao lado desta, e
sobe os quatro containers: banco, back, front e nginx. Siga o README de lá e abra
`http://localhost`. O nginx entrega o front em `/` e leva tudo que começa com
`/api/` para o back.

## Rodar só o front

```bash
npm install
npm run dev
```

O front chama a API pelo caminho `/api` (`src/api/axios.ts`). No `npm run dev`,
o proxy do `vite.config.ts` leva esse caminho para o back em
`http://localhost:3000`, sem o `/api`: `/api/login` chega no back como `/login`.
Para cadastrar e entrar, o back precisa estar no ar nessa porta.

## Telas

| Rota | O que faz |
|---|---|
| `/cadastro` | Cadastro com nome, e-mail, CPF, senha e confirmação. Depois de criar a conta, leva para o login. |
| `/login` | Login. Guarda o token no `localStorage` e leva para o jogo. |
| `/jogo` | Só com login. Três rodadas (Fácil, Médio, Difícil) e, no fim, o resumo das suas rodadas e os gráficos da partida. |

## Testes

```bash
npm test        # regras do jogo, validações e telas
npm run lint
npm run build
```

Os três rodam no GitHub Actions a cada publicação.
