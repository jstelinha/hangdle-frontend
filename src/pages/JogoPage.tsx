import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Cabecalho } from "../componentes/Cabecalho";
import { GraficoDispersao } from "../componentes/graficos/GraficoDispersao";
import { GraficoPontos } from "../componentes/graficos/GraficoPontos";
import { PainelRodada } from "../componentes/PainelRodada";
import { Palavra } from "../componentes/Palavra";
import { Teclado } from "../componentes/Teclado";
import { sorteioComSemente } from "../jogo/aleatorio";
import { letraBase } from "../jogo/letras";
import { NIVEIS } from "../jogo/niveis";
import { PALAVRAS_FIXAS } from "../jogo/palavras";
import { fecharRodada, rankingAcumulado, type DesempenhoParticipante, type ResultadoRodada } from "../jogo/partida";
import { BONUS_PRIMEIRO } from "../jogo/pontuacao";
import { criarRivais, simularRodada } from "../jogo/rivais";
import { Rodada, type EstadoRodada } from "../jogo/Rodada";
import "./Jogo.css";

const NOME_DO_JOGADOR = "Você";
const TOTAL_DE_RODADAS = PALAVRAS_FIXAS.length;
const INTERVALO_DO_RELOGIO = 250;

const MENSAGEM_DO_FIM: Record<Exclude<EstadoRodada, "jogando">, string> = {
    acertou: "Você acertou a palavra!",
    sem_vidas: "Suas vidas acabaram.",
    tempo_esgotado: "O tempo acabou.",
};

function simularRivais(): DesempenhoParticipante[][] {
    const sorteio = sorteioComSemente(Date.now());
    const rivais = criarRivais(sorteio);
    return PALAVRAS_FIXAS.map((palavra) =>
        rivais.map((rival) => ({ nome: rival.nome, simulado: true, ...simularRodada(rival, palavra, NIVEIS[palavra.nivel], sorteio) })),
    );
}

function desempenhoDoJogador(rodada: Rodada): DesempenhoParticipante {
    return {
        nome: NOME_DO_JOGADOR,
        simulado: false,
        acertou: rodada.estado === "acertou",
        erros: rodada.erros,
        segundosGastos: rodada.segundosGastos,
    };
}

function useFocoAoAparecer<T extends HTMLElement>() {
    const elemento = useRef<T>(null);
    useEffect(() => {
        elemento.current?.focus();
    }, []);
    return elemento;
}

type PropsAbertura = {
    aoComecar: () => void;
};

