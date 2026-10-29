import { Link } from "react-router-dom";
import { Cabecalho } from "../componentes/Cabecalho";

export function NotFoundPage() {
    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo">
                <h1 className="titulo">Página não encontrada</h1>
                <p className="subtitulo">O endereço digitado não existe no Hangdle.</p>
                <p className="secao">
                    <Link to="/">Voltar para o início</Link>
                </p>
            </main>
        </div>
    );
}
