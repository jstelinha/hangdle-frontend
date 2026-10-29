import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Cabecalho } from "../componentes/Cabecalho";
import { GraficoDispersao } from "../componentes/graficos/GraficoDispersao";
import { GraficoPontos } from "../componentes/graficos/GraficoPontos";
import { PainelRodada } from "../componentes/PainelRodada";
import { Palavra } from "../componentes/Palavra";
import { Teclado } from "../componentes/Teclado";
import { letraBase } from "../jogo/letras";
import { NIVEIS } from "../jogo/niveis";
import { PALAVRAS_FIXAS } from "../jogo/palavras";
import { fecharRodada, type DesempenhoParticipante, type ResultadoParticipante, type ResultadoRodada } from "../jogo/partida";
import { BONUS_PRIMEIRO } from "../jogo/pontuacao";
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

function desempenhoDoJogador(rodada: Rodada): DesempenhoParticipante {
    return {
        nome: NOME_DO_JOGADOR,
        acertou: rodada.estado === "acertou",
        erros: rodada.erros,
        segundosGastos: rodada.segundosGastos,
    };
}

function seuResultado(rodada: ResultadoRodada): ResultadoParticipante | undefined {
    return rodada.participantes.find((participante) => participante.nome === NOME_DO_JOGADOR);
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
                <li>Pontos de quem acerta: (100 + 15 × vidas restantes + segundos restantes) × multiplicador.</li>
                <li>O bônus de +{BONUS_PRIMEIRO} para quem acerta primeiro vale quando houver outros jogadores na sala.</li>
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
    const voce = seuResultado(resultado);

    return (
        <section className="secao" aria-labelledby="titulo-fim-da-rodada">
            <h2 id="titulo-fim-da-rodada" className="secao__titulo" tabIndex={-1} ref={titulo}>
                {MENSAGEM_DO_FIM[estado]}
            </h2>
            <p className="subtitulo">
                A palavra era <strong>{resultado.palavra.texto}</strong>.
            </p>
            {voce && (
                <dl className="jogo__resumo">
                    <div>
                        <dt>Erros</dt>
                        <dd>{voce.erros}</dd>
                    </div>
                    <div>
                        <dt>Tempo</dt>
                        <dd>{voce.segundosGastos} s</dd>
                    </div>
                    <div>
                        <dt>Pontos</dt>
                        <dd>{voce.pontos}</dd>
                    </div>
                </dl>
            )}
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
    const suas = resultados.map((rodada) => ({ rodada, voce: seuResultado(rodada) }));
    const total = suas.reduce((soma, { voce }) => soma + (voce?.pontos ?? 0), 0);
    const acertos = suas.filter(({ voce }) => voce?.acertou).length;

    return (
        <>
            <h1 className="titulo" tabIndex={-1} ref={titulo}>
                Fim da partida
            </h1>
            <p className="subtitulo">
                Você acertou {acertos} de {resultados.length} palavras e fez {total} pontos.
            </p>

            <section className="secao" aria-labelledby="titulo-rodadas">
                <h2 id="titulo-rodadas" className="secao__titulo">
                    Suas rodadas
                </h2>
                <table className="tabela jogo__tabela">
                    <caption className="so-leitor">Suas rodadas</caption>
                    <thead>
                        <tr>
                            <th scope="col">Rodada</th>
                            <th scope="col">Palavra</th>
                            <th scope="col">Resultado</th>
                            <th scope="col" className="numero">Erros</th>
                            <th scope="col" className="numero">Tempo</th>
                            <th scope="col" className="numero">Pontos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suas.map(({ rodada, voce }) => (
                            <tr key={rodada.numero}>
                                <td>
                                    {rodada.numero} · {rodada.nivel.nome}
                                </td>
                                <td>{rodada.palavra.texto}</td>
                                <td>{voce?.acertou ? "Acertou" : "Não acertou"}</td>
                                <td className="numero">{voce?.erros}</td>
                                <td className="numero">{voce?.segundosGastos} s</td>
                                <td className="numero">{voce?.pontos}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="tabela__destaque">
                            <td colSpan={5}>Total</td>
                            <td className="numero">{total}</td>
                        </tr>
                    </tfoot>
                </table>
            </section>

            <section className="secao" aria-labelledby="titulo-graficos">
                <h2 id="titulo-graficos" className="secao__titulo">
                    Gráficos da partida
                </h2>
                <GraficoPontos rodadas={resultados} jogador={NOME_DO_JOGADOR} />
                <GraficoDispersao rodadas={resultados} jogador={NOME_DO_JOGADOR} />
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
    const [rodadas, setRodadas] = useState<Rodada[]>([]);
    const [verFinal, setVerFinal] = useState(false);
    const [aviso, setAviso] = useState("");
    const [, setTique] = useState(0);

    const atual = rodadas.at(-1);
    const jogando = atual?.estado === "jogando";
    const resultados = rodadas
        .filter((rodada) => rodada.estado !== "jogando")
        .map((rodada, indice) => fecharRodada(indice + 1, rodada.palavra, [desempenhoDoJogador(rodada)]));
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
