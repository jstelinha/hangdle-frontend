import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSessao } from "../sessao/contexto";
import { encerrarSessao } from "../sessao/sessao";
import { Logotipo } from "./Logotipo";
import "./Cabecalho.css";

function Menu() {
    return (
        <nav className="cabecalho__menu" aria-label="Principal">
            <NavLink to="/jogo">Jogar</NavLink>
            <NavLink to="/salas">Salas</NavLink>
            <NavLink to="/listas">Listas</NavLink>
            <NavLink to="/estatisticas">Estatísticas</NavLink>
        </nav>
    );
}

export function Cabecalho() {
    const navegar = useNavigate();
    const sessao = useSessao();

    function sair() {
        encerrarSessao();
        navegar("/login", { replace: true });
    }

    return (
        <header className="cabecalho">
            <div className="cabecalho__linha">
                <Link to="/" className="cabecalho__marca">
                    <Logotipo />
                </Link>
                {sessao ? (
                    <div className="cabecalho__usuario">
                        <Link to="/perfil" className="cabecalho__nome" title="Seu perfil">
                            {sessao.usuario.nome}
                        </Link>
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
            </div>
            {sessao && <Menu />}
        </header>
    );
}
