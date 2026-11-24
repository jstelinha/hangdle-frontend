import { Link, Navigate, useLocation } from "react-router-dom";
import "./Paginacao.css";

type Props = {
    pagina: number;
    totalDePaginas: number;
};

type Endereco = {
    pathname: string;
    search: string;
};

type PropsDoLink = {
    atual: Endereco;
    pagina: number;
    ativo: boolean;
    children: string;
};

// Troca só a página e mantém o resto do endereço, como o ?filtro=minhas das salas.
function endereco({ pathname, search }: Endereco, pagina: number): Endereco {
    const parametros = new URLSearchParams(search);
    if (pagina > 1) {
        parametros.set("pagina", String(pagina));
    } else {
        parametros.delete("pagina");
    }
    const busca = parametros.toString();
    return { pathname, search: busca ? `?${busca}` : "" };
}

function IrPara({ atual, pagina, ativo, children }: PropsDoLink) {
    if (!ativo) {
        return (
            <span className="botao botao--discreto paginacao__desligado" aria-disabled="true">
                {children}
            </span>
        );
    }
    return (
        <Link to={endereco(atual, pagina)} className="botao botao--discreto">
            {children}
        </Link>
    );
}

// Rubrica de Front-end - Cruds Completos - Paginação das listagens
export function Paginacao({ pagina, totalDePaginas }: Props) {
    const { pathname, search } = useLocation();
    const atual = { pathname, search };
    const ultima = Math.max(1, totalDePaginas);

    // Uma página que deixou de existir, como a última depois de apagar o único item dela.
    if (pagina > ultima) {
        return <Navigate to={endereco(atual, ultima)} replace />;
    }
    if (ultima === 1) {
        return null;
    }
    return (
        <nav className="paginacao" aria-label="Páginas">
            <IrPara atual={atual} pagina={pagina - 1} ativo={pagina > 1}>
                Anterior
            </IrPara>
            <span className="paginacao__atual">
                Página {pagina} de {ultima}
            </span>
            <IrPara atual={atual} pagina={pagina + 1} ativo={pagina < ultima}>
                Próxima
            </IrPara>
        </nav>
    );
}
