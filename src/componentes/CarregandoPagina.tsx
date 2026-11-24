import { Cabecalho } from "./Cabecalho";
import "./Carregado.css";

type Props = {
    recado: string;
};

// O que aparece enquanto chega o código de uma página carregada só quando alguém abre (React.lazy).
export function CarregandoPagina({ recado }: Props) {
    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo">
                <p role="status" className="carregado__recado">
                    {recado}
                </p>
            </main>
        </div>
    );
}
