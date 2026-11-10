import { useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { traduzirErro } from "../api/erros";
import { salas } from "../api/salas";
import { AcoesDaLinha } from "../componentes/AcoesDaLinha";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { TabelaPaginada, type Coluna } from "../componentes/TabelaPaginada";
import { TopoDaPagina } from "../componentes/TopoDaPagina";
import { useAvisoDaNavegacao } from "../hooks/useAvisoDaNavegacao";
import { useListagem } from "../hooks/useListagem";
import { useSessao } from "../sessao/contexto";
import { resumoDaSala } from "../salas/descricao";
import type { FiltroDasSalas, Sala } from "../types/sala";
import "./Salas.css";

const COLUNAS: Coluna[] = [{ titulo: "Sala" }, { titulo: "Jogadores", tipo: "numero" }, { titulo: "Ações", tipo: "acoes" }];

const ABAS: { filtro: FiltroDasSalas; rotulo: string; endereco: string }[] = [
    { filtro: "abertas", rotulo: "Abertas", endereco: "/salas" },
    { filtro: "minhas", rotulo: "As minhas", endereco: "/salas?filtro=minhas" },
];

function legenda(total: number): string {
    return total === 1 ? "1 sala" : `${total} salas`;
}

function AbasDasSalas({ filtro }: { filtro: FiltroDasSalas }) {
    return (
        <nav className="salas__abas" aria-label="Quais salas">
            {ABAS.map((aba) => (
                <Link key={aba.filtro} to={aba.endereco} className="salas__aba" aria-current={aba.filtro === filtro ? "page" : undefined}>
                    {aba.rotulo}
                </Link>
            ))}
        </nav>
    );
}

type PropsDaLinha = {
    sala: Sala;
    ehDono: boolean;
    aoApagar: (sala: Sala) => Promise<void>;
};

// Rubrica de Front-end - Componentização - Componentes exclusivos de uma página em funções separadas
function LinhaDaSala({ sala, ehDono, aoApagar }: PropsDaLinha) {
    return (
        <tr>
            <td>
                <Link to={`/salas/${sala.id}`} className="salas__nome">
                    {sala.nome}
                </Link>
                <span className="salas__resumo">{resumoDaSala(sala)}</span>
            </td>
            <td className="numero">
                {sala.jogadores} de {sala.maximoDeJogadores}
            </td>
            <td className="tabela__acoes">
                {ehDono && (
                    <AcoesDaLinha
                        nome={sala.nome}
                        editarEm={sala.situacao === "esperando" ? `/salas/${sala.id}/editar` : undefined}
                        aoApagar={() => aoApagar(sala)}
                    />
                )}
            </td>
        </tr>
    );
}

// Rubrica de Front-end - Cruds Completos - Listagem e cadastro/edição em telas separadas
export function SalasPage() {
    const usuarioId = useSessao()?.usuario.id;
    const [parametros] = useSearchParams();
    const filtro: FiltroDasSalas = parametros.get("filtro") === "minhas" ? "minhas" : "abertas";
    const listar = useCallback((pagina: number) => salas.listar(pagina, { filtro }), [filtro]);
    const { carregamento, recarregar } = useListagem(listar);
    const [aviso, setAviso] = useAvisoDaNavegacao();

    async function apagar(sala: Sala) {
        try {
            await salas.apagar(sala.id);
            setAviso({ tipo: "sucesso", mensagem: `A sala ${sala.nome} foi apagada.` });
            recarregar();
        } catch (erro) {
            setAviso({ tipo: "erro", mensagem: traduzirErro(erro).mensagem });
        }
    }

    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo">
                <TopoDaPagina titulo="Salas" subtitulo="Forca com outras pessoas: a cada rodada, alguém escolhe a palavra e o resto adivinha.">
                    <Link to="/salas/nova" className="botao">
                        Nova sala
                    </Link>
                </TopoDaPagina>

                <AbasDasSalas filtro={filtro} />
                <Aviso mensagem={aviso?.mensagem ?? null} tipo={aviso?.tipo} />

                <TabelaPaginada
                    carregamento={carregamento}
                    legenda={legenda}
                    colunas={COLUNAS}
                    carregando="Carregando as salas..."
                    vazia={
                        <p>
                            {filtro === "abertas" ? "Nenhuma sala aberta agora." : "Você ainda não está em nenhuma sala."}{" "}
                            <Link to="/salas/nova">Criar uma sala</Link>
                        </p>
                    }
                >
                    {(sala) => <LinhaDaSala sala={sala} ehDono={sala.donoId === usuarioId} aoApagar={apagar} />}
                </TabelaPaginada>
            </main>
        </div>
    );
}
