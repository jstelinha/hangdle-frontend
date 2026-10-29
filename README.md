# Hangdle — front-end

A forca no estilo do Termo. Projeto da Tech Academy de Gabriel Zafani e Julia
Stela.

Vite + React 19 + TypeScript, com `react-router-dom`, `axios`, `zod` e Recharts.
A API fica em [cade-backend](https://github.com/jstelinha/cade-backend).

## Rodar tudo com Docker

O `docker-compose.yml` fica no `cade-backend` e sobe os quatro containers: banco,
back, front e nginx. Siga o README de lá e abra `http://localhost`.

## Rodar só o front

```bash
npm install
npm run dev
```

O front chama a API em `http://localhost:3000` (`src/api/axios.ts`). Para
cadastrar e entrar, o back precisa estar no ar.

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
