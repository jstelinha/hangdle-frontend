import { useEffect, useEffectEvent, useRef, useState } from "react";
import { traduzirErro } from "../api/erros";
import { buscarPalavraDoDia } from "../api/palavraDoDia";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { Forca } from "../componentes/Forca";
import { Palavra } from "../componentes/Palavra";
import { Teclado } from "../componentes/Teclado";
import { letraBase } from "../jogo/letras";
import { ERROS_PARA_PERDER, Rodada } from "../jogo/Rodada";
import type { PalavraDoDia } from "../types/jogo";
import "./Jogo.css";

type Carregamento =
    | { situacao: "carregando" }
    | { situacao: "falhou"; mensagem: string }
    | { situacao: "pronta"; palavraDoDia: PalavraDoDia; rodada: Rodada };

async function carregarPalavraDoDia(): Promise<Carregamento> {
    try {
        const palavraDoDia = await buscarPalavraDoDia();
        return { situacao: "pronta", palavraDoDia, rodada: new Rodada(palavraDoDia.palavra) };
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

type PropsFim = {
    rodada: Rodada;
};

function FimDoDia({ rodada }: PropsFim) {
    const titulo = useFocoAoAparecer<HTMLHeadingElement>();

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

    function tentarDeNovo() {
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
                        <button type="button" className="botao jogo__acao" onClick={tentarDeNovo}>
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
                            <Teclado certas={pronta.rodada.letrasCertas} erradas={pronta.rodada.letrasErradas} desativado={false} aoTeclar={teclar} />
                        ) : (
                            <FimDoDia rodada={pronta.rodada} />
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
