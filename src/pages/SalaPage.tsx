import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { traduzirErro } from "../api/erros";
import { participantesDaSala, salas } from "../api/salas";
import { AcoesDaLinha } from "../componentes/AcoesDaLinha";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { CampoTexto } from "../componentes/CampoTexto";
import { TabelaPaginada, type Coluna } from "../componentes/TabelaPaginada";
import { TopoDaPagina } from "../componentes/TopoDaPagina";
import { comAviso, useAvisoDaNavegacao } from "../hooks/useAvisoDaNavegacao";
import { useCarregamento } from "../hooks/useCarregamento";
import { useListagem } from "../hooks/useListagem";
import { linkDoConvite, rodadasDaSala, SITUACAO_DA_SALA } from "../salas/descricao";
import { useSessao } from "../sessao/contexto";
import type { Participante, Sala } from "../types/sala";
import "./Salas.css";

const IR_PARA_A_PARTIDA: Record<Sala["situacao"], string> = {
    esperando: "Ir para a partida",
    jogando: "Ir para a partida",
    encerrada: "Ver o placar final",
};

const COLUNAS: Coluna[] = [{ titulo: "Jogador" }, { titulo: "Pontos", tipo: "numero" }, { titulo: "Ações", tipo: "acoes" }];

function legenda(total: number): string {
    return total === 1 ? "1 jogador" : `${total} jogadores`;
}

function DadosDaSala({ sala }: { sala: Sala }) {
    const dados = [
        { rotulo: "Situação", valor: SITUACAO_DA_SALA[sala.situacao] },
        { rotulo: "Rodadas", valor: rodadasDaSala(sala) },
        { rotulo: "Jogadores", valor: `${sala.jogadores} de ${sala.maximoDeJogadores}` },
        { rotulo: "Entrada", valor: sala.privada ? "Com senha" : "Aberta" },
    ];
    return (
        <dl className="sala__dados">
            {dados.map((dado) => (
                <div key={dado.rotulo}>
                    <dt>{dado.rotulo}</dt>
                    <dd>{dado.valor}</dd>
                </div>
            ))}
        </dl>
    );
}

function Convite({ sala }: { sala: Sala }) {
    const link = linkDoConvite(sala.id);
    const [recado, setRecado] = useState<string | null>(null);

    async function copiar() {
        try {
            await navigator.clipboard.writeText(link);
            setRecado("Link copiado.");
        } catch {
            setRecado("Não deu para copiar. Selecione o link e copie.");
        }
    }

    return (
        <section className="secao" aria-labelledby="titulo-convite">
            <h2 id="titulo-convite" className="secao__titulo">
                Chamar o pessoal
            </h2>
            <div className="sala__convite">
                <CampoTexto id="convite" rotulo="Link do convite" valor={link} somenteLeitura>
                    {sala.privada ? "Quem entrar pelo link vai precisar da senha da sala." : "Quem tiver o link entra direto."}
                </CampoTexto>
                <button type="button" className="botao botao--discreto" onClick={copiar}>
                    Copiar link
                </button>
            </div>
            {recado && (
                <p role="status" className="sala__recado">
                    {recado}
                </p>
            )}
        </section>
    );
}

function ConviteParaEntrar({ sala, motivo }: { sala: Sala | null; motivo: string }) {
    return (
        <div className="secao">
            <p>{motivo}</p>
            {sala && sala.situacao !== "encerrada" && (
                <p className="sala__entrar">
                    <Link to={`/salas/${sala.id}/entrar`} className="botao">
                        Entrar na sala
                    </Link>
                </p>
            )}
        </div>
    );
}

type PropsDaLinha = {
    participante: Participante;
    souEu: boolean;
    souDonoDaSala: boolean;
    aoSair: (participante: Participante) => Promise<void>;
};

