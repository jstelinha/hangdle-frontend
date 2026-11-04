import { Link } from "react-router-dom";
import { Cabecalho } from "../componentes/Cabecalho";
import { Logotipo } from "../componentes/Logotipo";
import { useSessao } from "../sessao/contexto";
import "./Inicio.css";

export function InicioPage() {
    const sessao = useSessao();

    return (
        <div className="pagina">
            <Cabecalho />
            <main className="pagina__conteudo inicio">
                <Logotipo tamanho="grande" />
                <h1 className="titulo">A forca de todo dia</h1>
                <p className="subtitulo">
                    Uma palavra por dia, a mesma para todo mundo. Chute uma letra por vez antes de o boneco ficar completo.
                </p>
                <nav className="inicio__acoes" aria-label="Começar">
                    <Link to="/jogo" className="botao">
                        Jogar
                    </Link>
                    {!sessao && (
                        <>
                            <Link to="/login" className="botao botao--discreto">
                                Entrar
                            </Link>
                            <Link to="/cadastro" className="botao botao--discreto">
                                Criar conta
                            </Link>
                        </>
                    )}
                </nav>
                <p className="inicio__dica">
                    {sessao
                        ? `Olá, ${sessao.usuario.nome}. Seus resultados ficam guardados na sua conta.`
                        : "Sem conta você joga normalmente. Com conta, seus resultados ficam guardados."}
                </p>
            </main>
        </div>
    );
}
