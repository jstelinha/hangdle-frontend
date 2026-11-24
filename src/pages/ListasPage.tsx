import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";
import { traduzirErro } from "../api/erros";
import { listas } from "../api/listas";
import { buscarListasProntas, copiarListaPronta } from "../api/listasProntas";
import { AcoesDaLinha } from "../componentes/AcoesDaLinha";
import { Aviso } from "../componentes/Aviso";
import { Cabecalho } from "../componentes/Cabecalho";
import { Carregado } from "../componentes/Carregado";
import { TabelaPaginada, type Coluna } from "../componentes/TabelaPaginada";
import { TopoDaPagina } from "../componentes/TopoDaPagina";
import { useAvisoDaNavegacao } from "../hooks/useAvisoDaNavegacao";
import { useCarregamento } from "../hooks/useCarregamento";
import { useFocoNoAviso } from "../hooks/useFocoNoAviso";
import { useListagem } from "../hooks/useListagem";
import type { Lista, ListaPronta } from "../types/lista";
import "./Listas.css";

const COLUNAS: Coluna[] = [{ titulo: "Nome" }, { titulo: "Palavras", tipo: "numero" }, { titulo: "Ações", tipo: "acoes" }];

function legenda(total: number): string {
    return total === 1 ? "1 lista" : `${total} listas`;
}

// Rubrica de Front-end - Componentização - Componentes exclusivos de uma página em funções separadas
// A pergunta diz o que se perde: as palavras vão junto com a lista.
function perguntaDeApagar(lista: Lista): string {
    if (lista.totalDePalavras === 0) {
        return `Apagar ${lista.nome}?`;
    }
    return lista.totalDePalavras === 1 ? `Apagar ${lista.nome} e a palavra dela?` : `Apagar ${lista.nome} e as ${lista.totalDePalavras} palavras dela?`;
}

function LinhaDaLista({ lista, aoApagar }: { lista: Lista; aoApagar: (lista: Lista) => Promise<void> }) {
    return (
        <tr>
            <td>
                <Link to={`/listas/${lista.id}/palavras`}>{lista.nome}</Link>
            </td>
            <td className="numero">{lista.totalDePalavras}</td>
            <td className="tabela__acoes">
                <AcoesDaLinha
                    nome={lista.nome}
                    editarEm={`/listas/${lista.id}/editar`}
                    aoApagar={() => aoApagar(lista)}
                    pergunta={perguntaDeApagar(lista)}
                />
            </td>
        </tr>
    );
}

function palavras(total: number): string {
    return total === 1 ? "1 palavra" : `${total} palavras`;
}

// As listas prontas, iguais para todo mundo: a pessoa adiciona uma às próprias listas (uma cópia, que ela edita como
// quiser) e já tem palavras para jogar nas salas.
function ListasProntas({ aoAdicionar }: { aoAdicionar: (lista: ListaPronta) => Promise<void> }) {
    const { carregamento } = useCarregamento(buscarListasProntas);
    const [adicionando, setAdicionando] = useState<number | null>(null);

    async function adicionar(lista: ListaPronta) {
        setAdicionando(lista.id);
        try {
            await aoAdicionar(lista);
        } finally {
            setAdicionando(null);
        }
    }

    return (
        <section className="secao" aria-labelledby="titulo-listas-prontas">
            <h2 id="titulo-listas-prontas" className="secao__titulo">
                Listas prontas
            </h2>
            <p className="subtitulo">Adicione uma lista pronta às suas listas. Depois, é só editar como quiser.</p>
            <Carregado carregamento={carregamento} carregando="Carregando as listas prontas...">
                {(prontas) => (
                    <ul className="listas-prontas">
                        {prontas.map((lista) => (
                            <li key={lista.id} className="listas-prontas__item">
                                <span className="listas-prontas__dados">
                                    <span className="listas-prontas__nome">{lista.nome}</span>
                                    <span className="listas-prontas__total">{palavras(lista.totalDePalavras)}</span>
                                </span>
                                <button
                                    type="button"
                                    className="botao botao--discreto"
                                    aria-label={`Adicionar ${lista.nome} às suas listas`}
                                    disabled={adicionando !== null}
                                    aria-busy={adicionando === lista.id}
                                    onClick={() => void adicionar(lista)}
                                >
                                    {adicionando === lista.id ? "Adicionando..." : "Adicionar"}
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </Carregado>
        </section>
    );
}

function recadoDaCopiaRecusada(erro: unknown, lista: ListaPronta): string {
    if (axios.isAxiosError(erro) && erro.response?.status === 409) {
        return `Você já tem uma lista chamada ${lista.nome}. Para adicionar de novo, mude o nome dela.`;
    }
    return traduzirErro(erro).mensagem;
}

// Rubrica de Front-end - Cruds Completos - Listagem e cadastro/edição em telas separadas
export function ListasPage() {
    const { carregamento, recarregar } = useListagem(listas.listar);
    const [aviso, setAviso] = useAvisoDaNavegacao();
    const { refDoAviso, focarNoAviso } = useFocoNoAviso(aviso);

    async function apagar(lista: Lista) {
        focarNoAviso();
        try {
            await listas.apagar(lista.id);
            setAviso({ tipo: "sucesso", mensagem: `A lista ${lista.nome} foi apagada, com as palavras dela.` });
            recarregar();
        } catch (erro) {
            setAviso({ tipo: "erro", mensagem: traduzirErro(erro).mensagem });
        }
    }

    async function adicionarPronta(pronta: ListaPronta) {
        focarNoAviso();
        try {
            const nova = await copiarListaPronta(pronta.id);
            setAviso({ tipo: "sucesso", mensagem: `A lista ${nova.nome} entrou nas suas listas, com ${palavras(nova.totalDePalavras)}.` });
            recarregar();
        } catch (erro) {
            setAviso({ tipo: "erro", mensagem: recadoDaCopiaRecusada(erro, pronta) });
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

                <Aviso ref={refDoAviso} mensagem={aviso?.mensagem ?? null} tipo={aviso?.tipo} />

                <TabelaPaginada
                    carregamento={carregamento}
                    legenda={legenda}
                    colunas={COLUNAS}
                    carregando="Carregando as suas listas..."
                    vazia={
                        <p>
                            Você ainda não tem listas. <Link to="/listas/nova">Crie a primeira</Link> ou adicione uma das listas prontas, logo
                            abaixo.
                        </p>
                    }
                >
                    {(lista) => <LinhaDaLista lista={lista} aoApagar={apagar} />}
                </TabelaPaginada>

                <ListasProntas aoAdicionar={adicionarPronta} />
            </main>
        </div>
    );
}
