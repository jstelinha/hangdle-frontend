import axios from "axios";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { traduzirErro } from "../api/erros";
import { buscarEstatisticasDoDia, chutarNoDia, comecarJogoDoDia } from "../api/palavraDoDia";
import { buscarHistorico, jaEstavaSalvo, salvarResultado } from "../api/resultados";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { Forca } from "../componentes/Forca";
import { HistogramaDeLetras } from "../componentes/graficos/HistogramaDeLetras";
import { Palavra } from "../componentes/Palavra";
import { ProximaPalavra } from "../componentes/ProximaPalavra";
import { Teclado } from "../componentes/Teclado";
import { useFilaDeLetras } from "../hooks/useFilaDeLetras";
import { guardarChutesDoDia, lerChutesDoDia } from "../jogo/chutesDoDia";
import { casasDaForca, separarLetras } from "../jogo/forcaDaSala";
import { colunasPorLetras, somarResultado } from "../jogo/histogramaDeLetras";
import { letraBase } from "../jogo/letras";
import { ERROS_PARA_PERDER, Rodada } from "../jogo/Rodada";
import { lerSessao } from "../sessao/sessao";
import type { EstatisticasDoDia, JogoDoDia, ResultadoDiario } from "../types/jogo";
import "./Jogo.css";

type Carregamento =
    | { situacao: "carregando" }
    | { situacao: "falhou"; mensagem: string }
    | { situacao: "pronta"; jogo: JogoDoDia; salvoNaConta: boolean };

async function resultadoSalvoNaConta(dia: string): Promise<ResultadoDiario | null> {
    if (!lerSessao()) {
        return null;
    }
    try {
        const [salvo] = await buscarHistorico(dia);
        return salvo ?? null;
    } catch {
        return null;
    }
}

// Quem já jogou hoje na conta vê o fim. A partida acabou, então a palavra já pode estar aqui, e as casas saem dela.
function jogoSalvo(inicio: JogoDoDia, salvo: ResultadoDiario): JogoDoDia {
    const rodada = Rodada.aPartirDosChutes(salvo.palavra, salvo.letras);
    return {
        ...inicio,
        casas: rodada.casas.map((casa) => (casa.revelada ? casa.caractere : null)),
        letras: rodada.chutes,
        erros: rodada.erros,
        acertou: rodada.estado === "acertou",
        terminou: true,
        palavra: salvo.palavra,
    };
}

function letraRecusada(erro: unknown): boolean {
    return axios.isAxiosError(erro) && [400, 409].includes(erro.response?.status ?? 0);
}

// O back não guarda a partida de quem joga sem conta. Ao recarregar, as letras guardadas neste navegador vão de novo,
// uma por vez, cada uma com o token da anterior. Se o back recusar uma letra (o que estava guardado estragou), a
// partida fica até a letra de antes; se ele não responder, a tela avisa e deixa tentar de novo.
async function refazerChutes(inicio: JogoDoDia, letras: readonly string[]): Promise<JogoDoDia> {
    let jogo = inicio;
    for (const letra of letras) {
        if (jogo.terminou) {
            break;
        }
        try {
            jogo = await chutarNoDia(jogo.token, letra);
        } catch (erro) {
            if (letraRecusada(erro)) {
                break;
            }
            throw erro;
        }
    }
    return jogo;
}

async function carregarJogoDoDia(): Promise<Carregamento> {
    try {
        const inicio = await comecarJogoDoDia();
        const salvo = await resultadoSalvoNaConta(inicio.dia);
        if (salvo) {
            return { situacao: "pronta", jogo: jogoSalvo(inicio, salvo), salvoNaConta: true };
        }
        const jogo = await refazerChutes(inicio, lerChutesDoDia(inicio.dia) ?? []);
        return { situacao: "pronta", jogo, salvoNaConta: false };
    } catch (erro) {
        return { situacao: "falhou", mensagem: traduzirErro(erro).mensagem };
    }
}

function useFocoAoAparecer<T extends HTMLElement>() {
    const elemento = useRef<T>(null);
    useEffect(() => {
        elemento.current?.focus();
    }, []);
    return elemento;
}

type PropsPainel = {
    categoria: string;
    erros: number;
};

function PainelDoDia({ categoria, erros }: PropsPainel) {
    return (
        <p className="jogo__painel">
            <span>
                Categoria: <strong>{categoria}</strong>
            </span>
            <span>
                Erros: <strong>{`${erros} de ${ERROS_PARA_PERDER}`}</strong>
            </span>
        </p>
    );
}

type SituacaoNaConta = "visitante" | "salvando" | "salvo" | "falhou";

