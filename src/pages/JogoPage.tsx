import axios from "axios";
import { useEffect, useEffectEvent, useId, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { traduzirErro } from "../api/erros";
import { buscarEstatisticasDoDia, chutarNoDia, comecarJogoDoDia } from "../api/palavraDoDia";
import { buscarHistorico, jaEstavaSalvo, salvarResultado } from "../api/resultados";
import { Abas } from "../componentes/Abas";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { Dialogo } from "../componentes/Dialogo";
import { DistribuicaoDeErros } from "../componentes/DistribuicaoDeErros";
import { Forca } from "../componentes/Forca";
import { HistogramaDeLetras } from "../componentes/graficos/HistogramaDeLetras";
import { Palavra } from "../componentes/Palavra";
import { ProximaPalavra } from "../componentes/ProximaPalavra";
import { Teclado } from "../componentes/Teclado";
import { useFilaDeLetras } from "../hooks/useFilaDeLetras";
import { useTituloDaPagina } from "../hooks/useTituloDaPagina";
import { guardarChutesDoDia, lerChutesDoDia } from "../jogo/chutesDoDia";
import { compartilharTexto, textoDoResultado } from "../jogo/compartilhar";
import { distribuicaoDeErros } from "../jogo/distribuicaoDeErros";
import { casasDaForca, separarLetras } from "../jogo/forcaDaSala";
import { colunasPorLetras, somarResultado } from "../jogo/histogramaDeLetras";
import { resumirHistorico, type ResumoDoHistorico } from "../jogo/historico";
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
            <p className="resultado__salvo" role="status">
                Resultado salvo na sua conta. <Link to="/estatisticas">Ver suas estatísticas</Link>
            </p>
        );
    }
    if (situacao === "falhou") {
        return <Aviso mensagem="Não deu para salvar o resultado na sua conta agora. Vamos tentar de novo da próxima vez que você abrir o jogo." />;
    }
    return null;
}

type Busca<T> = { situacao: "carregando" } | { situacao: "falhou" } | { situacao: "pronta"; dados: T };

// Busca quando "pronto" vira true, e só uma vez. Espera o resultado ser salvo, para ele já entrar no que o back devolve.
function useBuscaQuandoPronto<T>(pronto: boolean, buscar: () => Promise<T>): Busca<T> {
    const [busca, setBusca] = useState<Busca<T>>({ situacao: "carregando" });
    const buscarAgora = useEffectEvent(buscar);

    useEffect(() => {
        if (!pronto) {
            return;
        }
        let ativo = true;
        buscarAgora().then(
            (dados) => ativo && setBusca({ situacao: "pronta", dados }),
            () => ativo && setBusca({ situacao: "falhou" }),
        );
        return () => {
            ativo = false;
        };
    }, [pronto]);

    return busca;
}

type PropsComoTodoMundoFoi = {
    estatisticas: Busca<EstatisticasDoDia>;
    rodada: Rodada;
    jaContado: boolean;
};

function ComoTodoMundoFoi({ estatisticas, rodada, jaContado }: PropsComoTodoMundoFoi) {
    if (estatisticas.situacao === "falhou") {
        return <p className="resultado__recado">Não deu para carregar como todo mundo foi hoje.</p>;
    }
    if (estatisticas.situacao === "carregando") {
        return <p className="resultado__recado">Carregando como todo mundo foi hoje...</p>;
    }
    const seu = { acertou: rodada.estado === "acertou", chutes: rodada.chutes.length };
    return (
        <HistogramaDeLetras
            titulo="Como todo mundo foi hoje"
            subtitulo="Quantas pessoas acertaram com cada número de letras chutadas."
            unidade="jogadores"
            colunas={colunasPorLetras(jaContado ? estatisticas.dados : somarResultado(estatisticas.dados, seu), seu)}
            tabelaSoParaLeitor
        />
    );
}

function ConviteParaCriarConta() {
    return (
        <aside className="resultado__convite" aria-labelledby="titulo-convite">
            <h3 id="titulo-convite" className="resultado__convite-titulo">
                Veja o seu progresso
            </h3>
            <p>
                Crie uma conta grátis para guardar suas partidas, ver a sua sequência de dias e com quantos erros você costuma acertar. A
                partida de hoje já entra na conta.
            </p>
            <div className="resultado__convite-acoes">
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

const porcentagem = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 0 });

type Numero = {
    rotulo: string;
    valor: string;
};

// Uma fileira de números grandes com o nome embaixo, com um título pequeno em cima.
function Numeros({ titulo, numeros }: { titulo: string; numeros: Numero[] }) {
    const idDoTitulo = useId();
    return (
        <section className="resultado__bloco" aria-labelledby={idDoTitulo}>
            <h3 id={idDoTitulo} className="resultado__bloco-titulo">
                {titulo}
            </h3>
            <dl className="resultado__numeros" style={{ "--colunas": numeros.length } as CSSProperties}>
                {numeros.map((numero) => (
                    <div key={numero.rotulo}>
                        <dt>{numero.rotulo}</dt>
                        <dd>{numero.valor}</dd>
                    </div>
                ))}
            </dl>
        </section>
    );
}