// Rubrica de Front-end - Componentização - Componentes exclusivos de uma página em funções separadas
function LinhaDoParticipante({ participante, souEu, souDonoDaSala, aoSair }: PropsDaLinha) {
    const { id, salaId, apelido, pontos, dono } = participante;
    const podeSair = souEu && !dono;
    const podeTirar = !souEu && souDonoDaSala;

    return (
        <tr>
            <td>
                <span className="salas__nome">{apelido}</span>
                {(souEu || dono) && <span className="salas__resumo">{[souEu ? "você" : null, dono ? "criou a sala" : null].filter(Boolean).join(" · ")}</span>}
            </td>
            <td className="numero">{pontos}</td>
            <td className="tabela__acoes">
                <AcoesDaLinha
                    nome={apelido}
                    editarEm={souEu ? `/salas/${salaId}/participantes/${id}/editar` : undefined}
                    rotuloDeEditar="Trocar apelido"
                    aoApagar={podeSair || podeTirar ? () => aoSair(participante) : undefined}
                    rotuloDeApagar={podeSair ? "Sair" : "Tirar"}
                />
            </td>
        </tr>
    );
}

// Rubrica de Front-end - Cruds Completos - Listagem e cadastro/edição em telas separadas
// A sala e a listagem dos participantes; entrar e trocar o apelido ficam em telas próprias.
export function SalaPage() {
    const salaId = Number(useParams().id);
    const usuarioId = useSessao()?.usuario.id;
    const navegar = useNavigate();
    const [aviso, setAviso] = useAvisoDaNavegacao();
    const { carregamento: daSala, recarregar: recarregarSala } = useCarregamento(useCallback(() => salas.buscar(salaId), [salaId]));
    const participantes = useMemo(() => participantesDaSala(salaId), [salaId]);
    const { carregamento: dosParticipantes, recarregar: recarregarParticipantes } = useListagem(participantes.listar);

    const sala = daSala.situacao === "pronta" ? daSala.dados : null;
    const souDonoDaSala = sala?.donoId === usuarioId;

    async function sair(participante: Participante) {
        try {
            await participantes.apagar(participante.id);
            if (participante.usuarioId === usuarioId) {
                navegar("/salas?filtro=minhas", comAviso(sala ? `Você saiu da sala ${sala.nome}.` : "Você saiu da sala."));
                return;
            }
            setAviso({ tipo: "sucesso", mensagem: `${participante.apelido} saiu da sala.` });
            recarregarSala();
            recarregarParticipantes();
        } catch (erro) {
            setAviso({ tipo: "erro", mensagem: traduzirErro(erro).mensagem });
        }
    }

    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo">
                <TopoDaPagina titulo={sala?.nome ?? "Sala"} voltar={{ para: "/salas", rotulo: "Salas" }}>
                    {sala && souDonoDaSala && sala.situacao === "esperando" && (
                        <Link to={`/salas/${sala.id}/editar`} className="botao botao--discreto">
                            Editar sala
                        </Link>
                    )}
                </TopoDaPagina>

                <Aviso mensagem={aviso?.mensagem ?? null} tipo={aviso?.tipo} />
                {daSala.situacao === "falhou" && <Aviso mensagem={daSala.mensagem} />}
                {sala && <DadosDaSala sala={sala} />}

                {dosParticipantes.situacao === "falhou" ? (
                    daSala.situacao !== "falhou" && <ConviteParaEntrar sala={sala} motivo={dosParticipantes.mensagem} />
                ) : (
                    <>
                        <TabelaPaginada
                            carregamento={dosParticipantes}
                            legenda={legenda}
                            colunas={COLUNAS}
                            carregando="Carregando os jogadores..."
                            vazia={<p>Ninguém nesta página.</p>}
                        >
                            {(participante) => (
                                <LinhaDoParticipante
                                    participante={participante}
                                    souEu={participante.usuarioId === usuarioId}
                                    souDonoDaSala={souDonoDaSala}
                                    aoSair={sair}
                                />
                            )}
                        </TabelaPaginada>
                        {souDonoDaSala && <p className="sala__recado">Quem criou a sala não sai dela. Para acabar com a sala, apague a sala na lista de salas.</p>}
                        {sala && dosParticipantes.situacao === "pronta" && (
                            <p className="sala__entrar">
                                <Link to={`/salas/${sala.id}/partida`} className="botao">
                                    {IR_PARA_A_PARTIDA[sala.situacao]}
                                </Link>
                            </p>
                        )}
                        {sala && dosParticipantes.situacao === "pronta" && <Convite sala={sala} />}
                    </>
                )}
            </main>
        </div>
    );
}
