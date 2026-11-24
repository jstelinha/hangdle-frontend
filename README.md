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
| **Front-end · Autenticação** · campos, regex de e-mail, token no `localStorage`, erros amigáveis, ir para a área logada (`/estatisticas`, ou de volta para a tela que pediu o login) | `src/pages/LoginPage.tsx`, `src/sessao/sessao.ts`, `src/sessao/voltarPara.ts`, `src/validacao/email.ts`, `src/api/axios.ts` (manda o token e encerra a sessão vencida) | `src/pages/LoginPage.test.tsx`, `src/componentes/Cabecalho.test.tsx`, `src/sessao/sessao.test.ts`, `src/api/axios.test.ts` |
| **Front-end · Edição de Usuário** · contexto com o usuário em toda a aplicação, validação de CPF e de nível de senha, confirmação da senha, e-mail sem alteração | `src/sessao/contexto.ts` e `src/sessao/ProvedorDeSessao.tsx` (o cabeçalho troca na hora entre Entrar e Perfil/Sair; o apelido sugerido ao entrar numa sala começa com o primeiro nome da conta, em `src/pages/EntrarNaSalaPage.tsx`; e a sala e a partida marcam a própria pessoa com "(você)"), `src/pages/PerfilPage.tsx`, `src/validacao/esquemas.ts` (`esquemaEdicao`) | `src/sessao/ProvedorDeSessao.test.tsx`, `src/pages/PerfilPage.test.tsx` |
| **Front-end · Cruds Completos** · 4 CRUDs (listas, palavras, salas e participantes), listagem e cadastro/edição em telas separadas, paginação, validação dos campos obrigatórios | Listagens em `src/pages/ListasPage.tsx`, `src/pages/PalavrasPage.tsx`, `src/pages/SalasPage.tsx` e `src/pages/SalaPage.tsx` (os participantes); cadastro e edição em `src/pages/FormularioListaPage.tsx`, `src/pages/FormularioPalavraPage.tsx`, `src/pages/FormularioSalaPage.tsx`, `src/pages/EntrarNaSalaPage.tsx` e `src/pages/FormularioApelidoPage.tsx`; a página fica no endereço (`?pagina=2`) por `src/hooks/useListagem.ts` e `src/componentes/Paginacao.tsx`; as regras dos campos em `src/validacao/esquemasDasListas.ts` e `src/validacao/esquemasDasSalas.ts`, aplicadas por `src/hooks/useFormulario.ts` | Os testes de cada uma dessas páginas (`*Page.test.tsx`) e `src/componentes/Paginacao.test.tsx` |
| **Front-end · Componentização** · componentes genéricos, telas feitas de vários componentes, componentes e páginas em pastas separadas, componentes exclusivos de uma página em funções separadas | Genéricos em `src/componentes/`: `TabelaPaginada` (listagem de qualquer recurso), `Paginacao`, `AcoesDaLinha` (editar e apagar, sair ou tirar, com confirmação), `Formulario`, `Carregado`, `TopoDaPagina`, `CampoTexto`, `CampoEscolha`, `Aviso`, `Placar`, `Cronometro` e `Forca` (a mesma do jogo do dia, pequena e com o nome de cada jogador na sala). A tela da partida (`src/pages/PartidaPage.tsx`) junta `Forca`, `Palavra`, `Teclado`, `Cronometro` e `Placar`, e a da palavra do dia (`src/pages/JogoPage.tsx`) junta `Forca`, `Palavra`, `Teclado`, `Dialogo`, `Abas`, `ProximaPalavra` e `HistogramaDeLetras`. Telas em `src/pages/`. Exclusivos: `LinhaDaLista`, `LinhaDaPalavra`, `LinhaDaSala`, `AbasDasSalas`, `DadosDaSala`, `Convite`, `LinhaDoParticipante` e, na partida, `SalaDeEspera`, `EscolherPalavra`, `MinhaForcaNaVez`, `ForcasDosJogadores`, `ResultadoDaVezAnterior` e `FimDaPartida`; na palavra do dia, `JogoDoDiaNaTela` (a partida, que manda cada letra com o token da anterior), `PainelDoDia`, `AvisoDaConta`, `FimDoDia`, `ResultadoDoDia` (a janela do fim), `SeuProgresso`, `NumerosDoProgresso`, `ComoFicouASuaForca`, `ComoTodoMundoFoi`, `ConviteParaCriarConta` e `BotaoCompartilhar`. Cada um fica no arquivo da sua página | `src/componentes/AcoesDaLinha.test.tsx`, `src/componentes/Paginacao.test.tsx`, `src/componentes/Placar.test.tsx`, `src/componentes/Cronometro.test.tsx` e os testes das páginas |
| **Tech Forge · Tipagem Avançada e Recursos do TypeScript** · generics para reaproveitar código tipado, tipos derivados de listas de valores | TypeScript em modo `strict` (`tsconfig.app.json`) e nenhum `any`; nenhum arquivo em JavaScript, nem a configuração (`eslint.config.ts`, que o ESLint lê com o `jiti`, e `vite.config.ts`); `src/types/pagina.ts` (`Pagina<T>`), `src/api/recursos.ts` (`recursosDaApi<Recurso, Dados>`, as cinco rotas de qualquer CRUD), `src/componentes/TabelaPaginada.tsx` (`TabelaPaginada<T>`), `src/hooks/useCarregamento.ts` e `src/hooks/useFormulario.ts` (os tipos saem do esquema do zod), `src/types/sala.ts` (`SegundosPorRodada` sai do `as const`), `src/types/partida.ts` (`EscolhaDaPalavra`, união da palavra escolhida da lista ou digitada; `Pick` no resultado da vez) | `src/api/recursos.test.ts`, `src/pages/PartidaPage.test.tsx` |
| **Tech Forge · Aderência aos Princípios SOLID** | **S:** `src/api/` só fala com o back, `src/hooks/` guarda o estado e os efeitos (`usePartida` só acompanha a partida; `useFilaDeLetras` só põe as letras numa fila e manda uma por vez, na ordem; `useTituloDaPagina` só põe o título da aba; `useFocoNoAviso` só leva o foco ao aviso depois de apagar), `src/componentes/` desenha e `src/pages/` monta a tela. **O:** cada CRUD novo é mais um `recursosDaApi` e usa a mesma `TabelaPaginada` e o mesmo `useListagem`, sem mudar nenhum deles; a palavra do dia passou a usar a fila da sala (`useFilaDeLetras`) sem mudar o hook: cada tela só diz como mandar a letra. **L e D:** `useListagem` e `useCarregamento` recebem a função que busca, e qualquer `Recursos<Recurso, Dados>` serve; nos testes, a API é trocada por uma falsa sem a tela perceber | `src/api/recursos.test.ts`, `src/hooks/usePartida.test.ts`, a fila em `src/pages/PartidaPage.test.tsx` e `src/pages/JogoPage.test.tsx`, e os testes das páginas, que trocam a API por uma falsa |
| **Tech Forge · Tratamento de Exceções** | `src/api/erros.ts` (`traduzirErro`) transforma toda falha da API, da rede ou inesperada numa mensagem em português, com os erros de cada campo; `src/api/axios.ts` encerra a sessão vencida | `src/api/erros.test.ts`, `src/api/axios.test.ts` |

