import { useEffect, useEffectEvent, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { traduzirErro } from "../api/erros";
import { buscarEstatisticasDoDia, buscarPalavraDoDia } from "../api/palavraDoDia";
import { buscarHistorico, jaEstavaSalvo, salvarResultado } from "../api/resultados";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { Forca } from "../componentes/Forca";
import { HistogramaDeLetras } from "../componentes/graficos/HistogramaDeLetras";
import { Palavra } from "../componentes/Palavra";
import { ProximaPalavra } from "../componentes/ProximaPalavra";
import { Teclado } from "../componentes/Teclado";
import { guardarChutesDoDia, lerChutesDoDia } from "../jogo/chutesDoDia";
import { colunasPorLetras, somarResultado } from "../jogo/histogramaDeLetras";
import { letraBase } from "../jogo/letras";
import { ERROS_PARA_PERDER, Rodada } from "../jogo/Rodada";
import { lerSessao } from "../sessao/sessao";
import type { EstatisticasDoDia, PalavraDoDia } from "../types/jogo";
import "./Jogo.css";

type Carregamento =
    | { situacao: "carregando" }
    | { situacao: "falhou"; mensagem: string }
    | { situacao: "pronta"; palavraDoDia: PalavraDoDia; rodada: Rodada; salvoNaConta: boolean };

async function chutesSalvosNaConta(dia: string): Promise<string[] | null> {
    if (!lerSessao()) {
        return null;
    }
    try {
        const [salvo] = await buscarHistorico(dia);
        return salvo?.letras ?? null;
    } catch {
        return null;
    }
}

async function carregarPalavraDoDia(): Promise<Carregamento> {
    try {
        const palavraDoDia = await buscarPalavraDoDia();
        const salvos = await chutesSalvosNaConta(palavraDoDia.dia);
        const chutes = salvos ?? lerChutesDoDia(palavraDoDia.dia) ?? [];
        return {
            situacao: "pronta",
            palavraDoDia,
            rodada: Rodada.aPartirDosChutes(palavraDoDia.palavra, chutes),
            salvoNaConta: salvos !== null,
        };
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

export function JogoPage() {
    const [carregamento, setCarregamento] = useState<Carregamento>({ situacao: "carregando" });
    const [aviso, setAviso] = useState("");
    const [, setTique] = useState(0);

    const pronta = carregamento.situacao === "pronta" ? carregamento : null;
    const jogando = pronta?.rodada.estado === "jogando";

    useEffect(() => {
        let ativo = true;
        carregarPalavraDoDia().then((resultado) => {
            if (ativo) {
                setCarregamento(resultado);
            }
        });
        return () => {
            ativo = false;
        };
    }, []);

    function recarregar() {
        setAviso("");
        setCarregamento({ situacao: "carregando" });
        carregarPalavraDoDia().then(setCarregamento);
    }

    function teclar(tecla: string) {
        if (!pronta) {
            return;
        }
        const resultado = pronta.rodada.chutar(tecla);
        if (resultado === "repetida") {
            setAviso(`Você já tentou a letra ${letraBase(tecla)}. Letra repetida não conta como erro.`);
        } else if (resultado === "acerto" || resultado === "erro") {
            setAviso("");
            guardarChutesDoDia(pronta.palavraDoDia.dia, pronta.rodada.chutes);
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

                {pronta && (
                    <>
                        <PainelDoDia categoria={pronta.palavraDoDia.categoria} erros={pronta.rodada.erros} />
                        <Forca erros={pronta.rodada.erros} />
                        <Palavra casas={pronta.rodada.casas} mostrarResposta={!jogando} />
                        <p className="jogo__aviso" role="status">
                            {aviso}
                        </p>
                        {jogando ? (
                            <Teclado certas={pronta.rodada.letrasCertas} erradas={pronta.rodada.letrasErradas} aoTeclar={teclar} />
                        ) : (
                            <FimDoDia rodada={pronta.rodada} dia={pronta.palavraDoDia.dia} salvoNaConta={pronta.salvoNaConta} aoVirarODia={recarregar} />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
