import { Fragment, type ReactNode } from "react";
import type { Carregamento } from "../hooks/useCarregamento";
import type { Pagina } from "../types/pagina";
import { Aviso } from "./Aviso";
import { Paginacao } from "./Paginacao";
import "./TabelaPaginada.css";

export type Coluna = {
    titulo: string;
    tipo?: "texto" | "numero" | "acoes";
};

type Props<T> = {
    carregamento: Carregamento<Pagina<T>>;
    legenda: (total: number) => string;
    colunas: Coluna[];
    carregando: string;
    vazia: ReactNode;
    children: (item: T) => ReactNode;
};

function Cabeca({ coluna }: { coluna: Coluna }) {
    if (coluna.tipo === "acoes") {
        return (
            <th scope="col" className="tabela__acoes">
                <span className="so-leitor">{coluna.titulo}</span>
            </th>
        );
    }
    return (
        <th scope="col" className={coluna.tipo === "numero" ? "numero" : undefined}>
            {coluna.titulo}
        </th>
    );
}

// Rubrica de Front-end - Componentização - Componentes genéricos e reutilizáveis
// A listagem dos CRUDs: carregando, erro, nenhum item, a tabela e as páginas.
export function TabelaPaginada<T extends { id: number }>({ carregamento, legenda, colunas, carregando, vazia, children }: Props<T>) {
    if (carregamento.situacao === "carregando") {
        return (
            <p role="status" className="tabela-paginada__recado">
                {carregando}
            </p>
        );
    }
    if (carregamento.situacao === "falhou") {
        return <Aviso mensagem={carregamento.mensagem} />;
    }

    const { itens, pagina, total, totalDePaginas } = carregamento.dados;
    return (
        <>
            {itens.length === 0 ? (
                <div className="tabela-paginada__recado">{vazia}</div>
            ) : (
                <table className="tabela tabela-paginada">
                    <caption>{legenda(total)}</caption>
                    <thead>
                        <tr>
                            {colunas.map((coluna) => (
                                <Cabeca key={coluna.titulo} coluna={coluna} />
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {itens.map((item) => (
                            <Fragment key={item.id}>{children(item)}</Fragment>
                        ))}
                    </tbody>
                </table>
            )}
            <Paginacao pagina={pagina} totalDePaginas={totalDePaginas} />
        </>
    );
}