### Exigências da disciplina

| Exigência | Onde está |
|---|---|
| `react-router-dom` | `src/Rotas.tsx` |
| `axios` (no lugar do `fetch`) | `src/api/axios.ts` |
| `zod` | `src/validacao/esquemas.ts` |
| Docker | `Dockerfile`, em duas etapas: o build com Node e o `dist/` servido pelo nginx de `nginx.conf` (o compose fica no `hangdle-backend`) |
| Testes automáticos | arquivos `*.test.ts(x)` e `.github/workflows/testes.yml` |

## Onde o Node.js é usado

O jogo roda no navegador, mas tudo em volta dele usa Node.js 24: o servidor do
Vite (`npm run dev`, para desenvolver), o build (`npm run build`) e os testes
(`npm test`). A primeira etapa do `Dockerfile` parte da imagem `node:24-alpine` e
roda o build; a segunda copia só o `dist/` para um `nginx:alpine`, então o
container do front não roda Node.

## Rodar tudo com Docker

O `docker-compose.yml` fica no `hangdle-backend`, numa pasta ao lado desta, e
sobe os quatro containers: banco, back, front e nginx. Siga o README de lá e abra
`http://localhost`. O nginx entrega o front em `/` e leva tudo que começa com
`/api/` para o back.

O container do front serve o build de produção (o `dist/`) com o nginx de
`nginx.conf`. Toda rota que não é arquivo, como `/salas`, volta para o
`index.html`, e o React Router abre a tela certa mesmo ao recarregar a página.
O container não acompanha as mudanças no código como o `npm run dev`: depois de
mudar o front, rode o `docker compose up -d --build` de novo.

