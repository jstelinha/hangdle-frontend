import { Link } from "react-router-dom";
import { traduzirErro } from "../api/erros";
import { listas } from "../api/listas";
import { AcoesDaLinha } from "../componentes/AcoesDaLinha";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { TabelaPaginada, type Coluna } from "../componentes/TabelaPaginada";
import { TopoDaPagina } from "../componentes/TopoDaPagina";
import { useAvisoDaNavegacao } from "../hooks/useAvisoDaNavegacao";
import { useListagem } from "../hooks/useListagem";
import type { Lista } from "../types/lista";

const COLUNAS: Coluna[] = [{ titulo: "Nome" }, { titulo: "Palavras", tipo: "numero" }, { titulo: "Ações", tipo: "acoes" }];

function legenda(total: number): string {
    return total === 1 ? "1 lista" : `${total} listas`;
}

// Rubrica de Front-end - Componentização - Componentes exclusivos de uma página em funções separadas
function LinhaDaLista({ lista, aoApagar }: { lista: Lista; aoApagar: (lista: Lista) => Promise<void> }) {
    return (
        <tr>
            <td>
                <Link to={`/listas/${lista.id}/palavras`}>{lista.nome}</Link>
            </td>
            <td className="numero">{lista.totalDePalavras}</td>
            <td className="tabela__acoes">
                <AcoesDaLinha nome={lista.nome} editarEm={`/listas/${lista.id}/editar`} aoApagar={() => aoApagar(lista)} />
            </td>
        </tr>
    );
}

// Rubrica de Front-end - Cruds Completos - Listagem e cadastro/edição em telas separadas
export function ListasPage() {
    const { carregamento, recarregar } = useListagem(listas.listar);
    const [aviso, setAviso] = useAvisoDaNavegacao();

    async function apagar(lista: Lista) {
        try {
            await listas.apagar(lista.id);
            setAviso({ tipo: "sucesso", mensagem: `A lista ${lista.nome} foi apagada, com as palavras dela.` });
            recarregar();
        } catch (erro) {
            setAviso({ tipo: "erro", mensagem: traduzirErro(erro).mensagem });
        }
    }

    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo">
                <TopoDaPagina titulo="Suas listas" subtitulo="Palavras para jogar nas salas. Cada palavra pode ter uma dica.">
                    <Link to="/listas/nova" className="botao">
                        Nova lista
                    </Link>
                </TopoDaPagina>

                <Aviso mensagem={aviso?.mensagem ?? null} tipo={aviso?.tipo} />

                <TabelaPaginada
                    carregamento={carregamento}
                    legenda={legenda}
                    colunas={COLUNAS}
                    carregando="Carregando as suas listas..."
                    vazia={
                        <p>
                            Você ainda não tem listas. <Link to="/listas/nova">Criar a primeira</Link>
                        </p>
                    }
                >
                    {(lista) => <LinhaDaLista lista={lista} aoApagar={apagar} />}
                </TabelaPaginada>
            </main>
        </div>
    );
}
