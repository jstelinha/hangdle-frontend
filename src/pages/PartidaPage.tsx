import { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { traduzirErro } from "../api/erros";
import { chutarLetra, comecarPartida, escolherPalavra } from "../api/partida";
import { salas } from "../api/salas";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { CampoTexto } from "../componentes/CampoTexto";
import { Cronometro } from "../componentes/Cronometro";
import { Forca } from "../componentes/Forca";
import { Palavra } from "../componentes/Palavra";
import { Placar } from "../componentes/Placar";
import { Teclado } from "../componentes/Teclado";
import { TopoDaPagina } from "../componentes/TopoDaPagina";
import { useCarregamento } from "../hooks/useCarregamento";
import { useFormulario } from "../hooks/useFormulario";
import { usePartida } from "../hooks/usePartida";
import { casasDaForca, casasDaPalavra, separarLetras, totalDeLetras } from "../jogo/forcaDaSala";
import { letraBase } from "../jogo/letras";
import { ERROS_PARA_PERDER } from "../jogo/Rodada";
import { useSessao } from "../sessao/contexto";
import type { EscolhaDaPalavra, EstadoDaPartida, ForcaDeOutro, MinhaForca, OpcaoDePalavra, ResultadoDaVez, VezEmAndamento } from "../types/partida";
import { DICA, esquemaPalavra, PALAVRA } from "../validacao/esquemasDasListas";
import "./Jogo.css";
import "./Partida.css";

type AoEscolher = (escolha: EscolhaDaPalavra) => Promise<void>;
type AoChutar = (letra: string) => Promise<void>;

function plural(quantidade: number, singular: string, varios: string): string {
    return `${quantidade} ${quantidade === 1 ? singular : varios}`;
}

type PropsDaEspera = {
    estado: EstadoDaPartida;
    souDono: boolean;
    comecando: boolean;
    aoComecar: () => void;
};

function SalaDeEspera({ estado, souDono, comecando, aoComecar }: PropsDaEspera) {
    const poucos = estado.placar.length < 2;

    return (
        <section className="secao" aria-labelledby="titulo-espera">
            <h2 id="titulo-espera" className="secao__titulo">
                Esperando para começar
            </h2>
            <p className="subtitulo">
                {`Em cada uma das ${plural(estado.rodadas, "rodada", "rodadas")}, cada jogador escolhe uma palavra e os outros tentam adivinhar ao mesmo tempo, cada um na própria forca.`}
            </p>
            <ul className="partida__espera">
                {estado.placar.map((jogador) => (
                    <li key={jogador.participanteId}>
                        {jogador.apelido}
                        {jogador.participanteId === estado.eu && <span className="partida__voce"> (você)</span>}
                    </li>
                ))}
            </ul>
            {souDono ? (
                <>
                    <button type="button" className="botao partida__acao" disabled={poucos || comecando} onClick={aoComecar}>
                        {comecando ? "Começando..." : "Começar a partida"}
                    </button>
                    {poucos && <p className="partida__recado">A partida precisa de pelo menos 2 jogadores. Mande o link da sala para alguém.</p>}
                </>
            ) : (
                <p className="partida__recado" role="status">
                    Esperando quem criou a sala começar a partida.
                </p>
            )}
        </section>
    );
}

function OpcoesDaLista({ opcoes, aoEscolher }: { opcoes: OpcaoDePalavra[]; aoEscolher: AoEscolher }) {
    const [erro, setErro] = useState<string | null>(null);
    const [enviando, setEnviando] = useState(false);

    async function escolher(palavraId: number) {
        setEnviando(true);
        setErro(null);
        try {
            await aoEscolher({ palavraId });
        } catch (falha) {
            setErro(traduzirErro(falha).mensagem);
            setEnviando(false);
        }
    }

    return (
        <>
            <Aviso mensagem={erro} />
            <ul className="partida__opcoes">
                {opcoes.map((opcao) => (
                    <li key={opcao.id}>
                        <button type="button" className="partida__opcao" disabled={enviando} onClick={() => void escolher(opcao.id)}>
                            <strong>{opcao.palavra}</strong>
                            {opcao.dica && <span className="partida__dica-da-opcao">Dica: {opcao.dica}</span>}
                        </button>
                    </li>
                ))}
            </ul>
        </>
    );
}

// Rubrica de Front-end - Cruds Completos - Validação dos campos obrigatórios
function PalavraDigitada({ aoEscolher }: { aoEscolher: AoEscolher }) {
    const { valores, erros, erroDaApi, enviando, alterar, enviar } = useFormulario(esquemaPalavra, { palavra: "", dica: "" });

    return (
        <form
            className="partida__formulario"
            noValidate
            onSubmit={(evento) => {
                evento.preventDefault();
                void enviar(aoEscolher);
            }}
        >
            <Aviso mensagem={erroDaApi} />
            <CampoTexto id="palavra" rotulo="Palavra" valor={valores.palavra} aoMudar={(valor) => alterar("palavra", valor)} erro={erros.palavra} maxLength={PALAVRA.maximo} autoComplete="off">
                Só você vê a palavra. Use só letras, com espaço ou hífen entre as partes.
            </CampoTexto>
            <CampoTexto id="dica" rotulo="Dica (opcional)" valor={valores.dica} aoMudar={(valor) => alterar("dica", valor)} erro={erros.dica} maxLength={DICA.maximo} autoComplete="off" />
            <button type="submit" className="botao partida__acao" disabled={enviando}>
                {enviando ? "Enviando..." : "Escolher esta palavra"}
            </button>
        </form>
    );
}

function EscolherPalavra({ vez, aoEscolher }: { vez: VezEmAndamento; aoEscolher: AoEscolher }) {
    const opcoes = vez.opcoes ?? [];

    return (
        <section className="secao" aria-labelledby="titulo-escolha">
            <h2 id="titulo-escolha" className="secao__titulo">
                Sua vez de escolher a palavra
            </h2>
            <Cronometro segundos={vez.segundosRestantes} rotulo="Tempo para escolher" />
            {opcoes.length > 0 ? <OpcoesDaLista opcoes={opcoes} aoEscolher={aoEscolher} /> : <PalavraDigitada aoEscolher={aoEscolher} />}
            <p className="partida__recado">Se o tempo acabar, o jogo sorteia uma palavra por você.</p>
        </section>
    );
}

function recadoDaForca(forca: MinhaForca): string {
    if (forca.acertou) {
        return "Você acertou! Agora é esperar os outros.";
    }
    return forca.terminou ? "O boneco ficou completo. Agora é esperar os outros." : "";
}

function MinhaForcaNaVez({ vez, forca, aoChutar }: { vez: VezEmAndamento; forca: MinhaForca; aoChutar: AoChutar }) {
    const [aviso, setAviso] = useState("");
    const enviando = useRef(false);
    const { certas, erradas } = separarLetras(forca.casas, forca.letras);

    async function teclar(tecla: string) {
        const letra = letraBase(tecla);
        if (enviando.current || forca.terminou || !/^[A-Z]$/.test(letra)) {
            return;
        }
        if (forca.letras.includes(letra)) {
            setAviso(`Você já tentou a letra ${letra}.`);
            return;
        }
        enviando.current = true;
        setAviso("");
        try {
            await aoChutar(letra);
        } catch (falha) {
            setAviso(traduzirErro(falha).mensagem);
        } finally {
            enviando.current = false;
        }
    }

    const aoPressionarTecla = useEffectEvent((evento: KeyboardEvent) => {
        if (evento.ctrlKey || evento.metaKey || evento.altKey || evento.repeat || evento.key.length !== 1) {
            return;
        }
        void teclar(evento.key);
    });

    useEffect(() => {
        const ouvir = (evento: KeyboardEvent) => aoPressionarTecla(evento);
        window.addEventListener("keydown", ouvir);
        return () => window.removeEventListener("keydown", ouvir);
    }, []);

    return (
        <section aria-label="Sua forca">
            <p className="jogo__painel">
                <span>
                    Dica: <strong>{vez.dica ?? "sem dica"}</strong>
                </span>
                <span>
                    Erros: <strong>{`${forca.erros} de ${ERROS_PARA_PERDER}`}</strong>
                </span>
            </p>
            <Forca erros={forca.erros} />
            <Palavra casas={casasDaForca(forca.casas)} mostrarResposta={false} />
            <p className="jogo__aviso" role="status">
                {aviso || recadoDaForca(forca)}
            </p>
            {!forca.terminou && <Teclado certas={certas} erradas={erradas} aoTeclar={(letra) => void teclar(letra)} />}
        </section>
    );
}

function PalavraDeQuemEscolheu({ palavra }: { palavra: string }) {
    return (
        <section aria-label="Sua palavra">
            <p className="partida__recado">Você escolheu a palavra. Agora é acompanhar os outros.</p>
            <Palavra casas={casasDaPalavra(palavra)} mostrarResposta />
        </section>
    );
}

function progresso(forca: ForcaDeOutro, letras: number): string {
    if (forca.acertou) {
        return "Acertou!";
    }
    if (forca.terminou) {
        return "Boneco completo";
    }
    return `${forca.casasAbertas} de ${letras} letras`;
}

// Rubrica de Front-end - Componentização - Telas compostas por vários componentes
function ForcasDosJogadores({ forcas, eu, letras }: { forcas: ForcaDeOutro[]; eu: number; letras: number }) {
    return (
        <section className="secao" aria-labelledby="titulo-forcas">
            <h2 id="titulo-forcas" className="secao__titulo">
                Como cada um está
            </h2>
            <ul className="partida__forcas">
                {forcas.map((forca) => (
                    <li key={forca.participanteId} className="partida__forca">
                        <Forca erros={forca.erros} pequena de={forca.apelido} />
                        <span className="partida__apelido">
                            {forca.apelido}
                            {forca.participanteId === eu && <span className="partida__voce"> (você)</span>}
                        </span>
                        <span className="partida__progresso">{progresso(forca, letras)}</span>
                    </li>
                ))}
            </ul>
        </section>
    );
}

function ResultadoDaVezAnterior({ resultado }: { resultado: ResultadoDaVez }) {
    return (
        <section className="secao" aria-labelledby="titulo-resultado">
            <h2 id="titulo-resultado" className="secao__titulo">
                A palavra era {resultado.palavra}
            </h2>
            <p className="subtitulo">
                {`Escolhida por ${resultado.escolhedor.apelido}${resultado.dica ? `, com a dica "${resultado.dica}"` : ""}.`}
            </p>
            <Palavra casas={casasDaPalavra(resultado.palavra)} mostrarResposta />
            <table className="tabela">
                <caption>Pontos desta palavra</caption>
                <thead>
                    <tr>
                        <th scope="col">Jogador</th>
                        <th scope="col">Como foi</th>
                        <th scope="col" className="numero">
                            Pontos
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {resultado.jogadores.map((jogador) => (
                        <tr key={jogador.participanteId}>
                            <td>{jogador.apelido}</td>
                            <td>{jogador.acertou ? `Acertou com ${plural(jogador.erros, "erro", "erros")}` : "Não acertou"}</td>
                            <td className="numero">{jogador.pontos}</td>
                        </tr>
                    ))}
                    <tr>
                        <td>{resultado.escolhedor.apelido}</td>
                        <td>Escolheu a palavra</td>
                        <td className="numero">{resultado.pontosDeQuemEscolheu}</td>
                    </tr>
                </tbody>
            </table>
        </section>
    );
}

type PropsDaVez = {
    estado: EstadoDaPartida;
    vez: VezEmAndamento;
    aoEscolher: AoEscolher;
    aoChutar: AoChutar;
};

function VezDaPartida({ estado, vez, aoEscolher, aoChutar }: PropsDaVez) {
    const souQuemEscolhe = vez.escolhedor.participanteId === estado.eu;
    const quemEscolhe = souQuemEscolhe ? "Você" : vez.escolhedor.apelido;

    if (vez.fase === "intervalo") {
        return (
            <>
                {estado.anterior && <ResultadoDaVezAnterior resultado={estado.anterior} />}
                <Cronometro segundos={vez.segundosRestantes} rotulo={`${quemEscolhe} escolhe a próxima palavra em`} />
            </>
        );
    }
    if (vez.fase === "escolhendo") {
        return souQuemEscolhe ? (
            <EscolherPalavra vez={vez} aoEscolher={aoEscolher} />
        ) : (
            <section className="secao">
                <p className="partida__recado" role="status">
                    {vez.escolhedor.apelido} está escolhendo a palavra.
                </p>
                <Cronometro segundos={vez.segundosRestantes} rotulo="Tempo para escolher" />
            </section>
        );
    }
    const letras = vez.minhaForca ? totalDeLetras(vez.minhaForca.casas) : totalDeLetras([...(vez.palavra ?? "")]);
    return (
        <>
            <Cronometro segundos={vez.segundosRestantes} rotulo="Tempo para adivinhar" />
            {vez.palavra && <PalavraDeQuemEscolheu palavra={vez.palavra} />}
            {vez.minhaForca && <MinhaForcaNaVez vez={vez} forca={vez.minhaForca} aoChutar={aoChutar} />}
            <ForcasDosJogadores forcas={vez.forcas} eu={estado.eu} letras={letras} />
        </>
    );
}

function quemGanhou(estado: EstadoDaPartida): string {
    const maior = Math.max(...estado.placar.map((jogador) => jogador.pontos));
    const vencedores = estado.placar.filter((jogador) => jogador.pontos === maior).map((jogador) => jogador.apelido);
    return vencedores.length === 1 ? `${vencedores[0]} ganhou a partida!` : `Empate entre ${vencedores.join(" e ")}!`;
}

function FimDaPartida({ estado }: { estado: EstadoDaPartida }) {
    return (
        <>
            <section className="secao" aria-labelledby="titulo-fim">
                <h2 id="titulo-fim" className="secao__titulo">
                    Fim de jogo
                </h2>
                {estado.placar.length > 0 && <p className="partida__vencedor">{quemGanhou(estado)}</p>}
                <Link to="/salas" className="botao botao--discreto partida__acao">
                    Voltar para as salas
                </Link>
            </section>
            {estado.anterior && <ResultadoDaVezAnterior resultado={estado.anterior} />}
        </>
    );
}

function PartidaFechada({ salaId, mensagem }: { salaId: number; mensagem: string | null }) {
    return (
        <div className="secao">
            <Aviso mensagem={mensagem} />
            <p className="partida__acao">
                <Link to={`/salas/${salaId}/entrar`} className="botao">
                    Entrar na sala
                </Link>
            </p>
        </div>
    );
}

// A partida da sala: a espera, a vez de cada um, o placar e o fim. A tela pergunta pela partida a cada segundo.
export function PartidaPage() {
    const salaId = Number(useParams().id);
    const usuarioId = useSessao()?.usuario.id;
    const { carregamento: daSala } = useCarregamento(useCallback(() => salas.buscar(salaId), [salaId]));
    const { estado, erro, parou, agir } = usePartida(salaId);
    const [aviso, setAviso] = useState<string | null>(null);
    const [comecando, setComecando] = useState(false);
    const sala = daSala.situacao === "pronta" ? daSala.dados : null;

    async function comecar() {
        setComecando(true);
        setAviso(null);
        try {
            await agir(() => comecarPartida(salaId));
        } catch (falha) {
            setAviso(traduzirErro(falha).mensagem);
        } finally {
            setComecando(false);
        }
    }

    const escolher: AoEscolher = (escolha) => agir(() => escolherPalavra(salaId, escolha));
    const chutar: AoChutar = (letra) => agir(() => chutarLetra(salaId, letra));
    const placar = (estado?.placar ?? []).map((jogador) => ({
        id: jogador.participanteId,
        nome: jogador.apelido,
        pontos: jogador.pontos,
        destaque: jogador.participanteId === estado?.eu,
    }));

    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo jogo">
                <TopoDaPagina titulo={sala?.nome ?? "Partida"} voltar={{ para: `/salas/${salaId}`, rotulo: "Voltar para a sala" }} />
                <Aviso mensagem={aviso} />

                {parou && <PartidaFechada salaId={salaId} mensagem={erro} />}
                {!parou && !estado && (erro ? <Aviso mensagem={erro} /> : <p className="jogo__aviso" role="status">Carregando a partida...</p>)}
                {!parou && estado && (
                    <>
                        {erro && <Aviso mensagem={`${erro} Tentando de novo...`} />}
                        {estado.situacao === "esperando" && <SalaDeEspera estado={estado} souDono={sala?.donoId === usuarioId} comecando={comecando} aoComecar={() => void comecar()} />}
                        {estado.situacao === "jogando" && (
                            <>
                                {estado.vez && (
                                    <p className="partida__rodada">
                                        {`Rodada ${estado.vez.rodada} de ${estado.rodadas} · vez de ${estado.vez.escolhedor.participanteId === estado.eu ? "você" : estado.vez.escolhedor.apelido}`}
                                    </p>
                                )}
                                {estado.vez ? (
                                    <VezDaPartida estado={estado} vez={estado.vez} aoEscolher={escolher} aoChutar={chutar} />
                                ) : (
                                    <p className="jogo__aviso" role="status">
                                        Preparando a próxima vez...
                                    </p>
                                )}
                                <Placar titulo="Placar" linhas={placar} />
                            </>
                        )}
                        {estado.situacao === "encerrada" && (
                            <>
                                <FimDaPartida estado={estado} />
                                <Placar titulo="Placar final" linhas={placar} />
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