## Rodar só o front

```bash
npm install
npm run dev
```

O front chama a API pelo caminho `/api` (`src/api/axios.ts`). No `npm run dev`,
o proxy do `vite.config.ts` leva esse caminho para o back em
`http://localhost:3000`, sem o `/api`: `/api/login` chega no back como `/login`.
Para cadastrar e entrar, o back precisa estar no ar nessa porta. O compose
normal não abre a porta 3000; suba o back junto com o `docker-compose.dev.yml`,
como explica o README do `hangdle-backend`.

## Telas

| Rota | O que faz |
|---|---|
| `/` | Leva direto para a palavra do dia (`/jogo`). Não tem tela de entrada: o cabeçalho já tem Entrar e Criar conta. |
| `/cadastro` | Cadastro com nome, e-mail, CPF, senha e confirmação. Depois de criar a conta, leva para o login. |
| `/login` | Login. Guarda o token no `localStorage` e leva para as estatísticas, ou de volta para a tela que pediu o login. |
| `/jogo` | A palavra do dia, aberta para todo mundo. No fim, uma janela com o resultado: quem tem conta vê as partidas, a porcentagem de acerto e a sequência; quem não tem vê o convite para criar uma. As duas têm duas abas: Você (o bonequinho como ficou e as letras chutadas) e Todo mundo hoje (como todo mundo foi no dia). No rodapé ficam o relógio da próxima palavra e o botão de compartilhar o resultado (em quadrados, sem a palavra). |
| `/estatisticas` | Só com login (área logada). Resumo, letras por dia com a tendência, histograma das partidas e a lista de partidas. |
| `/perfil` | Só com login. Editar nome, CPF e senha (com confirmação). O e-mail aparece, mas não pode ser trocado. Fica no link Perfil, no cabeçalho. |
| `/listas` | Só com login. As listas de palavras da pessoa, em páginas, com quantas palavras cada uma tem. Editar e apagar ficam em cada linha; apagar pede confirmação e leva as palavras junto. |
| `/listas/nova` e `/listas/:id/editar` | Só com login. Nome da lista, de 2 a 40 caracteres, sem repetir. Depois de criar, leva para as palavras da lista nova. |
| `/listas/:listaId/palavras` | Só com login. As palavras da lista, em páginas, com a dica de cada uma. |
| `/listas/:listaId/palavras/nova` e `/listas/:listaId/palavras/:id/editar` | Só com login. Palavra (de 3 a 30 letras, escrita em maiúsculas enquanto se digita) e dica opcional. Ao criar, o formulário fica limpo para a próxima palavra. |
| `/salas` | Só com login. As salas em páginas, em duas abas: Abertas (as públicas que não acabaram) e As minhas (`?filtro=minhas`, as salas em que a pessoa está, com ou sem senha). Quem criou a sala edita e apaga na própria linha. |
| `/salas/nova` e `/salas/:id/editar` | Só com login. Nome, lista de palavras (opcional), tempo de cada rodada, rodadas, máximo de jogadores e quem pode entrar: qualquer pessoa ou só com senha. Na edição, deixar a senha vazia mantém a senha atual. Só quem criou edita, e só antes da partida começar. |
| `/salas/:id` | Só com login. Os dados da sala e os jogadores, em páginas. Cada um troca o próprio apelido e sai; quem criou a sala tira os outros. Tem o link do convite com o botão de copiar. Quem ainda não está na sala vê o botão de entrar. |
| `/salas/:id/entrar` | Só com login. O endereço do convite: apelido (começa com o primeiro nome da conta) e a senha, se a sala tiver. |
| `/salas/:id/partida` | Só com login e para quem está na sala. A partida: a espera (quem criou começa, com pelo menos 2 jogadores), a escolha da palavra (uma de 3 da lista, ou digitada), a própria forca com o teclado, o bonequinho de cada jogador, o resultado de cada palavra, o placar e o placar final. A página da sala tem o botão para chegar aqui. |
| `/salas/:salaId/participantes/:id/editar` | Só com login. Trocar o próprio apelido na sala. |