function situacaoInicial(salvoNaConta: boolean): SituacaoNaConta {
    if (!lerSessao()) {
        return "visitante";
    }
    return salvoNaConta ? "salvo" : "salvando";
}

function useResultadoNaConta(dia: string, chutes: string[], salvoNaConta: boolean): SituacaoNaConta {
    const [situacao, setSituacao] = useState<SituacaoNaConta>(() => situacaoInicial(salvoNaConta));
    const letras = chutes.join("");

    useEffect(() => {
        if (!lerSessao() || salvoNaConta) {
            return;
        }
        let ativo = true;
        salvarResultado(dia, [...letras]).then(
            () => ativo && setSituacao("salvo"),
            (erro: unknown) => ativo && setSituacao(jaEstavaSalvo(erro) ? "salvo" : "falhou"),
        );
        return () => {
            ativo = false;
        };
    }, [dia, letras, salvoNaConta]);

    return situacao;
}

function AvisoDaConta({ situacao }: { situacao: SituacaoNaConta }) {
    if (situacao === "salvo") {
        return (
            <p className="jogo__salvo" role="status">
                Resultado salvo na sua conta. <Link to="/estatisticas">Ver suas estatísticas</Link>
            </p>
        );
    }
    if (situacao === "falhou") {
        return <Aviso mensagem="Não deu para salvar o resultado na sua conta agora. Vamos tentar de novo da próxima vez que você abrir o jogo." />;
    }
    return null;
}

type PropsComoTodoMundoFoi = {
    dia: string;
    rodada: Rodada;
    jaContado: boolean;
};

function ComoTodoMundoFoi({ dia, rodada, jaContado }: PropsComoTodoMundoFoi) {
    const [estatisticas, setEstatisticas] = useState<EstatisticasDoDia | null>(null);
    const [falhou, setFalhou] = useState(false);

    useEffect(() => {
        let ativo = true;
        buscarEstatisticasDoDia(dia).then(
            (dados) => ativo && setEstatisticas(dados),
            () => ativo && setFalhou(true),
        );
        return () => {
            ativo = false;
        };
    }, [dia]);

    if (falhou) {
        return <p className="jogo__aviso">Não deu para carregar como todo mundo foi hoje.</p>;
    }
    if (!estatisticas) {
        return null;
    }
    const seu = { acertou: rodada.estado === "acertou", chutes: rodada.chutes.length };
    return (
        <HistogramaDeLetras
            titulo="Como todo mundo foi hoje"
            subtitulo="Quantas pessoas acertaram com cada número de letras chutadas."
            nota={jaContado ? "Só entram as partidas de quem tem conta." : "Só entram as partidas de quem tem conta, mais a sua."}
            unidade="jogadores"
            colunas={colunasPorLetras(jaContado ? estatisticas : somarResultado(estatisticas, seu), seu)}
        />
    );
}

function ConviteParaCriarConta() {
    return (
        <aside className="jogo__convite" aria-labelledby="titulo-convite">
            <h3 id="titulo-convite" className="jogo__convite-titulo">
                Guarde seus resultados
            </h3>
            <p>Crie uma conta grátis para guardar suas partidas, ver a sua sequência de dias e saber se está melhorando.</p>
            <div className="jogo__convite-acoes">
                <Link to="/cadastro" className="botao">
                    Criar conta
                </Link>
                <Link to="/login" className="botao botao--discreto">
                    Entrar
                </Link>
            </div>
        </aside>
    );
}

type PropsFim = {
    rodada: Rodada;
    dia: string;
    salvoNaConta: boolean;
    aoVirarODia: () => void;
};

function FimDoDia({ rodada, dia, salvoNaConta, aoVirarODia }: PropsFim) {
    const titulo = useFocoAoAparecer<HTMLHeadingElement>();
    const naConta = useResultadoNaConta(dia, rodada.chutes, salvoNaConta);

    return (
        <section className="secao" aria-labelledby="titulo-fim-do-dia">
            <h2 id="titulo-fim-do-dia" className="secao__titulo" tabIndex={-1} ref={titulo}>
                {rodada.estado === "acertou" ? "Você acertou a palavra do dia!" : "O boneco ficou completo."}
            </h2>
            <p className="subtitulo">
                A palavra era <strong>{rodada.palavra}</strong>.
            </p>
            <dl className="jogo__resumo">
                <div>
                    <dt>Letras chutadas</dt>
                    <dd>{rodada.chutes.length}</dd>
                </div>
                <div>
                    <dt>Erros</dt>
                    <dd>{rodada.erros}</dd>
                </div>
            </dl>
            <AvisoDaConta situacao={naConta} />
            {naConta !== "salvando" && <ComoTodoMundoFoi dia={dia} rodada={rodada} jaContado={naConta === "salvo"} />}
            {naConta === "visitante" && <ConviteParaCriarConta />}
            <ProximaPalavra dia={dia} aoVirarODia={aoVirarODia} />
        </section>
    );
}