function NumerosDeHoje({ rodada }: { rodada: Rodada }) {
    return (
        <Numeros
            titulo="Hoje"
            numeros={[
                { rotulo: "letras chutadas", valor: String(rodada.chutes.length) },
                { rotulo: rodada.erros === 1 ? "erro" : "erros", valor: String(rodada.erros) },
            ]}
        />
    );
}

function NumerosDoProgresso({ resumo }: { resumo: ResumoDoHistorico }) {
    return (
        <Numeros
            titulo="Seu progresso"
            numeros={[
                { rotulo: "partidas", valor: String(resumo.partidas) },
                { rotulo: "de acertos", valor: porcentagem.format(resumo.taxaDeAcerto) },
                { rotulo: "sequência atual", valor: String(resumo.sequenciaAtual) },
                { rotulo: "melhor sequência", valor: String(resumo.melhorSequencia) },
            ]}
        />
    );
}

// O de hoje pode não estar no histórico do back (não deu para salvar). Aí ele entra daqui, para os números já contarem.
function comOResultadoDeHoje(resultados: ResultadoDiario[], hoje: ResultadoDiario): ResultadoDiario[] {
    return resultados.some((resultado) => resultado.dia === hoje.dia) ? resultados : [...resultados, hoje];
}

function resultadoDaRodada(rodada: Rodada, dia: string, categoria: string): ResultadoDiario {
    return {
        dia,
        categoria,
        palavra: rodada.palavra,
        letras: rodada.chutes,
        chutes: rodada.chutes.length,
        erros: rodada.erros,
        acertou: rodada.estado === "acertou",
    };
}

type PropsDoProgresso = {
    historico: Busca<ResultadoDiario[]>;
    hoje: ResultadoDiario;
    todoMundo: ReactNode;
};

function SeuProgresso({ historico, hoje, todoMundo }: PropsDoProgresso) {
    if (historico.situacao === "carregando") {
        return <p className="resultado__recado">Carregando o seu progresso...</p>;
    }
    if (historico.situacao === "falhou") {
        return (
            <>
                <p className="resultado__recado">Não deu para carregar o seu progresso agora.</p>
                {todoMundo}
            </>
        );
    }
    const resultados = comOResultadoDeHoje(historico.dados, hoje);
    return (
        <>
            <NumerosDoProgresso resumo={resumirHistorico(resultados, hoje.dia)} />
            <Abas
                rotulo="Qual distribuição"
                abas={[
                    {
                        id: "voce",
                        rotulo: "Você",
                        conteudo: <DistribuicaoDeErros titulo="Com quantos erros você acertou" linhas={distribuicaoDeErros(resultados, hoje)} />,
                    },
                    { id: "todo-mundo", rotulo: "Todo mundo hoje", conteudo: todoMundo },
                ]}
            />
        </>
    );
}

function BotaoCompartilhar({ texto }: { texto: string }) {
    const [recado, setRecado] = useState("");

    async function compartilhar() {
        const como = await compartilharTexto(texto);
        if (como === "copiou") {
            setRecado("Resultado copiado. É só colar onde quiser.");
        } else if (como === "falhou") {
            setRecado("Não deu para copiar o resultado. Tente de novo.");
        } else {
            setRecado("");
        }
    }

    return (
        <div className="resultado__compartilhar">
            <button type="button" className="botao" onClick={compartilhar}>
                Compartilhar
                <svg className="resultado__icone" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <circle cx="18" cy="5" r="3" />
                    <circle cx="6" cy="12" r="3" />
                    <circle cx="18" cy="19" r="3" />
                    <path d="M8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
                </svg>
            </button>
            <p className="resultado__copiado" role="status">
                {recado}
            </p>
        </div>
    );
}

type PropsDoResultado = {
    rodada: Rodada;
    dia: string;
    categoria: string;
    naConta: SituacaoNaConta;
    aoVirarODia: () => void;
};

// A janela do fim: os números de quem tem conta (ou o convite, para quem não tem), as distribuições, o relógio da
// próxima palavra e o botão de compartilhar.
function ResultadoDoDia({ rodada, dia, categoria, naConta, aoVirarODia }: PropsDoResultado) {
    const visitante = naConta === "visitante";
    const salvou = naConta !== "salvando";
    const estatisticas = useBuscaQuandoPronto(salvou, () => buscarEstatisticasDoDia(dia));
    const historico = useBuscaQuandoPronto(salvou && !visitante, () => buscarHistorico());
    const hoje = resultadoDaRodada(rodada, dia, categoria);
    const todoMundo = <ComoTodoMundoFoi estatisticas={estatisticas} rodada={rodada} jaContado={naConta === "salvo"} />;

    return (
        <>
            <p className="resultado__palavra">
                A palavra era <strong>{rodada.palavra}</strong>.
            </p>
            <AvisoDaConta situacao={naConta} />
            {visitante && (
                <>
                    <ConviteParaCriarConta />
                    <NumerosDeHoje rodada={rodada} />
                    {todoMundo}
                </>
            )}
            {!visitante && <NumerosDeHoje rodada={rodada} />}
            {!visitante && salvou && <SeuProgresso historico={historico} hoje={hoje} todoMundo={todoMundo} />}
            <div className="resultado__rodape">
                <ProximaPalavra dia={dia} aoVirarODia={aoVirarODia} />
                <BotaoCompartilhar texto={textoDoResultado(rodada, dia, categoria, `${window.location.origin}/jogo`)} />
            </div>
        </>
    );
}

