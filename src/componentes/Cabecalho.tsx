import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useSessao } from "../sessao/contexto";
import { encerrarSessao } from "../sessao/sessao";
import { Dialogo } from "./Dialogo";
import { Logotipo } from "./Logotipo";
import "./Cabecalho.css";

const VOLTAR_PARA_AS_SALAS = { voltarPara: "/salas", pedeConta: true };
// O Entrar do cabeçalho volta para onde a pessoa estava, menos do próprio login ou do cadastro.
const SEM_VOLTA = ["/login", "/cadastro"];

function MenuDaConta() {
    const navegar = useNavigate();

    function sair() {
        encerrarSessao();
        navegar("/login", { replace: true });
    }

    return (
        <>
            <nav className="cabecalho__menu" aria-label="Principal">
                <NavLink to="/salas" className="cabecalho__item">
                    Salas
                </NavLink>
                <NavLink to="/listas" className="cabecalho__item">
                    Listas
                </NavLink>
                <NavLink to="/estatisticas" className="cabecalho__item">
                    Estatísticas
                </NavLink>
            </nav>
            <div className="cabecalho__conta">
                <NavLink to="/perfil" className="cabecalho__item">
                    Perfil
                </NavLink>
                <button type="button" className="botao botao--discreto" onClick={sair}>
                    Sair
                </button>
            </div>
        </>
    );
}

// Quem não tem conta também vê as salas no menu, para saber que existem. Como elas pedem conta, o clique abre o
// recado com os caminhos para entrar ou criar uma, e o login leva de volta para as salas.
function MenuDoVisitante() {
    const [aberto, setAberto] = useState(false);
    const { pathname, search } = useLocation();
    const voltar = SEM_VOLTA.includes(pathname) ? undefined : { voltarPara: `${pathname}${search}` };

    return (
        <>
            <nav className="cabecalho__menu" aria-label="Principal">
                <button type="button" className="cabecalho__item" aria-haspopup="dialog" onClick={() => setAberto(true)}>
                    Salas
                </button>
            </nav>
            <div className="cabecalho__conta">
                <Link to="/login" state={voltar} className="botao botao--discreto">
                    Entrar
                </Link>
            </div>
            <Dialogo aberto={aberto} titulo="Faça login para jogar online" aoFechar={() => setAberto(false)}>
                <p className="cabecalho__recado">
                    Nas salas, você joga forca com outras pessoas: a cada rodada, alguém escolhe a palavra e o resto adivinha. Para
                    criar uma sala ou entrar numa, você precisa de uma conta.
                </p>
                <div className="cabecalho__acoes">
                    <Link to="/login" state={VOLTAR_PARA_AS_SALAS} className="botao">
                        Entrar
                    </Link>
                    <Link to="/cadastro" state={VOLTAR_PARA_AS_SALAS} className="botao botao--discreto">
                        Criar conta
                    </Link>
                </div>
            </Dialogo>
        </>
    );
}

// Uma linha só: o logotipo leva para a palavra do dia (é o "Jogar"), e o resto fica à direita. No celular, quem tem
// conta fica com o nome e o Sair ao lado do logotipo, e os links descem para a linha de baixo.
export function Cabecalho() {
    const sessao = useSessao();

    return (
        <header className="cabecalho">
            <div className={sessao ? "cabecalho__linha cabecalho__linha--conta" : "cabecalho__linha"}>
                <NavLink to="/jogo" className="cabecalho__marca" title="Jogar a palavra do dia">
                    <Logotipo />
                </NavLink>
                {sessao ? <MenuDaConta /> : <MenuDoVisitante />}
            </div>
        </header>
    );
}
