# Hangdle — front-end

A forca diária: uma palavra por dia, a mesma para todo mundo, e o boneco ganha
uma parte a cada erro. Projeto da Tech Academy de Gabriel Zafani e Julia Stela.

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
| **Probabilidade e Estatística · Análise Descritiva** · histogramas | `src/componentes/graficos/HistogramaDeLetras.tsx` e `src/jogo/histogramaDeLetras.ts`: como todo mundo foi no dia (com a coluna de quem jogou destacada) e em quantas letras a pessoa costuma acertar | `src/jogo/histogramaDeLetras.test.ts`, `src/pages/JogoPage.test.tsx`, `src/pages/EstatisticasPage.test.tsx` |
| **Probabilidade e Estatística · Análise Descritiva** · série temporal e regressão | `src/componentes/graficos/GraficoTendencia.tsx` e `src/jogo/tendencia.ts`: letras por dia com a reta de tendência; `src/jogo/estatistica.ts` calcula a regressão | `src/jogo/tendencia.test.ts`, `src/jogo/estatistica.test.ts` |
| **Probabilidade e Estatística · Análise Descritiva** · métricas | `src/jogo/historico.ts`: partidas, porcentagem de acerto, sequência atual, melhor sequência e média de letras | `src/jogo/historico.test.ts` |
| **Tech Forge · Encapsulamento e Proteção do Estado** | Campos privados `#` e construtor limpo em `src/jogo/Rodada.ts` | `src/jogo/Rodada.test.ts` |
| **Tech Forge · Acesso Controlado e Propriedades** | `src/jogo/Rodada.ts`: só `get`, sem `set`; o estado só muda pela regra do jogo (`chutar`) | `src/jogo/Rodada.test.ts` |

A persona do projeto (Larissa), com a ligação entre ela e cada parte do jogo,
está em [PERSONA.md](PERSONA.md). Ela atende o item **Evolução do projeto · a
proposta tem conexão com a persona/cliente?**.

### Adiantado da Sprint 2

| Item da rubrica | Onde está | Teste que comprova |
|---|---|---|
| **Front-end · Autenticação** · campos, regex de e-mail, token no `localStorage`, erros amigáveis, ir para a área logada (`/estatisticas`) | `src/pages/LoginPage.tsx`, `src/sessao/sessao.ts`, `src/validacao/email.ts`, `src/api/axios.ts` (manda o token e encerra a sessão vencida) | `src/pages/LoginPage.test.tsx`, `src/sessao/sessao.test.ts`, `src/api/axios.test.ts` |
| **Front-end · Edição de Usuário** · contexto com o usuário em toda a aplicação, validação de CPF e de nível de senha, confirmação da senha, e-mail sem alteração | `src/sessao/contexto.ts` e `src/sessao/ProvedorDeSessao.tsx` (o nome do cabeçalho muda na hora), `src/pages/PerfilPage.tsx`, `src/validacao/esquemas.ts` (`esquemaEdicao`) | `src/sessao/ProvedorDeSessao.test.tsx`, `src/pages/PerfilPage.test.tsx` |

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
| `/` | Tela de entrada: Jogar, Entrar e Criar conta. |
| `/cadastro` | Cadastro com nome, e-mail, CPF, senha e confirmação. Depois de criar a conta, leva para o login. |
| `/login` | Login. Guarda o token no `localStorage` e leva para as estatísticas. |
| `/jogo` | A palavra do dia, aberta para todo mundo. No fim, como todo mundo foi no dia e, para quem não tem conta, o convite para criar uma. |
| `/estatisticas` | Só com login (área logada). Resumo, letras por dia com a tendência, histograma das partidas e a lista de partidas. |
| `/perfil` | Só com login. Editar nome, CPF e senha (com confirmação). O e-mail aparece, mas não pode ser trocado. Fica no nome da pessoa, no cabeçalho. |

## Como o jogo funciona

- A palavra do dia vem do back (`GET /palavra-do-dia`) e é a mesma para todo
  mundo. Ela troca à meia-noite de Brasília.
- Cada letra chutada revela todas as posições em que ela aparece. Acento e ç não
  importam: A revela Á, Ã e Â; C revela Ç.
- Cada letra errada desenha uma parte do boneco (`src/componentes/Forca.tsx`). No
  sexto erro, o boneco fica completo e a partida acaba.
- Os chutes ficam guardados no `localStorage` a cada letra
  (`src/jogo/chutesDoDia.ts`). Quem recarrega a página continua de onde parou, e
  quem já jogou vê o resultado e quanto falta para a próxima palavra.
- Quem está logado tem o resultado salvo na conta assim que a partida acaba
  (`POST /resultados`), e o "já jogou hoje" vem do back, valendo em qualquer
  aparelho. Quem jogou como visitante e depois entra leva a partida junto
  (`src/sessao/levarPartidaParaConta.ts`).

## Testes

```bash
npm test        # regras do jogo, validações e telas
npm run lint
npm run build
```

Os três rodam no GitHub Actions a cada publicação.
