import { useCallback, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { traduzirErro } from "../api/erros";
import { listas, palavrasDaLista } from "../api/listas";
import { AcoesDaLinha } from "../componentes/AcoesDaLinha";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { TabelaPaginada, type Coluna } from "../componentes/TabelaPaginada";
import { TopoDaPagina } from "../componentes/TopoDaPagina";
import { useAvisoDaNavegacao } from "../hooks/useAvisoDaNavegacao";
import { useCarregamento } from "../hooks/useCarregamento";
import { useListagem } from "../hooks/useListagem";
import type { PalavraDaLista } from "../types/lista";
import "./Palavras.css";

const COLUNAS: Coluna[] = [{ titulo: "Palavra" }, { titulo: "Dica" }, { titulo: "Ações", tipo: "acoes" }];

function legenda(total: number): string {
    return total === 1 ? "1 palavra" : `${total} palavras`;
}

type PropsDaLinha = {
    palavra: PalavraDaLista;
    aoApagar: (palavra: PalavraDaLista) => Promise<void>;
};

// Rubrica de Front-end - Componentização - Componentes exclusivos de uma página em funções separadas
function LinhaDaPalavra({ palavra, aoApagar }: PropsDaLinha) {
    return (
        <tr>
            <td className="palavras__palavra">{palavra.palavra}</td>
            <td>{palavra.dica ?? <span className="palavras__sem-dica">Sem dica</span>}</td>
            <td className="tabela__acoes">
                <AcoesDaLinha
                    nome={palavra.palavra}
                    editarEm={`/listas/${palavra.listaId}/palavras/${palavra.id}/editar`}
                    aoApagar={() => aoApagar(palavra)}
                />
            </td>
        </tr>
    );
}

// Rubrica de Front-end - Cruds Completos - Listagem e cadastro/edição em telas separadas
export function PalavrasPage() {
    const listaId = Number(useParams().listaId);
    const palavras = useMemo(() => palavrasDaLista(listaId), [listaId]);
    const { carregamento, recarregar } = useListagem(palavras.listar);
    const lista = useCarregamento(useCallback(() => listas.buscar(listaId), [listaId])).carregamento;
    const [aviso, setAviso] = useAvisoDaNavegacao();

    async function apagar(palavra: PalavraDaLista) {
        try {
            await palavras.apagar(palavra.id);
            setAviso({ tipo: "sucesso", mensagem: `A palavra ${palavra.palavra} foi apagada.` });
            recarregar();
        } catch (erro) {
            setAviso({ tipo: "erro", mensagem: traduzirErro(erro).mensagem });
        }
    }

    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo">
                <TopoDaPagina
                    titulo={lista.situacao === "pronta" ? lista.dados.nome : "Palavras da lista"}
                    subtitulo="As palavras da lista, em ordem alfabética. A dica ajuda quem vai adivinhar."
                    voltar={{ para: "/listas", rotulo: "Suas listas" }}
                >
                    {lista.situacao === "pronta" && (
                        <Link to={`/listas/${listaId}/palavras/nova`} className="botao">
                            Nova palavra
                        </Link>
                    )}
                </TopoDaPagina>

                <Aviso mensagem={aviso?.mensagem ?? null} tipo={aviso?.tipo} />

                <TabelaPaginada
                    carregamento={carregamento}
                    legenda={legenda}
                    colunas={COLUNAS}
                    carregando="Carregando as palavras..."
                    vazia={
                        <p>
                            Esta lista ainda não tem palavras. <Link to={`/listas/${listaId}/palavras/nova`}>Acrescentar a primeira</Link>
                        </p>
                    }
                >
                    {(palavra) => <LinhaDaPalavra palavra={palavra} aoApagar={apagar} />}
                </TabelaPaginada>
            </main>
        </div>
    );
}
