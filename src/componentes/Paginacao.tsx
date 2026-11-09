import { Link, Navigate, useLocation } from "react-router-dom";
import "./Paginacao.css";

type Props = {
    pagina: number;
    totalDePaginas: number;
};

type PropsDoLink = {
    caminho: string;
    pagina: number;
    ativo: boolean;
    children: string;
};

function endereco(caminho: string, pagina: number) {
    return { pathname: caminho, search: pagina > 1 ? `?pagina=${pagina}` : "" };
}

function IrPara({ caminho, pagina, ativo, children }: PropsDoLink) {
    if (!ativo) {
        return (
            <span className="botao botao--discreto paginacao__desligado" aria-disabled="true">
                {children}
            </span>
        );
    }
    return (
        <Link to={endereco(caminho, pagina)} className="botao botao--discreto">
            {children}
        </Link>
    );
}

// Rubrica de Front-end - Cruds Completos - Paginação das listagens
export function Paginacao({ pagina, totalDePaginas }: Props) {
    const { pathname } = useLocation();
    const ultima = Math.max(1, totalDePaginas);

    // Uma página que deixou de existir, como a última depois de apagar o único item dela.
    if (pagina > ultima) {
        return <Navigate to={endereco(pathname, ultima)} replace />;
    }
    if (ultima === 1) {
        return null;
    }
    return (
        <nav className="paginacao" aria-label="Páginas">
            <IrPara caminho={pathname} pagina={pagina - 1} ativo={pagina > 1}>
                Anterior
            </IrPara>
            <span className="paginacao__atual">
                Página {pagina} de {ultima}
            </span>
            <IrPara caminho={pathname} pagina={pagina + 1} ativo={pagina < ultima}>
                Próxima
            </IrPara>
        </nav>
    );
}