O cabeçalho é uma linha só. O logotipo leva para a palavra do dia, e à direita fica
o menu: para quem está logado, Salas, Listas, Estatísticas, Perfil e Sair; para quem não está, Salas e Entrar. Sem conta, clicar em Salas abre
o recado "Faça login para jogar online", com os botões de entrar e de criar conta.
As telas com login ficam juntas em `src/Rotas.tsx`, dentro de `RotaProtegida`, que
manda para o login guardando o endereço: depois de entrar, a pessoa volta para onde
ia (por exemplo, o convite de uma sala).

## Como o jogo funciona

- A palavra do dia é a mesma para todo mundo e troca à meia-noite de Brasília.
  Ela fica no back até o fim da partida: o `GET /palavra-do-dia` manda só a
  categoria e as casas fechadas, e cada letra vai para o `POST
  /palavra-do-dia/letras`, que devolve as casas abertas e um token com as letras
  de antes. A próxima letra vai com esse token. A palavra só chega quando a
  partida acaba (`src/pages/JogoPage.tsx`).
- Cada letra chutada revela todas as posições em que ela aparece. Acento e ç não
  importam: A revela Á, Ã e Â; C revela Ç.
- Cada letra errada desenha uma parte do boneco (`src/componentes/Forca.tsx`). No
  sexto erro, o boneco fica completo e a partida acaba.
- Quem digita rápido não perde letra: as letras esperam numa fila e vão para o
  back uma por vez, na ordem (`src/hooks/useFilaDeLetras.ts`, o mesmo da sala).
- Os chutes ficam guardados no `localStorage` a cada letra
  (`src/jogo/chutesDoDia.ts`). Quem recarrega a página manda as letras guardadas
  de novo para o back e continua de onde parou, e quem já jogou vê o resultado e
  quanto falta para a próxima palavra.
- Quem está logado tem o resultado salvo na conta assim que a partida acaba
  (`POST /resultados`), e o "já jogou hoje" vem do back, valendo em qualquer
  aparelho. Quem jogou como visitante e depois entra leva a partida junto
  (`src/sessao/levarPartidaParaConta.ts`).

## Como a partida na sala funciona

- Em cada rodada, cada jogador escolhe uma palavra, na ordem em que entrou na
  sala, e os outros adivinham ao mesmo tempo, cada um na própria forca.
- A palavra fica no back. Quem adivinha recebe só as casas que já abriu, e cada
  letra vai para o back conferir (`POST /salas/:salaId/partida/letras`).
- A tela pergunta pela partida a cada segundo (`src/hooks/usePartida.ts`), e o
  back conta o tempo: 20 s para escolher, o tempo da sala para adivinhar e 5 s
  para mostrar como foi cada palavra. Se ninguém escolher, o back sorteia. A
  tela ignora uma resposta antiga que chegue depois de uma nova.
- Acertar vale 100 pontos, menos 10 por erro, e o primeiro a acertar ganha mais
  20. Quem escolheu ganha 10 por pessoa que acertou.

## Testes

```bash
npm test        # regras do jogo, validações e telas
npm run lint
npm run build
```

Os três rodam no GitHub Actions a cada publicação.
