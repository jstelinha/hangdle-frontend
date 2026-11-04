import { Link, useNavigate } from "react-router-dom";
import { useSessao } from "../sessao/contexto";
import { encerrarSessao } from "../sessao/sessao";
import { Logotipo } from "./Logotipo";
import "./Cabecalho.css";

export function Cabecalho() {
    const navegar = useNavigate();
    const sessao = useSessao();

    function sair() {
        encerrarSessao();
        navegar("/login", { replace: true });
    }

    return (
        <header className="cabecalho">
            <Link to="/" className="cabecalho__marca">
                <Logotipo />
            </Link>
            {sessao ? (
                <div className="cabecalho__usuario">
                    <Link to="/estatisticas" className="cabecalho__link">
                        Estatísticas
                    </Link>
                    <span className="cabecalho__nome">{sessao.usuario.nome}</span>
                    <button type="button" className="botao botao--discreto" onClick={sair}>
                        Sair
                    </button>
                </div>
            ) : (
                <nav className="cabecalho__usuario" aria-label="Conta">
                    <Link to="/login" className="botao botao--discreto">
                        Entrar
                    </Link>
                    <Link to="/cadastro" className="botao botao--discreto">
                        Criar conta
                    </Link>
                </nav>
            )}
        </header>
    );
}
