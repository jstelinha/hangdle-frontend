import { Link } from "react-router-dom";
import { Cabecalho } from "../componentes/Cabecalho";
import { useTituloDaPagina } from "../hooks/useTituloDaPagina";

export function NotFoundPage() {
    useTituloDaPagina("Página não encontrada");
    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo">
                <h1 className="titulo">Página não encontrada</h1>
                <p className="subtitulo">O endereço digitado não existe no Hangdle.</p>
                <p className="secao">
                    <Link to="/jogo">Ir para a palavra do dia</Link>
                </p>
            </main>
        </div>
    );
}