// O tempo para a palavra se completar na tela antes de a janela do resultado cobrir tudo.
const ESPERA_PARA_MOSTRAR_O_RESULTADO = 600;

type PropsFim = {
    rodada: Rodada;
    dia: string;
    categoria: string;
    salvoNaConta: boolean;
    aoVirarODia: () => void;
};

function FimDoDia({ rodada, dia, categoria, salvoNaConta, aoVirarODia }: PropsFim) {
    const titulo = useFocoAoAparecer<HTMLHeadingElement>();
    const naConta = useResultadoNaConta(dia, rodada.chutes, salvoNaConta);
    const [aberto, setAberto] = useState(false);
    const acertou = rodada.estado === "acertou";

    useEffect(() => {
        const espera = window.setTimeout(() => setAberto(true), ESPERA_PARA_MOSTRAR_O_RESULTADO);
        return () => window.clearTimeout(espera);
    }, []);

    return (
        <>
            <section className="secao" aria-labelledby="titulo-fim-do-dia">
                <h2 id="titulo-fim-do-dia" className="secao__titulo" tabIndex={-1} ref={titulo}>
                    {acertou ? "Você acertou a palavra do dia!" : "O boneco ficou completo."}
                </h2>
                <p className="subtitulo">
                    A palavra era <strong>{rodada.palavra}</strong>.
                </p>
                <button type="button" className="botao jogo__acao" aria-haspopup="dialog" onClick={() => setAberto(true)}>
                    Ver resultado
                </button>
            </section>
            <Dialogo aberto={aberto} titulo={acertou ? "Você acertou!" : "Não foi dessa vez"} aoFechar={() => setAberto(false)}>
                <ResultadoDoDia rodada={rodada} dia={dia} categoria={categoria} naConta={naConta} aoVirarODia={aoVirarODia} />
            </Dialogo>
        </>
    );
}

type PropsDoJogo = {
    inicial: JogoDoDia;
    salvoNaConta: boolean;
    aoVirarODia: () => void;
};

// A partida do dia na tela. A palavra fica no back: cada letra vai para lá pela fila (useFilaDeLetras), com o token
// da resposta anterior, e volta com as casas abertas. A palavra só chega no fim.
// O que a letra fez, para o aviso do jogo (role="status", sempre montado): quem não vê a forca e as casas ouve se a
// letra estava na palavra. No fim, quem fala é o título do fim, que recebe o foco.
function recadoDaLetra(letra: string, jogo: JogoDoDia): string {
    if (jogo.terminou) {
        return "";
    }
    const casas = jogo.casas.filter((casa) => casa !== null && letraBase(casa) === letra).length;
    if (casas > 0) {
        return casas === 1 ? `${letra} está na palavra.` : `${letra} está na palavra (${casas} casas).`;
    }
    return `${letra} não está na palavra. ${jogo.erros} de ${ERROS_PARA_PERDER} erros.`;
}

function JogoDoDiaNaTela({ inicial, salvoNaConta, aoVirarODia }: PropsDoJogo) {
    const [jogo, setJogo] = useState(inicial);
    const [aviso, setAviso] = useState("");
    // A falha de envio é um erro (Aviso vermelho, role="alert"), e não uma dica: fica separada do aviso do jogo.
    const [falha, setFalha] = useState<string | null>(null);
    // O token muda a cada resposta, e a próxima letra da fila precisa do mais novo: por isso fica num ref.
    const token = useRef(inicial.token);
    const pedir = useFilaDeLetras(
        async (letra) => {
            const novo = await chutarNoDia(token.current, letra);
            token.current = novo.token;
            guardarChutesDoDia(novo.dia, novo.letras);
            setJogo(novo);
            setFalha(null);
            setAviso(recadoDaLetra(letra, novo));
            return novo.terminou;
        },
        (erro) => {
            setAviso("");
            setFalha(traduzirErro(erro).mensagem);
        },
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
            <Aviso mensagem={falha} />
            <p className="jogo__aviso" role="status">
                {aviso}
            </p>
            {fim ? (
                <FimDoDia rodada={fim} dia={jogo.dia} categoria={jogo.categoria} salvoNaConta={salvoNaConta} aoVirarODia={aoVirarODia} />
            ) : (
                <Teclado certas={certas} erradas={erradas} aoTeclar={teclar} />
            )}
        </>
    );
}

export function JogoPage() {
    useTituloDaPagina("Palavra do dia");
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