type PropsDoJogo = {
    inicial: JogoDoDia;
    salvoNaConta: boolean;
    aoVirarODia: () => void;
};

// A partida do dia na tela. A palavra fica no back: cada letra vai para lá pela fila (useFilaDeLetras), com o token
// da resposta anterior, e volta com as casas abertas. A palavra só chega no fim.
function JogoDoDiaNaTela({ inicial, salvoNaConta, aoVirarODia }: PropsDoJogo) {
    const [jogo, setJogo] = useState(inicial);
    const [aviso, setAviso] = useState("");
    // O token muda a cada resposta, e a próxima letra da fila precisa do mais novo: por isso fica num ref.
    const token = useRef(inicial.token);
    const pedir = useFilaDeLetras(
        async (letra) => {
            const novo = await chutarNoDia(token.current, letra);
            token.current = novo.token;
            guardarChutesDoDia(novo.dia, novo.letras);
            setJogo(novo);
            return novo.terminou;
        },
        (falha) => setAviso(traduzirErro(falha).mensagem),
    );
    // No fim, com a palavra, a Rodada desenha as casas que faltaram e faz o resumo.
    const fim = jogo.terminou && jogo.palavra ? Rodada.aPartirDosChutes(jogo.palavra, jogo.letras) : null;
    const { certas, erradas } = separarLetras(jogo.casas, jogo.letras);

    function teclar(tecla: string) {
        const letra = letraBase(tecla);
        if (jogo.terminou || !/^[A-Z]$/.test(letra)) {
            return;
        }
        setAviso(pedir(letra, jogo.letras) ? "" : `Você já tentou a letra ${letra}. Letra repetida não conta como erro.`);
    }

    const aoPressionarTecla = useEffectEvent((evento: KeyboardEvent) => {
        if (evento.ctrlKey || evento.metaKey || evento.altKey || evento.repeat || evento.key.length !== 1) {
            return;
        }
        teclar(evento.key);
    });

    useEffect(() => {
        const ouvir = (evento: KeyboardEvent) => aoPressionarTecla(evento);
        window.addEventListener("keydown", ouvir);
        return () => window.removeEventListener("keydown", ouvir);
    }, []);

    return (
        <>
            <PainelDoDia categoria={jogo.categoria} erros={jogo.erros} />
            <Forca erros={jogo.erros} />
            <Palavra casas={fim ? fim.casas : casasDaForca(jogo.casas)} mostrarResposta={fim !== null} />
            <p className="jogo__aviso" role="status">
                {aviso}
            </p>
            {fim ? (
                <FimDoDia rodada={fim} dia={jogo.dia} salvoNaConta={salvoNaConta} aoVirarODia={aoVirarODia} />
            ) : (
                <Teclado certas={certas} erradas={erradas} aoTeclar={teclar} />
            )}
        </>
    );
}

export function JogoPage() {
    const [carregamento, setCarregamento] = useState<Carregamento>({ situacao: "carregando" });

    useEffect(() => {
        let ativo = true;
        carregarJogoDoDia().then((resultado) => {
            if (ativo) {
                setCarregamento(resultado);
            }
        });
        return () => {
            ativo = false;
        };
    }, []);

    function recarregar() {
        setCarregamento({ situacao: "carregando" });
        carregarJogoDoDia().then(setCarregamento);
    }

    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo jogo">
                <h1 className="titulo">Palavra do dia</h1>
                <p className="subtitulo">
                    Descubra a palavra chutando uma letra por vez. Acento e ç não importam. No sexto erro, o boneco fica completo.
                </p>

                {carregamento.situacao === "carregando" && (
                    <p className="jogo__aviso" role="status">
                        Carregando a palavra do dia...
                    </p>
                )}

                {carregamento.situacao === "falhou" && (
                    <>
                        <Aviso mensagem={carregamento.mensagem} />
                        <button type="button" className="botao jogo__acao" onClick={recarregar}>
                            Tentar de novo
                        </button>
                    </>
                )}

                {carregamento.situacao === "pronta" && (
                    <JogoDoDiaNaTela
                        key={carregamento.jogo.dia}
                        inicial={carregamento.jogo}
                        salvoNaConta={carregamento.salvoNaConta}
                        aoVirarODia={recarregar}
                    />
                )}
            </main>
        </div>
    );
}
