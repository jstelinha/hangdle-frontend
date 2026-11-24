# PERSONA — Hangdle

**Status: confirmada em 28/10/2026, atualizada em 10/11/2026 com as salas como
ficaram no jogo.** A imagem é gerada no ChatGPT, com prompt em português, em
estilo cartoon.

O Hangdle tem dois modos:

- **Palavra do dia:** a forca clássica, com uma palavra por dia igual para todo
  mundo e 6 erros até o boneco ficar completo. Não precisa de conta.
- **Salas:** com conta, para jogar com os amigos ao mesmo tempo. Em cada rodada,
  cada jogador escolhe uma palavra, de uma lista que ele mesmo montou ou
  digitada na hora, e os outros tentam adivinhar contra o relógio, cada um na
  própria forca. No fim, sai o placar.

Esta persona sustenta o item **5.1 da RUBRICA** (Evolução do projeto: "A proposta
desenvolvida tem conexão com a persona/cliente?", 0,50). A tabela "Como o
Hangdle atende a Larissa" é o que liga a persona à proposta e o que serve de
roteiro na defesa.

---

## Larissa Andrade, 24 anos

> "Eu termino o Termo em dois minutos e fico querendo mais. Queria jogar com os
> meus amigos ao mesmo tempo, com palavras do tema que a gente gosta, e ver se
> estou melhorando."

| | |
|---|---|
| Idade | 24 anos |
| Cidade | Curitiba (PR) |
| Ocupação | Analista de marketing júnior, trabalho híbrido |
| Formação | Publicidade e Propaganda |
| Aparelhos | Celular o dia inteiro; notebook do trabalho na hora do almoço |
| Hábito com jogos de palavras | Joga Termo toda manhã no ônibus e posta o resultado no grupo "Os do Termo", com seis amigos da faculdade |
| Gostos | Filmes e séries, receitas, viagens |

### Quem é

Larissa descobriu os jogos de adivinhar palavras na faculdade e nunca mais
parou. O resultado do dia virou um ritual do grupo de amigos: cada um posta os
seus quadradinhos coloridos e o grupo comenta quem foi melhor. Ela gosta de
desafio curto, de comparar o desempenho com outras pessoas e de temas que
conhece: cinema, comida, lugares. Joga nos intervalos (ônibus, almoço, fila) e
quer que a partida caiba nesse tempo. Na sexta à noite, quer jogar com o grupo
todo junto.

### Objetivos

1. Jogar mais de uma palavra por dia.
2. Jogar com o tema que o grupo quiser: uma lista de filmes para a sexta à noite.
3. Escolher o ritmo: partidas rápidas, de 45 segundos por palavra, ou com mais
   calma, de 120.
4. Jogar com os amigos ao mesmo tempo e ver o placar, sem depender de print no
   grupo.
5. Ver se está melhorando de um dia para o outro.

### Frustrações

1. O Termo dá só uma palavra por dia.
2. As palavras não têm tema, então não dá para fazer uma "noite de filmes".
3. Comparar com os amigos é trocar print de quadradinho no WhatsApp.
4. Os sites de forca que ela encontra são antigos, cheios de anúncio, sem conta e
   sem histórico.
5. Ela não sabe se está melhorando, porque não tem estatística nenhuma.

### Um dia de uso

Segunda, 7h40, no ônibus. Larissa abre o Hangdle e joga a **palavra do dia**, a
mesma que os amigos do grupo vão jogar. Acerta com dois erros, vê como todo mundo
foi naquele dia e, como tem conta, o resultado entra no histórico dela.

Quinta, no almoço. Ela monta a lista **Filmes**, com vinte títulos e uma dica para
cada um.

Sexta, 21h. Larissa cria uma **sala com senha**, com a lista Filmes, 90 segundos
por palavra e 2 rodadas, e manda o link no grupo. Os amigos entram pelo link com
a senha. Na vez dela, escolhe uma de três palavras sorteadas da lista; na vez
dos outros, adivinha ao mesmo tempo que todo mundo, vendo o bonequinho de cada
amigo ganhar partes a cada erro. Entre uma palavra e outra aparecem a resposta e
os pontos de cada um, e no fim, o placar final. Ninguém precisa mandar print.

Sábado de manhã, ela abre as **estatísticas** e vê, pela reta de tendência, que
está precisando de menos letras para acertar a palavra do dia.

---

## Como o Hangdle atende a Larissa

| O que ela precisa | Funcionalidade | Item da rubrica ligado |
|---|---|---|
| O ritual do grupo de amigos | Palavra do dia igual para todo mundo, trocando à meia-noite de Brasília, sem precisar de conta | Regras do jogo |
| Mais de uma palavra por dia | Salas: em cada rodada (de 1 a 5), cada jogador escolhe uma palavra e os outros adivinham | CRUD de salas (1.4 / 2.4) |
| Escolher o tema | Listas de palavras de cada pessoa, com uma dica em cada palavra; a sala usa uma lista, e quem está na vez escolhe uma de 3 palavras sorteadas dela | CRUD de listas e de palavras, com palavra → lista → usuário (1.4 / 2.4) |
| Escolher o ritmo | 45, 90 ou 120 segundos para adivinhar cada palavra | Regras do jogo |
| Jogar com outras pessoas, ao mesmo tempo | Salas abertas ou com senha, convite por link; forca simultânea, com o bonequinho de cada jogador; pontos por acerto e placar | CRUD de salas e de participantes (1.4 / 2.4) |
| Ver se está melhorando | Histograma de como todo mundo foi no dia; histórico com a sequência de dias e a tendência de letras por dia | Probabilidade e Estatística — Análise Descritiva (3.1) |
| Conta com histórico | Cadastro, login e edição de perfil; a palavra do dia é aberta, e o histórico, as listas e as salas pedem conta | 1.1–1.3 e 2.1–2.3 |
| Jogo familiar | A forca clássica, com o boneco de 6 partes e o visual em grade do Termo | Regras do jogo |
| Site limpo, sem anúncio | Telas simples, montadas com componentes reutilizáveis | Componentização (2.5) |

---

## Prompt para gerar a imagem (ChatGPT, cartoon)

Cole no ChatGPT exatamente assim:

```text
Crie uma ilustração em estilo cartoon de Larissa, uma mulher brasileira de 24 anos, pele parda, cabelo castanho-escuro ondulado na altura dos ombros, óculos redondos de armação fina preta, camiseta lisa cor de areia com uma camisa xadrez aberta por cima e um fone sem fio em uma das orelhas. Ela está sentada junto à janela de um ônibus urbano pela manhã, segurando o celular com as duas mãos e sorrindo de canto, com a cara de quem acabou de acertar a palavra de um jogo. Na tela do celular aparecem uma grade de quadradinhos verdes, amarelos e cinza, sem letras, e um pequeno desenho de forca ao lado. Estilo cartoon com traço limpo e contorno escuro, cores chapadas com sombreamento simples, expressão simpática e proporções levemente estilizadas. Luz da manhã entrando pela janela e cidade simplificada ao fundo. Enquadramento do peito para cima, formato vertical. Não coloque nenhum texto, letra, logotipo ou marca d'água na imagem.
```

### Ajustes que costumam ser necessários

- **Veio texto na imagem:** responda "Refaça a mesma imagem sem nenhum texto ou
  letra."
- **Avatar para o site:** responda "Agora faça uma versão quadrada, só do rosto e
  dos ombros, com fundo de cor lisa."
- **Personagem mudou entre as versões:** peça as alterações na mesma conversa, e
  não numa conversa nova. É assim que o ChatGPT mantém a mesma personagem.