function Abertura({ aoComecar }: PropsAbertura) {
    return (
        <>
            <h1 className="titulo">Como jogar</h1>
            <p className="subtitulo">Descubra a palavra chutando uma letra por vez, antes de acabar as vidas ou o tempo.</p>
            <ul className="jogo__regras">
                <li>Letra certa aparece em todas as posições. Letra errada custa 1 vida.</li>
                <li>Acento e ç não importam: A revela Á, Ã e Â; C revela Ç.</li>
                <li>Use o teclado da tela ou o do computador.</li>
                <li>
                    Pontos de quem acerta: (100 + 15 × vidas restantes + segundos restantes) × multiplicador. O primeiro a acertar ganha +{BONUS_PRIMEIRO}.
                </li>
            </ul>
            <table className="tabela jogo__niveis">
                <caption>Os três níveis desta partida (categoria Comida)</caption>
                <thead>
                    <tr>
                        <th scope="col">Nível</th>
                        <th scope="col" className="numero">Vidas</th>
                        <th scope="col" className="numero">Tempo</th>
                        <th scope="col" className="numero">Multiplicador</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.values(NIVEIS).map((nivel) => (
                        <tr key={nivel.codigo}>
                            <td>{nivel.nome}</td>
                            <td className="numero">{nivel.vidas}</td>
                            <td className="numero">{nivel.segundos} s</td>
                            <td className="numero">{String(nivel.multiplicador).replace(".", ",")}x</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <p className="jogo__nota">Nesta versão você joga contra 5 rivais simulados pelo computador.</p>
            <button type="button" className="botao jogo__acao" onClick={aoComecar}>
                Começar a rodada 1
            </button>
        </>
    );
}

type PropsFimDaRodada = {
    resultado: ResultadoRodada;
    estado: Exclude<EstadoRodada, "jogando">;
    ultima: boolean;
    aoContinuar: () => void;
};

function FimDaRodada({ resultado, estado, ultima, aoContinuar }: PropsFimDaRodada) {
    const titulo = useFocoAoAparecer<HTMLHeadingElement>();
    const voce = resultado.participantes.find((participante) => !participante.simulado);
    const ordenados = [...resultado.participantes].sort((a, b) => b.pontos - a.pontos);

    return (
        <section className="secao" aria-labelledby="titulo-fim-da-rodada">
            <h2 id="titulo-fim-da-rodada" className="secao__titulo" tabIndex={-1} ref={titulo}>
                {MENSAGEM_DO_FIM[estado]}
            </h2>
            <p className="subtitulo">
                A palavra era <strong>{resultado.palavra.texto}</strong>. Você fez {voce?.pontos ?? 0} pontos nesta rodada.
            </p>
            <table className="tabela jogo__tabela">
                <caption>
                    Rodada {resultado.numero} · {resultado.nivel.nome}
                </caption>
                <thead>
                    <tr>
                        <th scope="col">Jogador</th>
                        <th scope="col">Resultado</th>
                        <th scope="col" className="numero">Erros</th>
                        <th scope="col" className="numero">Tempo</th>
                        <th scope="col" className="numero">Pontos</th>
                    </tr>
                </thead>
                <tbody>
                    {ordenados.map((participante) => (
                        <tr key={participante.nome} className={participante.simulado ? undefined : "tabela__destaque"}>
                            <td>{participante.nome}</td>
                            <td>{participante.acertou ? (participante.primeiroAAcertar ? `Acertou primeiro (+${BONUS_PRIMEIRO})` : "Acertou") : "Não acertou"}</td>
                            <td className="numero">{participante.erros}</td>
                            <td className="numero">{participante.segundosGastos} s</td>
                            <td className="numero">{participante.pontos}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button type="button" className="botao jogo__acao" onClick={aoContinuar}>
                {ultima ? "Ver o resultado da partida" : `Começar a rodada ${resultado.numero + 1}`}
            </button>
        </section>
    );
}

type PropsFimDaPartida = {
    resultados: ResultadoRodada[];
    aoJogarDeNovo: () => void;
};

function FimDaPartida({ resultados, aoJogarDeNovo }: PropsFimDaPartida) {
    const titulo = useFocoAoAparecer<HTMLHeadingElement>();
    const ranking = rankingAcumulado(resultados);
    const posicao = ranking.findIndex((jogador) => !jogador.simulado) + 1;

    return (
        <>
            <h1 className="titulo" tabIndex={-1} ref={titulo}>
                Fim da partida
            </h1>
            <p className="subtitulo">
                Você ficou em {posicao}º lugar entre {ranking.length} jogadores.
            </p>
            <p className="jogo__nota">Os rivais desta partida são simulados pelo computador. As salas com outros jogadores chegam numa próxima versão.</p>

            <section className="secao" aria-labelledby="titulo-ranking">
                <h2 id="titulo-ranking" className="secao__titulo">
                    Ranking
                </h2>
                <table className="tabela jogo__tabela">
                    <thead>
                        <tr>
                            <th scope="col" className="numero tabela__estreita">Posição</th>
                            <th scope="col">Jogador</th>
                            <th scope="col" className="numero">Pontos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {ranking.map((jogador, indice) => (
                            <tr key={jogador.nome} className={jogador.simulado ? undefined : "tabela__destaque"}>
                                <td className="numero tabela__estreita">{indice + 1}º</td>
                                <td>{jogador.simulado ? `${jogador.nome} (simulado)` : jogador.nome}</td>
                                <td className="numero">{jogador.pontos}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="secao" aria-labelledby="titulo-graficos">
                <h2 id="titulo-graficos" className="secao__titulo">
                    Gráficos da partida
                </h2>
                <GraficoPontos rodadas={resultados} />
                <GraficoDispersao rodadas={resultados} />
            </section>

            <div className="secao">
                <button type="button" className="botao" onClick={aoJogarDeNovo}>
                    Jogar de novo
                </button>
            </div>
        </>
    );
}

export function JogoPage() {
    const [rivais, setRivais] = useState(simularRivais);
    const [rodadas, setRodadas] = useState<Rodada[]>([]);
    const [verFinal, setVerFinal] = useState(false);
    const [aviso, setAviso] = useState("");
    const [, setTique] = useState(0);

    const atual = rodadas.at(-1);
    const jogando = atual?.estado === "jogando";
    const resultados = rodadas
        .filter((rodada) => rodada.estado !== "jogando")
        .map((rodada, indice) => fecharRodada(indice + 1, rodada.palavra, [desempenhoDoJogador(rodada), ...(rivais[indice] ?? [])]));
    const ultimoResultado = resultados.at(-1);

    useEffect(() => {
        if (!atual || !jogando) {
            return;
        }
        const relogio = window.setInterval(() => {
            atual.atualizarTempo();
            setTique((tique) => tique + 1);
        }, INTERVALO_DO_RELOGIO);
        return () => window.clearInterval(relogio);
    }, [atual, jogando]);

    function teclar(tecla: string) {
        if (!atual) {
            return;
        }
        const resultado = atual.chutar(tecla);
        if (resultado === "repetida") {
            setAviso(`Você já tentou a letra ${letraBase(tecla)}. Letra repetida não conta como erro.`);
        } else if (resultado === "acerto" || resultado === "erro") {
            setAviso("");
        }
        setTique((tique) => tique + 1);
    }

    const aoPressionarTecla = useEffectEvent((evento: KeyboardEvent) => {
        if (!jogando || evento.ctrlKey || evento.metaKey || evento.altKey || evento.repeat || evento.key.length !== 1) {
            return;
        }
        teclar(evento.key);
    });

    useEffect(() => {
        const ouvir = (evento: KeyboardEvent) => aoPressionarTecla(evento);
        window.addEventListener("keydown", ouvir);
        return () => window.removeEventListener("keydown", ouvir);
    }, []);

    function comecarProximaRodada() {
        setAviso("");
        setRodadas([...rodadas, new Rodada(PALAVRAS_FIXAS[rodadas.length])]);
    }

    function jogarDeNovo() {
        setRivais(simularRivais());
        setRodadas([]);
        setVerFinal(false);
        setAviso("");
    }

    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo jogo">
                {!atual && <Abertura aoComecar={comecarProximaRodada} />}

                {atual && !verFinal && (
                    <>
                        <h1 className="so-leitor">Partida do Hangdle</h1>
                        <PainelRodada
                            numero={rodadas.length}
                            total={TOTAL_DE_RODADAS}
                            nivel={atual.nivel}
                            categoria={atual.palavra.categoria}
                            vidasRestantes={atual.vidasRestantes}
                            segundosRestantes={atual.segundosRestantes}
                        />
                        <Palavra casas={atual.casas} mostrarResposta={!jogando} />
                        <p className="jogo__aviso" role="status">
                            {aviso}
                        </p>
                        {jogando && <Teclado certas={atual.letrasCertas} erradas={atual.letrasErradas} desativado={false} aoTeclar={teclar} />}
                        {atual.estado !== "jogando" && ultimoResultado && (
                            <FimDaRodada
                                resultado={ultimoResultado}
                                estado={atual.estado}
                                ultima={rodadas.length === TOTAL_DE_RODADAS}
                                aoContinuar={rodadas.length === TOTAL_DE_RODADAS ? () => setVerFinal(true) : comecarProximaRodada}
                            />
                        )}
                    </>
                )}

                {verFinal && <FimDaPartida resultados={resultados} aoJogarDeNovo={jogarDeNovo} />}
            </main>
        </div>
    );
}
