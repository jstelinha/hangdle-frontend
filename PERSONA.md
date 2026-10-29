# PERSONA — Hangdle

**Status: confirmada em 28/10/2026.** A imagem é gerada no ChatGPT, com prompt em
português, em estilo cartoon.

O que ainda pode mudar: a parte sobre dificuldade e rodadas, quando você mandar
as regras do jogo.

Esta persona sustenta o item **5.1 da RUBRICA** (Evolução do projeto: "A proposta
desenvolvida tem conexão com a persona/cliente?", 0,50). A tabela "Como o
Hangdle atende a Larissa" é o que liga a persona à proposta e o que serve de
roteiro na defesa.

---

## Larissa Andrade, 24 anos

> "Eu termino o Termo em dois minutos e fico querendo mais. Queria escolher o
> tema, jogar quantas vezes quisesse e ver se estou melhorando."

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
quer que a partida caiba nesse tempo.

### Objetivos

1. Jogar mais de uma palavra por dia.
2. Escolher o tema: filmes na sexta à noite, comida no almoço.
3. Escolher a dificuldade de acordo com o tempo e a vontade do dia.
4. Entrar numa sala e comparar o resultado com outros jogadores, sem depender de
   print no grupo.
5. Ver, logo depois de cada rodada, como foi e se está melhorando.

### Frustrações

1. O Termo dá só uma palavra por dia.
2. As palavras não têm tema, então não dá para fazer uma "noite de filmes".
3. Comparar com os amigos é trocar print de quadradinho no WhatsApp.
4. Os sites de forca que ela encontra são antigos, cheios de anúncio, sem conta e
   sem histórico.
5. Ela não sabe se está melhorando, porque não tem estatística nenhuma.

### Um dia de uso

Sexta, 21h. Larissa entra no Hangdle, abre a lista de **salas públicas** e
escolhe uma sala da categoria **Filmes** no nível médio. Os amigos dela entram na
mesma sala. Cada um joga no próprio ritmo; nada acontece em tempo real. Assim que
a rodada acaba, aparecem os gráficos: em quantos chutes ela acertou, comparado
com o resto da sala, e como foram as rodadas anteriores. No sábado ela percebe
que vai bem em Comida e mal em Geografia, então filtra Geografia para treinar.

---

## Como o Hangdle atende a Larissa

| O que ela precisa | Funcionalidade | Item da rubrica ligado |
|---|---|---|
| Mais de uma palavra por dia | Quantas rodadas quiser, com palavras novas | Partidas e palavras (os CRUDs ainda serão definidos) |
| Escolher o tema | Cerca de 10 categorias e filtro por tipo de palavra; "Geral" mistura todas | CRUD de categorias e relacionamento palavra → categoria (1.4.5) |
| Escolher o desafio | Níveis de dificuldade *(regras a definir)* | Regras do jogo |
| Jogar com outras pessoas | Salas públicas | CRUD de salas (1.4 / 2.4) |
| Ver se está melhorando | Gráficos e métricas ao fim de cada rodada | Probabilidade e Estatística — Análise Descritiva (3.1) |
| Conta com histórico | Cadastro, login e edição de perfil; só joga quem está logado | 1.1–1.3 e 2.1–2.3 |
| Jogo familiar | Parecido com a forca, com o visual em grade do Termo | Regras do jogo |
| Site limpo, sem anúncio | Design que você vai enviar | Componentização (2.5) |

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
