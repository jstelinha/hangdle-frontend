import { Link, useNavigate } from "react-router-dom";
import { encerrarSessao, lerSessao } from "../sessao/sessao";
import { Logotipo } from "./Logotipo";
import "./Cabecalho.css";

export function Cabecalho() {
    const navegar = useNavigate();
    const sessao = lerSessao();

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
